"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

type Language = "en" | "te";

interface ChatbotPanelProps {
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WELCOME_EN = "Hi! I'm the CommunityHub assistant. How can I help you today?";
const WELCOME_TE = "నమస్కారం! నేను CommunityHub సహాయకుడిని. నేను తెలుగులో కూడా మాట్లాడగలను. మీకు ఎలా సహాయం చేయగలను?";

const QUICK_ACTIONS = [
  { label: "Upcoming events", message: "What events are coming up?" },
  { label: "How to join", message: "How do I become a member?" },
  { label: "Contact us", message: "How can I contact the community?" },
];

const ERROR_MESSAGE = "Sorry, I couldn't process that. Please try again.";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChatbotPanel({ onClose }: ChatbotPanelProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "bot", content: WELCOME_EN },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Toggle language and update welcome message
  const toggleLanguage = () => {
    const newLang = language === "en" ? "te" : "en";
    setLanguage(newLang);

    // Add language switch message
    const switchMsg: Message = {
      id: `bot-lang-${Date.now()}`,
      role: "bot",
      content: newLang === "te" ? WELCOME_TE : WELCOME_EN,
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const reply = json.data?.reply ?? ERROR_MESSAGE;

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: reply,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        role: "bot",
        content: ERROR_MESSAGE,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  // Only show quick actions if the conversation is still at the welcome stage
  const showQuickActions = messages.length <= 2 && !loading;

  return (
    <div
      className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl md:bottom-28 md:right-8 md:w-96"
      role="dialog"
      aria-label="Chat assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-indigo-500 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">CommunityHub Assistant</p>
            <p className="text-xs text-indigo-200">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-md px-2 py-1 text-xs font-medium text-indigo-200 hover:bg-white/10 hover:text-white"
            aria-label={`Switch to ${language === "en" ? "Telugu" : "English"}`}
          >
            {language === "en" ? "తెలుగు" : "EN"}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-indigo-200 hover:text-white"
            aria-label="Close chat"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Quick actions */}
        {showQuickActions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleQuickAction(action.message)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-gray-200 px-4 py-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === "te" ? "మీ సందేశం టైప్ చేయండి..." : "Type a message..."}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          aria-label="Chat message"
          disabled={loading}
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-md bg-indigo-500 p-2 text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
