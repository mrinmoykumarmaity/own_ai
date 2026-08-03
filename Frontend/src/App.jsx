import React, { useEffect, useRef, useState } from "react";

const API_BASE = "https://own-ai-ciog.onrender.com";
const API_URL = `${API_BASE}/ask`;
const RESUME_URL = `${API_BASE}/resume`;
const STORAGE_KEY = "candidate_chat_history_v3";

const languages = {
  en: { label: "English", speech: "en-IN" },
  hi: { label: "à¤¹à¤¿à¤¨à¥à¤¦à¥€", speech: "hi-IN" },
  bn: { label: "à¦¬à¦¾à¦‚à¦²à¦¾", speech: "bn-IN" },
};

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
    placeholder: "Mrinmoy à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤•à¥à¤› à¤ªà¥‚à¤›à¥‡à¤‚...",
    upload: "à¤¨à¤¯à¤¾ à¤°à¤¿à¤œà¥à¤¯à¥‚à¤®à¥‡ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚",
    interview: "à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚ à¤ªà¥à¤°à¤¶à¥à¤¨",
    match: "à¤œà¥‰à¤¬ à¤®à¥ˆà¤š à¤¸à¥à¤•à¥‹à¤°",
    hire: "à¤‡à¤¸ à¤‰à¤®à¥à¤®à¥€à¤¦à¤µà¤¾à¤° à¤•à¥‹ à¤•à¥à¤¯à¥‹à¤‚ à¤¨à¤¿à¤¯à¥à¤•à¥à¤¤ à¤•à¤°à¥‡à¤‚?",
    export: "à¤šà¥ˆà¤Ÿ à¤•à¥‹ PDF à¤®à¥‡à¤‚ à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚",
    jobRole: "à¤²à¤•à¥à¤·à¤¿à¤¤ à¤¨à¥Œà¤•à¤°à¥€ à¤•à¥€ à¤­à¥‚à¤®à¤¿à¤•à¤¾",
    jobDescription: "à¤ªà¥‚à¤°à¤¾ Job Description à¤¯à¤¹à¤¾à¤ à¤ªà¥‡à¤¸à¥à¤Ÿ à¤•à¤°à¥‡à¤‚...",
    generate: "à¤¬à¤¨à¤¾à¤à¤",
    analyze: "à¤®à¥ˆà¤š à¤œà¤¾à¤à¤šà¥‡à¤‚",
  },
  bn: {
    placeholder: "Mrinmoy à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦•à¦¿à¦›à§ à¦œà¦¿à¦œà§à¦žà¦¾à¦¸à¦¾ à¦•à¦°à§à¦¨...",
    upload: "à¦¨à¦¤à§à¦¨ à¦°à§‡à¦œà¦¿à¦‰à¦®à§‡ à¦†à¦ªà¦²à§‹à¦¡ à¦•à¦°à§à¦¨",
    interview: "à¦‡à¦¨à§à¦Ÿà¦¾à¦°à¦­à¦¿à¦‰ à¦ªà§à¦°à¦¶à§à¦¨",
    match: "à¦œà¦¬ à¦®à§à¦¯à¦¾à¦š à¦¸à§à¦•à§‹à¦°",
    hire: "à¦à¦‡ à¦ªà§à¦°à¦¾à¦°à§à¦¥à§€à¦•à§‡ à¦•à§‡à¦¨ à¦¨à¦¿à¦¯à¦¼à§‹à¦— à¦•à¦°à¦¬à§‡à¦¨?",
    export: "à¦šà§à¦¯à¦¾à¦Ÿ PDF à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¡à¦¾à¦‰à¦¨à¦²à§‹à¦¡ à¦•à¦°à§à¦¨",
    jobRole: "à¦Ÿà¦¾à¦°à§à¦—à§‡à¦Ÿ à¦šà¦¾à¦•à¦°à¦¿à¦° à¦­à§‚à¦®à¦¿à¦•à¦¾",
    jobDescription: "à¦¸à¦®à§à¦ªà§‚à¦°à§à¦£ Job Description à¦à¦–à¦¾à¦¨à§‡ à¦ªà§‡à¦¸à§à¦Ÿ à¦•à¦°à§à¦¨...",
    generate: "à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨",
    analyze: "à¦®à§à¦¯à¦¾à¦š à¦¬à¦¿à¦¶à§à¦²à§‡à¦·à¦£ à¦•à¦°à§à¦¨",
  },
};

const suggestions = [
  "Tell me about Mrinmoy",
  "What are his main AI skills?",
  "Explain his main projects",
  "What experience does he have?",
  "Can I download his resume?",
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
        ? "Backend se connection nahi ho raha. FastAPI server port 8000 par start karo."
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
      setNotice(`âœ“ ${result.filename} is now active`);
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
      setNotice("âœ“ Chat exported as PDF");
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
        <div className="brand">
          <div className="logo">M</div>
          <div><h2>Candidate AI</h2><p>Mrinmoy Maity</p></div>
        </div>

        <button className="new-chat" onClick={startNewChat}><span>ï¼‹</span>New chat</button>

        <p className="history-heading">AI tools</p>
        <div className="feature-tools">
          <button onClick={() => uploadRef.current?.click()}>â†¥ <span>{text.upload}</span></button>
          <button onClick={() => setPanel("interview")}>â—« <span>{text.interview}</span></button>
          <button onClick={() => setPanel("match")}>â—Ž <span>{text.match}</span></button>
          <button onClick={() => setPanel("hire")}>âœ¦ <span>{text.hire}</span></button>
          <button onClick={exportChatPdf}>â‡© <span>{text.export}</span></button>
          <a href={RESUME_URL} target="_blank" rel="noreferrer">â–£ <span>Download current resume</span></a>
        </div>

        <p className="history-heading">Conversation history</p>
        <div className="history-list">
          {chats.map((chat) => (
            <button key={chat.id} className={`history-item ${chat.id === activeChatId ? "active" : ""}`} onClick={() => selectChat(chat.id)}>
              <span className="chat-symbol">â—Œ</span>
              <span className="chat-title">{chat.title}</span>
              <span className="delete-chat" title="Delete chat" onClick={(event) => deleteChat(event, chat.id)}>Ã—</span>
            </button>
          ))}
        </div>
        <div className="online-status"><span />AI representative online</div>
      </aside>

      <section className="chat-section">
        <header className="header">
          <button className="menu-button" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}>â˜°</button>
          <div className="header-content"><h3>Mrinmoy&apos;s AI Representative</h3><p>Ask questions about the candidate</p></div>
          <label className="language-picker">
            <span>æ–‡</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {Object.entries(languages).map(([code, item]) => <option key={code} value={code}>{item.label}</option>)}
            </select>
          </label>
          <button className={`speech-toggle ${autoSpeak ? "active" : ""}`} onClick={() => {
            window.speechSynthesis?.cancel();
            setAutoSpeak((current) => !current);
          }} title="Automatically speak AI answers">{autoSpeak ? "ðŸ”Š" : "ðŸ”‡"}</button>
          <div className="ai-badge">AI</div>
        </header>

        {notice && <button className="notice" onClick={() => setNotice("")}>{notice}<span>Ã—</span></button>}

        <div className="chat-window">
          {activeChat.messages.length === 0 ? (
            <section className="welcome">
              <div className="welcome-logo">M</div>
              <h1>How can I help you?</h1>
              <p>Ask about Mrinmoy&apos;s education, skills, projects, experience, certifications or resume.</p>
              <div className="suggestions">
                {suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendMessage(suggestion)}>{suggestion}<span>â†—</span></button>)}
              </div>
            </section>
          ) : (
            <div className="messages" ref={messagesRef}>
              {activeChat.messages.map((message) => (
                <article key={message.id} className={`message ${message.role}`}>
                  <div className="message-avatar">{message.role === "assistant" ? "M" : "You"}</div>
                  <div className="message-body">
                    <strong>{message.role === "assistant" ? "Candidate AI" : "You"}</strong>
                    <div className={`message-text ${message.error ? "error" : ""}`}>
                      {message.match ? <MatchResult result={message.match} /> : message.content?.includes(RESUME_URL) ? (
                        <><p>The candidate&apos;s resume is available.</p><a className="resume-button" href={RESUME_URL} target="_blank" rel="noreferrer">Download Resume PDF</a></>
                      ) : message.content ? <p>{message.content}</p> : <span className="typing"><i /><i /><i /></span>}
                    </div>
                    {message.role === "assistant" && message.content && !message.error && !message.match && (
                      <button className="listen-button" onClick={() => speak(message.content)}>ðŸ”Š Listen</button>
                    )}
                  </div>
                </article>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="input-area">
          <div className="input-box">
            <textarea rows="1" value={question} placeholder={text.placeholder} disabled={isStreaming} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleKeyDown} />
            <button className={`voice-button ${listening ? "listening" : ""}`} aria-label="Voice input" onClick={toggleVoiceInput}>{listening ? "â– " : "ðŸŽ™"}</button>
            <button className="send-button" aria-label="Send message" disabled={!question.trim() || isStreaming} onClick={() => sendMessage()}>{isStreaming ? "â– " : "â†‘"}</button>
          </div>
          <p className="disclaimer">AI answers using only the active candidate resume.</p>
        </footer>
      </section>

      {panel && (
        <div className="modal-overlay" onMouseDown={() => setPanel(null)}>
          <section className="feature-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setPanel(null)}>Ã—</button>
            {panel === "interview" && <>
              <div className="modal-icon">â—«</div><h2>{text.interview}</h2><p>Create resume-based technical and project questions.</p>
              <label>{text.jobRole}</label><input value={jobRole} onChange={(event) => setJobRole(event.target.value)} />
              <button className="modal-action" disabled={isStreaming} onClick={generateInterviewQuestions}>{text.generate}</button>
            </>}
            {panel === "match" && <>
              <div className="modal-icon">â—Ž</div><h2>{text.match}</h2><p>Compare the active resume with a pasted Job Description.</p>
              <textarea className="jd-input" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder={text.jobDescription} />
              <button className="modal-action" disabled={isStreaming} onClick={analyzeMatch}>{text.analyze}</button>
            </>}
            {panel === "hire" && <>
              <div className="modal-icon">âœ¦</div><h2>{text.hire}</h2><p>Create an honest recruiter answer. Add a Job Description for a tailored version.</p>
              <textarea className="jd-input" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder={`${text.jobDescription} (optional)`} />
              <button className="modal-action" disabled={isStreaming} onClick={generateWhyHire}>{text.generate}</button>
            </>}
          </section>
        </div>
      )}

      <input ref={uploadRef} type="file" accept="application/pdf,.pdf" hidden onChange={uploadResume} />
    </main>
  );
}

