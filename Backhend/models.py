from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


LanguageCode = Literal["en", "hi", "bn"]


class CandidateProfile(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    title: str = "Candidate"
    headline: str = ""
    summary: str = ""
    professional_summary: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""

    skills: Any = Field(default_factory=dict)
    education: list[Any] = Field(default_factory=list)
    projects: list[Any] = Field(default_factory=list)
    experience: list[Any] = Field(default_factory=list)
    achievements: list[Any] = Field(default_factory=list)
    certifications: list[Any] = Field(default_factory=list)
    social_links: Any = Field(default_factory=dict)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(
        min_length=1,
        max_length=12000
    )


class QuestionRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=4000
    )

    history: list[ChatMessage] = Field(
        default_factory=list
    )

    language: LanguageCode = "en"


class InterviewQuestionRequest(BaseModel):
    job_role: str = Field(
        default="AI Engineer",
        max_length=200
    )

    count: int = Field(
        default=8,
        ge=3,
        le=15
    )

    language: LanguageCode = "en"


class InterviewQuestion(BaseModel):
    question: str
    focus: str


class InterviewQuestionResult(BaseModel):
    role: str
    questions: list[InterviewQuestion]


class JobDescriptionRequest(BaseModel):
    job_description: str = Field(
        min_length=30,
        max_length=20000
    )

    language: LanguageCode = "en"


class JobMatchResult(BaseModel):
    match_score: int = Field(
        ge=0,
        le=100
    )

    verdict: str

    matched_skills: list[str] = Field(
        default_factory=list
    )

    missing_skills: list[str] = Field(
        default_factory=list
    )

    strengths: list[str] = Field(
        default_factory=list
    )

    recommendation: str


class WhyHireRequest(BaseModel):
    language: LanguageCode = "en"

    job_description: str = Field(
        default="",
        max_length=12000
    )


class TextAnswer(BaseModel):
    answer: str


class ResumeUploadResult(BaseModel):
    message: str
    filename: str
    extracted_characters: int