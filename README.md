# Candidate AI Chatbot

An AI-powered portfolio chatbot that represents **Mrinmoy Kumar Maity**. Recruiters can ask questions about the candidate, download the resume, generate interview questions, compare the resume with a Job Description, and receive answers in multiple languages.

## Features

- Resume-grounded AI chat
- Streaming AI responses
- Upload a new PDF resume without changing code
- Download the current resume
- Voice input using Speech-to-Text
- AI voice output using Text-to-Speech
- Resume-based interview question generation
- Job Description suitability score from 0 to 100%
- “Why should we hire this candidate?” mode
- English, Hindi, and Bengali support
- Browser-based conversation history
- Export chat as a PDF
- Responsive desktop and mobile design

## Technology Stack

### Backend

- Python
- FastAPI
- Groq API
- Pydantic
- PyPDF
- Uvicorn

### Frontend

- React
- Vite
- JavaScript
- CSS
- Web Speech API
- jsPDF
- html2canvas

## Project Structure

```text
candidate-ai-chatbot/
├── Backhend/
│   ├── data/
│   ├── candidate_data.json
│   ├── main.py
│   ├── models.py
│   ├── my_resume_new.pdf
│   ├── requirements.txt
│   └── .env
├── Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

> The backend folder is currently named `Backhend`. Use this exact spelling while running or deploying the project.

## Prerequisites

Install the following software:

- Python 3.10 or newer
- Node.js 18 or newer
- Git
- A Groq API key

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/mrinmoykumarmaity/candidate-ai-chatbot.git
cd candidate-ai-chatbot
```

### 2. Backend setup

Open the backend folder:

```powershell
cd Backhend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate the environment:

```powershell
.\venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Create a `.env` file inside the `Backhend` folder:

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
PUBLIC_BASE_URL=http://127.0.0.1:8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start the FastAPI backend:

```powershell
python -m uvicorn main:app --reload --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend setup

Open another VS Code terminal from the project root:

```powershell
cd Frontend
```

Install frontend dependencies:

```powershell
npm install
```

Start the frontend:

```powershell
npm run dev
```

Open the application:

```text
http://localhost:5173
```

## Environment Variables

### Backend environment variables

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Authenticates requests to the Groq API |
| `GROQ_MODEL` | Selects the Groq-hosted LLM |
| `PUBLIC_BASE_URL` | Backend URL used for resume download links |
| `CORS_ORIGINS` | Frontend URLs permitted to access the backend |

### Frontend environment variable

For deployment, create `Frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Backend information |
| `GET` | `/health` | Check backend status |
| `GET` | `/profile` | Get the candidate profile |
| `POST` | `/ask` | Ask questions about the candidate |
| `POST` | `/resume` | Upload and activate a PDF resume |
| `GET` | `/resume` | Download the active resume |
| `POST` | `/interview-questions` | Generate interview questions |
| `POST` | `/match` | Calculate Job Description match score |
| `POST` | `/why-hire` | Generate a recruiter-facing hiring answer |

## Deploy Backend on Render

Create a new Render Web Service using these settings:

| Setting | Value |
|---|---|
| Root Directory | `Backhend` |
| Language | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

Add the following Render environment variables:

```text
GROQ_API_KEY=your_actual_groq_api_key
PYTHON_VERSION=3.12.13
PUBLIC_BASE_URL=https://your-backend.onrender.com
CORS_ORIGINS=https://your-frontend.vercel.app
```

## Deploy Frontend on Vercel

Import the same GitHub repository into Vercel.

Use these settings:

| Setting | Value |
|---|---|
| Root Directory | `Frontend` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add this Vercel environment variable:

```text
VITE_API_URL=https://your-backend.onrender.com
```

Replace the example URL with your actual Render backend URL.

## Security

- Never upload the backend `.env` file to GitHub.
- Never put the Groq API key inside frontend code.
- Keep the repository private if it contains personal information.
- Review your resume before making the deployed application public.
- Keep `venv`, `.venv`, `node_modules`, and `dist` out of Git.

## Candidate

**Mrinmoy Kumar Maity**

Aspiring AI Engineer focused on Python, machine learning, generative AI, LLMs, RAG, AI agents, and data analytics.

- [LinkedIn](https://www.linkedin.com/in/mrinmoykumarmaity/)
- [GitHub](https://github.com/mrinmoykumarmaity)
- [Portfolio](https://portfolio-website-eta-eight-93.vercel.app/)

## License

This project is intended for portfolio and educational use.
