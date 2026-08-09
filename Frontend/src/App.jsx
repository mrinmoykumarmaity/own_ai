import React, { useEffect, useRef, useState } from "react";

const API_BASE = "https://own-ai-cjoq.onrender.com";
const API_URL = `${API_BASE}/ask`;
const RESUME_URL = `${API_BASE}/resume`;
const STORAGE_KEY = "candidate_chat_history_v3";
const THEME_KEY = "candidate_ai_theme";

const languages = {
  en: { label: "English", speech: "en-IN" },
  hi: { label: "हिन्दी", speech: "hi-IN" },
  bn: { label: "বাংলা", speech: "bn-IN" },
};

const iconPaths = {
  plus: <><path d="M12 5v14M5 12h14" /></>,
  upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
  interview: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 4.5V3h6v1.5M8.5 9h7M8.5 13h7M8.5 17H12" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M18 6 21 3M17 3h4v4" /></>,
  sparkles: <><path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" /></>,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  file: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 13h5M10 17h5" /></>,
  message: <><path d="M5 18.5 3.5 21l4.2-1.1A9 9 0 1 0 5 18.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  language: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  volumeOn: <><path d="M5 10v4h3l4 4V6l-4 4H5Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></>,
  volumeOff: <><path d="M5 10v4h3l4 4V6l-4 4H5ZM16 10l5 5M21 10l-5 5" /></>,
  mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></>,
  stop: <><rect x="7" y="7" width="10" height="10" rx="1" /></>,
  send: <><path d="m4 12 16-8-6 16-2.5-6.5L4 12Z" /><path d="m11.5 13.5 4-4" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6H5V6h6" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" /></>,
  code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></>,
  moon: <><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.8 6.8 0 0 0 21 12.8Z" /></>,
};

function Icon({ name, size = 18, className = "" }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

const copy = {
  en: {
    placeholder: "Ask anything about Mrinmoy...",
    upload: "Upload new resume",
    interview: "Interview questions",
    match: "Job match score",
    hire: "Why hire this candidate?",
    export: "Export chat as PDF",
    jobRole: "Target job role",
    jobDescription: "Paste the full Job Description here...",
    generate: "Generate",
    analyze: "Analyze match",
  },
  hi: {
    placeholder: "Mrinmoy के बारे में कुछ पूछें...",
    upload: "नया रिज्यूमे अपलोड करें",
    interview: "इंटरव्यू प्रश्न",
    match: "जॉब मैच स्कोर",
    hire: "इस उम्मीदवार को क्यों नियुक्त करें?",
    export: "चैट को PDF में डाउनलोड करें",
    jobRole: "लक्षित नौकरी की भूमिका",
    jobDescription: "पूरा Job Description यहाँ पेस्ट करें...",
    generate: "बनाएँ",
    analyze: "मैच जाँचें",
  },
  bn: {
    placeholder: "Mrinmoy সম্পর্কে কিছু জিজ্ঞাসা করুন...",
    upload: "নতুন রেজিউমে আপলোড করুন",
    interview: "ইন্টারভিউ প্রশ্ন",
    match: "জব ম্যাচ স্কোর",
    hire: "এই প্রার্থীকে কেন নিয়োগ করবেন?",
    export: "চ্যাট PDF হিসেবে ডাউনলোড করুন",
    jobRole: "টার্গেট চাকরির ভূমিকা",
    jobDescription: "সম্পূর্ণ Job Description এখানে পেস্ট করুন...",
    generate: "তৈরি করুন",
    analyze: "ম্যাচ বিশ্লেষণ করুন",
  },
};

const suggestions = [
  { icon: "user", label: "Candidate overview", prompt: "Tell me about Mrinmoy" },
  { icon: "sparkles", label: "Core AI skills", prompt: "What are his main AI skills?" },
  { icon: "code", label: "Featured projects", prompt: "Explain his main projects" },
  { icon: "briefcase", label: "Experience", prompt: "What experience does he have?" },
  { icon: "file", label: "Resume", prompt: "Can I download his resume?" },
  { icon: "target", label: "Recruiter view", prompt: "Why should we hire this candidate?" },
];

function createChat() {
  return { id: crypto.randomUUID(), title: "New conversation", messages: [] };
}

function loadChats() {
  try {
    const savedChats = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const valid = Array.isArray(savedChats) && savedChats.length > 0 &&
      savedChats.every((chat) => chat?.id && Array.isArray(chat.messages));
    if (valid) return savedChats;
  } catch (error) {
    console.error("Unable to load chat history:", error);
  }
  return [createChat()];
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  } catch {
    // Local storage may be unavailable in privacy mode.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

async function responseError(response, fallback) {
  try {
    const payload = await response.json();
    if (typeof payload.detail === "string") return payload.detail;
    if (Array.isArray(payload.detail)) return payload.detail[0]?.msg || fallback;
  } catch {
    // The response was not JSON.
  }
  return fallback;
}

function MatchResult({ result }) {
  const tone = result.match_score >= 80 ? "good" : result.match_score >= 60 ? "fair" : "low";
  return (
    <div className="match-result">
      <div className={`match-score ${tone}`}>
        <strong>{result.match_score}%</strong>
        <span>Match</span>
      </div>
      <div className="match-copy">
        <h4>{result.verdict}</h4>
        <p><b>Matched skills:</b> {result.matched_skills.join(", ") || "None identified"}</p>
        <p><b>Missing skills:</b> {result.missing_skills.join(", ") || "No major gaps identified"}</p>
        <p><b>Strengths:</b> {result.strengths.join(", ") || "Not provided"}</p>
        <p>{result.recommendation}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [chats, setChats] = useState(loadChats);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [question, setQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [panel, setPanel] = useState(null);
  const [jobRole, setJobRole] = useState("AI Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [notice, setNotice] = useState("");

  const bottomRef = useRef(null);
  const uploadRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];
  const text = copy[language];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    themeMeta?.setAttribute("content", theme === "dark" ? "#191a1f" : "#eef2f8");
  }, [theme]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function startNewChat() {
    const chat = createChat();
    setChats((current) => [chat, ...current]);
    setActiveChatId(chat.id);
    setQuestion("");
    setSidebarOpen(false);
  }

  function selectChat(chatId) {
    setActiveChatId(chatId);
    setSidebarOpen(false);
  }

  function deleteChat(event, chatId) {
    event.stopPropagation();
    if (isStreaming) return;
    setChats((current) => {
      const remaining = current.filter((chat) => chat.id !== chatId);
      if (!remaining.length) {
        const replacement = createChat();
        setActiveChatId(replacement.id);
        return [replacement];
      }
      if (activeChatId === chatId) setActiveChatId(remaining[0].id);
      return remaining;
    });
  }

  function appendAssistant(content, extra = {}, chatId = activeChatId) {
    setChats((current) => current.map((chat) =>
      chat.id === chatId
        ? { ...chat, messages: [...chat.messages, { id: crypto.randomUUID(), role: "assistant", content, ...extra }] }
        : chat,
    ));
  }

  function speak(content) {
    if (!("speechSynthesis" in window)) {
      setNotice("Text-to-Speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = languages[language].speech;
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  function toggleVoiceInput() {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice("Voice input works in Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = languages[language].speech;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setNotice("Microphone access failed. Check browser permission.");
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
      setQuestion(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  async function sendMessage(customQuestion) {
    const finalQuestion = (customQuestion || question).trim();
    if (!finalQuestion || isStreaming) return;

    const currentChatId = activeChatId;
    const history = activeChat.messages
      .filter((message) => message.content?.trim() && !message.error)
      .map(({ role, content }) => ({ role, content }))
      .slice(-12);
    const userMessage = { id: crypto.randomUUID(), role: "user", content: finalQuestion };
    const assistantMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };

    setQuestion("");
    setIsStreaming(true);
    setNotice("");
    setChats((current) => current.map((chat) => chat.id === currentChatId ? {
      ...chat,
      title: chat.messages.length === 0 ? finalQuestion.slice(0, 35) : chat.title,
      messages: [...chat.messages, userMessage, assistantMessage],
    } : chat));

    let completeAnswer = "";
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQuestion, history, language }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Backend returned an error."));
      if (!response.body) throw new Error("Streaming response was not received.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        completeAnswer += decoder.decode(value, { stream: true });
        setChats((current) => current.map((chat) => chat.id === currentChatId ? {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === assistantMessage.id ? { ...message, content: completeAnswer } : message,
          ),
        } : chat));
      }
      if (autoSpeak && completeAnswer) speak(completeAnswer);
    } catch (error) {
      const message = error instanceof TypeError
        ? "The AI service is taking longer than expected. Please retry in a moment."
        : error.message;
      setChats((current) => current.map((chat) => chat.id === currentChatId ? {
        ...chat,
        messages: chat.messages.map((item) =>
          item.id === assistantMessage.id ? { ...item, content: message, error: true } : item,
        ),
      } : chat));
    } finally {
      setIsStreaming(false);
    }
  }

  async function uploadResume(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setIsStreaming(true);
    setNotice("Uploading and reading resume...");
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch(`${API_BASE}/resume`, { method: "POST", body: form });
      if (!response.ok) throw new Error(await responseError(response, "Resume upload failed."));
      const result = await response.json();
      setNotice(`✓ ${result.filename} is now active`);
      appendAssistant(result.message);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsStreaming(false);
    }
  }

  async function generateInterviewQuestions() {
    if (!jobRole.trim() || isStreaming) return;
    setIsStreaming(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/interview-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_role: jobRole, count: 8, language }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Question generation failed."));
      const result = await response.json();
      const content = result.questions.map((item, index) =>
        `${index + 1}. ${item.question}\n   Focus: ${item.focus}`,
      ).join("\n\n");
      appendAssistant(`${result.role} Interview Questions\n\n${content}`);
      setPanel(null);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsStreaming(false);
    }
  }

  async function analyzeMatch() {
    if (jobDescription.trim().length < 30) {
      setNotice("Paste at least 30 characters from the Job Description.");
      return;
    }
    setIsStreaming(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, language }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Match analysis failed."));
      const result = await response.json();
      appendAssistant(result.verdict, { match: result });
      setPanel(null);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsStreaming(false);
    }
  }

  async function generateWhyHire() {
    setIsStreaming(true);
    setNotice("");
    try {
      const response = await fetch(`${API_BASE}/why-hire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, language }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Answer generation failed."));
      const result = await response.json();
      appendAssistant(result.answer);
      if (autoSpeak) speak(result.answer);
      setPanel(null);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsStreaming(false);
    }
  }

  async function exportChatPdf() {
    if (!activeChat.messages.length || !messagesRef.current) {
      setNotice("Start a conversation before exporting it.");
      return;
    }
    setIsStreaming(true);
    setNotice("Creating PDF...");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(messagesRef.current, { scale: 1.6, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth - 20;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const image = canvas.toDataURL("image/jpeg", 0.92);
      let heightLeft = imageHeight;
      let position = 10;
      pdf.addImage(image, "JPEG", 10, position, imageWidth, imageHeight);
      heightLeft -= pageHeight - 20;
      while (heightLeft > 0) {
        pdf.addPage();
        position = 10 - (imageHeight - heightLeft);
        pdf.addImage(image, "JPEG", 10, position, imageWidth, imageHeight);
        heightLeft -= pageHeight - 20;
      }
      pdf.save("Mrinmoy_Candidate_AI_Chat.pdf");
      setNotice("✓ Chat exported as PDF");
    } catch {
      setNotice("PDF export failed. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="app">
      {sidebarOpen && <button className="overlay" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="mac-traffic-lights" aria-hidden="true">
            <span className="mac-dot mac-dot-close" />
            <span className="mac-dot mac-dot-minimize" />
            <span className="mac-dot mac-dot-expand" />
          </div>
          <div className="brand">
            <div className="logo-wrap"><div className="logo">M</div><span className="logo-status" /></div>
            <div className="brand-copy"><span className="brand-kicker">AI &amp; SOFTWARE ENGINEER</span><h2>Candidate AI</h2><p>Mrinmoy Kumar Maity</p></div>
          </div>

          <button className="new-chat" onClick={startNewChat}>
            <span className="new-chat-icon"><Icon name="plus" size={17} /></span>
            <span>Start new conversation</span>
          </button>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-label"><span>Recruiter tools</span><span className="section-count">6</span></div>
          <div className="feature-tools">
            <button onClick={() => uploadRef.current?.click()}><span className="tool-icon"><Icon name="upload" /></span><span className="tool-copy"><b>{text.upload}</b><small>Switch the active profile</small></span><Icon name="chevron" size={15} /></button>
            <button onClick={() => setPanel("interview")}><span className="tool-icon"><Icon name="interview" /></span><span className="tool-copy"><b>{text.interview}</b><small>Generate role-specific prompts</small></span><Icon name="chevron" size={15} /></button>
            <button onClick={() => setPanel("match")}><span className="tool-icon"><Icon name="target" /></span><span className="tool-copy"><b>{text.match}</b><small>Compare resume and job</small></span><Icon name="chevron" size={15} /></button>
            <button onClick={() => setPanel("hire")}><span className="tool-icon"><Icon name="sparkles" /></span><span className="tool-copy"><b>{text.hire}</b><small>Create a recruiter summary</small></span><Icon name="chevron" size={15} /></button>
            <button onClick={exportChatPdf}><span className="tool-icon"><Icon name="download" /></span><span className="tool-copy"><b>{text.export}</b><small>Save this conversation</small></span><Icon name="chevron" size={15} /></button>
            <a href={RESUME_URL} target="_blank" rel="noreferrer"><span className="tool-icon"><Icon name="file" /></span><span className="tool-copy"><b>Download resume</b><small>Open the current PDF</small></span><Icon name="external" size={15} /></a>
          </div>

          <div className="sidebar-label history-label"><span>Recent conversations</span><span className="section-count">{chats.length}</span></div>
          <div className="history-list">
            {chats.map((chat) => (
              <button key={chat.id} className={`history-item ${chat.id === activeChatId ? "active" : ""}`} onClick={() => selectChat(chat.id)}>
                <span className="chat-symbol"><Icon name="message" size={16} /></span>
                <span className="chat-title">{chat.title}</span>
                <span className="delete-chat" role="button" tabIndex="0" aria-label="Delete conversation" title="Delete conversation" onClick={(event) => deleteChat(event, chat.id)}><Icon name="trash" size={14} /></span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="profile-links">
            <a href="https://www.linkedin.com/in/mrinmoykumarmaity/" target="_blank" rel="noreferrer">LinkedIn <Icon name="external" size={12} /></a>
            <a href="https://github.com/mrinmoykumarmaity" target="_blank" rel="noreferrer">GitHub <Icon name="external" size={12} /></a>
          </div>
          <div className="online-status"><span className="online-dot" /><div><strong>AI representative online</strong><small>Grounded in the active resume</small></div></div>
        </div>
      </aside>

      <section className="chat-section">
        <header className="header">
          <div className="header-left">
            <button className="menu-button" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={20} /></button>
            <div className="header-avatar">M<span /></div>
            <div className="header-content"><span className="header-kicker">CANDIDATE PROFILE</span><h3>Mrinmoy Kumar Maity</h3><p>AI Engineer / Software Engineer</p></div>
          </div>
          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-pressed={theme === "dark"}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
            </button>
            <label className="language-picker">
              <Icon name="language" size={16} />
              <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Response language">
                {Object.entries(languages).map(([code, item]) => <option key={code} value={code}>{item.label}</option>)}
              </select>
            </label>
            <button className={`speech-toggle ${autoSpeak ? "active" : ""}`} onClick={() => {
              window.speechSynthesis?.cancel();
              setAutoSpeak((current) => !current);
            }} title="Automatically speak AI answers" aria-label="Toggle automatic speech"><Icon name={autoSpeak ? "volumeOn" : "volumeOff"} size={17} /></button>
            <div className="ai-badge"><span className="online-dot" /><span>Available</span></div>
          </div>
        </header>

        {notice && <button className="notice" onClick={() => setNotice("")}><span className="notice-icon"><Icon name="check" size={15} /></span><span>{notice}</span><Icon name="close" size={15} /></button>}

        <div className="chat-window">
          {activeChat.messages.length === 0 ? (
            <section className="welcome">
              <div className="welcome-logo-wrap"><div className="welcome-logo">M</div><span className="welcome-status"><Icon name="check" size={12} /></span></div>
              <p className="welcome-kicker">AI ENGINEER / SOFTWARE ENGINEER</p>
              <h1>Mrinmoy Kumar Maity</h1>
              <p className="welcome-copy">Ask about Mrinmoy&apos;s skills, projects, experience, education or suitability for a role. Every answer is grounded in the active resume.</p>
              <div className="suggestions">
                {suggestions.map((suggestion) => (
                  <button key={suggestion.prompt} onClick={() => sendMessage(suggestion.prompt)}>
                    <span className="suggestion-icon"><Icon name={suggestion.icon} size={18} /></span>
                    <span className="suggestion-copy"><b>{suggestion.label}</b><small>{suggestion.prompt}</small></span>
                    <Icon name="chevron" size={15} />
                  </button>
                ))}
              </div>
              <div className="trust-row"><span><Icon name="shield" size={14} /> Verified resume data</span><span><Icon name="language" size={14} /> English · Hindi · Bengali</span></div>
            </section>
          ) : (
            <div className="messages" ref={messagesRef}>
              {activeChat.messages.map((message) => (
                <article key={message.id} className={`message ${message.role}`}>
                  <div className="message-avatar">{message.role === "assistant" ? "M" : <Icon name="user" size={15} />}</div>
                  <div className="message-body">
                    <div className="message-meta"><strong>{message.role === "assistant" ? "Candidate AI" : "You"}</strong>{message.role === "assistant" && <span><Icon name="shield" size={12} /> Resume grounded</span>}</div>
                    <div className={`message-text ${message.error ? "error" : ""}`}>
                      {message.match ? <MatchResult result={message.match} /> : message.content?.includes(RESUME_URL) ? (
                        <><p>The candidate&apos;s resume is ready to view.</p><a className="resume-button" href={RESUME_URL} target="_blank" rel="noreferrer"><Icon name="download" size={15} /> Download Resume PDF</a></>
                      ) : message.content ? <p>{message.content}</p> : <span className="typing"><i /><i /><i /></span>}
                    </div>
                    {message.role === "assistant" && message.content && !message.error && !message.match && (
                      <button className="listen-button" onClick={() => speak(message.content)}><Icon name="volumeOn" size={14} /> Listen to answer</button>
                    )}
                  </div>
                </article>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="input-area">
          <div className="composer-shell">
            <div className="composer-label"><span><Icon name="sparkles" size={13} /> Ask Candidate AI</span><small>Press Enter to send</small></div>
            <div className="input-box">
              <textarea rows="1" value={question} placeholder={text.placeholder} disabled={isStreaming} onChange={(event) => setQuestion(event.target.value)} onInput={(event) => {
                event.currentTarget.style.height = "auto";
                event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 140)}px`;
              }} onKeyDown={handleKeyDown} />
              <div className="composer-actions">
                <button className={`voice-button ${listening ? "listening" : ""}`} aria-label="Voice input" title="Voice input" onClick={toggleVoiceInput}><Icon name={listening ? "stop" : "mic"} size={17} /></button>
                <button className="send-button" aria-label="Send message" disabled={!question.trim() || isStreaming} onClick={() => sendMessage()}><Icon name={isStreaming ? "stop" : "send"} size={17} /></button>
              </div>
            </div>
          </div>
          <p className="disclaimer"><Icon name="shield" size={12} /> Responses are generated only from the active candidate resume and profile.</p>
        </footer>
      </section>

      {panel && (
        <div className="modal-overlay" onMouseDown={() => setPanel(null)}>
          <section className="feature-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" aria-label="Close dialog" onClick={() => setPanel(null)}><Icon name="close" size={18} /></button>
            {panel === "interview" && <>
              <div className="modal-heading"><div className="modal-icon"><Icon name="interview" size={22} /></div><div><span>INTERVIEW PREP</span><h2>{text.interview}</h2></div></div><p>Create technical, project and behavioral questions grounded in the active resume.</p>
              <label>{text.jobRole}</label><input value={jobRole} onChange={(event) => setJobRole(event.target.value)} />
              <button className="modal-action" disabled={isStreaming} onClick={generateInterviewQuestions}><Icon name="sparkles" size={16} /> {text.generate}</button>
            </>}
            {panel === "match" && <>
              <div className="modal-heading"><div className="modal-icon"><Icon name="target" size={22} /></div><div><span>ROLE ALIGNMENT</span><h2>{text.match}</h2></div></div><p>Compare the active resume with a pasted job description and identify evidence-backed strengths and gaps.</p>
              <textarea className="jd-input" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder={text.jobDescription} />
              <button className="modal-action" disabled={isStreaming} onClick={analyzeMatch}><Icon name="target" size={16} /> {text.analyze}</button>
            </>}
            {panel === "hire" && <>
              <div className="modal-heading"><div className="modal-icon"><Icon name="sparkles" size={22} /></div><div><span>RECRUITER SUMMARY</span><h2>{text.hire}</h2></div></div><p>Create an honest candidate summary. Add a job description for a role-specific answer.</p>
              <textarea className="jd-input" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder={`${text.jobDescription} (optional)`} />
              <button className="modal-action" disabled={isStreaming} onClick={generateWhyHire}><Icon name="sparkles" size={16} /> {text.generate}</button>
            </>}
          </section>
        </div>
      )}

      <input ref={uploadRef} type="file" accept="application/pdf,.pdf" hidden onChange={uploadResume} />
    </main>
  );
}