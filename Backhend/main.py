from __future__ import annotations

import json
import logging
import re
from contextlib import asynccontextmanager
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from threading import RLock
from typing import Iterator, TypeVar

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from groq import Groq
from pydantic import BaseModel, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict
from pypdf import PdfReader

from models import (
    CandidateProfile,
    InterviewQuestionRequest,
    InterviewQuestionResult,
    JobDescriptionRequest,
    JobMatchResult,
    QuestionRequest,
    ResumeUploadResult,
    TextAnswer,
    WhyHireRequest,
)


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("candidate_ai")

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore",
        case_sensitive=False,
    )

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    public_base_url: str = "http://127.0.0.1:8000"
    max_upload_mb: int = 8
    max_resume_chars: int = 25_000
    max_history_messages: int = 16
    max_completion_tokens: int = 900

    @property
    def cors_origin_list(self) -> list[str]:
        return [value.strip() for value in self.cors_origins.split(",") if value.strip()]

    @property
    def data_dir(self) -> Path:
        return BASE_DIR / "data"

    @property
    def active_resume_path(self) -> Path:
        return self.data_dir / "current_resume.pdf"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def load_candidate_profile() -> CandidateProfile:
    profile_path = BASE_DIR / "candidate_data.json"
    if not profile_path.exists():
        raise RuntimeError(f"candidate_data.json was not found at {profile_path}")

    try:
        data = json.loads(profile_path.read_text(encoding="utf-8"))
        return CandidateProfile.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as error:
        raise RuntimeError(f"Candidate profile is invalid: {error}") from error


candidate = load_candidate_profile()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(file_bytes))
    except Exception as error:
        raise HTTPException(status_code=400, detail="The selected file is not a readable PDF.") from error

    if reader.is_encrypted:
        raise HTTPException(status_code=400, detail="Password-protected PDFs are not supported.")

    text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    if not text:
        raise HTTPException(
            status_code=400,
            detail="No text was found. Upload a text-based PDF instead of a scanned image.",
        )
    return text


class ResumeStore:
    """Thread-safe in-memory resume text backed by one uploaded PDF."""

    def __init__(self, profile: CandidateProfile) -> None:
        self._lock = RLock()
        self._profile_text = profile.model_dump_json(indent=2)
        self._resume_text = ""
        self._original_filename = "my_resume_new.pdf"

    def load_existing(self) -> None:
        if settings.active_resume_path.exists():
            try:
                text = extract_text_from_pdf(settings.active_resume_path.read_bytes())
                self.set_resume(text, "my_resume_new.pdf")
            except HTTPException:
                logger.exception("Could not load the existing resume PDF")

    def set_resume(self, text: str, original_filename: str) -> None:
        with self._lock:
            self._resume_text = text[: settings.max_resume_chars]
            self._original_filename = original_filename

    def context(self) -> str:
        with self._lock:
            uploaded = self._resume_text
        if uploaded:
            return (
                "STRUCTURED CANDIDATE PROFILE:\n"
                f"{self._profile_text}\n\n"
                "CURRENT UPLOADED RESUME TEXT (prefer this when details conflict):\n"
                f"{uploaded}"
            )
        return f"STRUCTURED CANDIDATE PROFILE:\n{self._profile_text}"

    def filename(self) -> str:
        with self._lock:
            return self._original_filename

    def has_pdf(self) -> bool:
        return settings.active_resume_path.exists()


resume_store = ResumeStore(candidate)


@lru_cache
def get_groq_client() -> Groq:
    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is missing from backend/.env.")
    return Groq(api_key=settings.groq_api_key)


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi in natural Devanagari script",
    "bn": "Bengali in natural Bengali script",
}


def language_instruction(code: str) -> str:
    return f"Write the complete answer in {LANGUAGE_NAMES.get(code, 'English')}."


def resume_grounding_rules(language: str) -> str:
    return f"""You are the official AI representative of {candidate.name}.

Use only the candidate information supplied below. Never invent experience,
skills, education, achievements, links, dates, or personal information. If a
requested fact is absent, say clearly that it is not available in the resume.
Keep answers professional, specific, and concise. {language_instruction(language)}

{resume_store.context()}
"""


def stream_answer(request: QuestionRequest) -> Iterator[str]:
    messages = [{"role": "system", "content": resume_grounding_rules(request.language)}]
    for message in request.history[-settings.max_history_messages :]:
        messages.append({"role": message.role, "content": message.content})
    messages.append({"role": "user", "content": request.question})

    try:
        response = get_groq_client().chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=0.15,
            max_completion_tokens=settings.max_completion_tokens,
            stream=True,
        )
        for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except HTTPException:
        raise
    except Exception:
        logger.exception("Chat generation failed")
        yield "Sorry, the AI service could not generate an answer. Please try again."


def strip_json_fences(raw: str) -> str:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    return cleaned[start : end + 1] if start >= 0 and end > start else cleaned


ResultModel = TypeVar("ResultModel", bound=BaseModel)


def request_json(system_prompt: str, user_prompt: str, model: type[ResultModel]) -> ResultModel:
    client = get_groq_client()
    raw_content = ""

    for attempt in range(2):
        repair_note = ""
        if attempt == 1:
            repair_note = "\nReturn valid JSON only. Do not use markdown or add extra keys."

        try:
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt + repair_note},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.0,
                max_completion_tokens=1_200,
                stream=False,
            )
            raw_content = response.choices[0].message.content or ""
            parsed = json.loads(strip_json_fences(raw_content))
            return model.model_validate(parsed)
        except (json.JSONDecodeError, ValidationError):
            logger.warning("Invalid structured model response on attempt %s", attempt + 1)
        except Exception as error:
            logger.exception("AI request failed")
            raise HTTPException(status_code=502, detail="The AI service is currently unavailable.") from error

    logger.error("Could not validate AI JSON response: %r", raw_content[:500])
    raise HTTPException(status_code=502, detail="The AI returned an invalid response. Please retry.")


def request_text(system_prompt: str, user_prompt: str) -> str:
    try:
        response = get_groq_client().chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_completion_tokens=700,
            stream=False,
        )
        return (response.choices[0].message.content or "").strip()
    except HTTPException:
        raise
    except Exception as error:
        logger.exception("AI text request failed")
        raise HTTPException(status_code=502, detail="The AI service is currently unavailable.") from error


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    resume_store.load_existing()
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is not configured")
    logger.info("Candidate AI backend is ready")
    yield


app = FastAPI(
    title="Candidate AI Pro",
    description="Resume-grounded candidate assistant with recruiter tools",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Candidate AI Pro backend is running",
        "candidate": candidate.name,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "groq_configured": bool(settings.groq_api_key),
        "resume_uploaded": resume_store.has_pdf(),
    }


@app.get("/profile")
def get_profile():
    return candidate.model_dump()


@app.post("/resume", response_model=ResumeUploadResult)
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or "resume.pdf"
    if Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF resume.")
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    await file.close()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(file_bytes) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Resume must be smaller than {settings.max_upload_mb} MB.",
        )

    text = extract_text_from_pdf(file_bytes)
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.active_resume_path.write_bytes(file_bytes)
    resume_store.set_resume(text, Path(filename).name)

    return ResumeUploadResult(
        message="Resume uploaded. New answers now use this resume without code changes.",
        filename=Path(filename).name,
        extracted_characters=len(text),
    )


@app.get("/resume")
def download_resume():
    if not resume_store.has_pdf():
        raise HTTPException(status_code=404, detail="No resume PDF has been uploaded yet.")
    return FileResponse(
        settings.active_resume_path,
        media_type="application/pdf",
        filename=resume_store.filename(),
    )


RESUME_REQUEST_PATTERN = re.compile(
    r"\b(download|send|share|get|view|open).{0,25}\b(resume|cv)\b|\b(resume|cv)\b.{0,25}\b(download|link)\b",
    re.IGNORECASE,
)


@app.post("/ask")
def ask_candidate(request: QuestionRequest):
    if RESUME_REQUEST_PATTERN.search(request.question):
        if not resume_store.has_pdf():
            message = "No resume PDF has been uploaded yet. Use the Upload Resume button first."
        else:
            message = f"You can download the candidate's resume here: {settings.public_base_url}/resume"
        return StreamingResponse(iter([message]), media_type="text/plain")

    if not settings.groq_api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY is missing from backend/.env.")

    return StreamingResponse(
        stream_answer(request),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/interview-questions", response_model=InterviewQuestionResult)
def generate_interview_questions(request: InterviewQuestionRequest):
    system_prompt = f"""You are a technical interviewer. Use only the supplied
candidate information. Create questions that test claims actually present in
the resume, plus role-relevant fundamentals. Do not invent candidate details.
{language_instruction(request.language)}

Return exactly this JSON shape:
{{"role":"string","questions":[{{"question":"string","focus":"string"}}]}}
Return exactly {request.count} questions.

{resume_store.context()}
"""
    return request_json(
        system_prompt,
        f"Create interview questions for the role: {request.job_role}",
        InterviewQuestionResult,
    )


@app.post("/match", response_model=JobMatchResult)
def match_job_description(request: JobDescriptionRequest):
    system_prompt = f"""You are a strict recruiter evaluating one candidate
against one job description. Use only the supplied candidate information.
Never inflate the score or assume unlisted skills. Score required-skill overlap,
relevant experience, projects, and education. Treat missing required skills as
real gaps. {language_instruction(request.language)}

Return exactly this JSON shape:
{{
  "match_score": 0,
  "verdict": "string",
  "matched_skills": ["string"],
  "missing_skills": ["string"],
  "strengths": ["string"],
  "recommendation": "string"
}}

{resume_store.context()}
"""
    return request_json(
        system_prompt,
        f"JOB DESCRIPTION:\n\n{request.job_description}",
        JobMatchResult,
    )


@app.post("/why-hire", response_model=TextAnswer)
def why_hire(request: WhyHireRequest):
    system_prompt = f"""You are writing an honest recruiter-facing answer to
the question: Why should we hire this candidate? Use only the supplied candidate
information. Write one strong paragraph of 100 to 150 words. Mention concrete
skills or projects and avoid unsupported claims. {language_instruction(request.language)}

{resume_store.context()}
"""
    user_prompt = "Explain why this candidate should be hired."
    if request.job_description.strip():
        user_prompt += f" Tailor it to this job description:\n{request.job_description.strip()}"
    return TextAnswer(answer=request_text(system_prompt, user_prompt))

