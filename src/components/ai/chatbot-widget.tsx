"use client";

import { useEffect, useState } from "react";
import { ChatbotPanel } from "@/components/ai/chatbot-panel";

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Show pulse animation for 5 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate a notification dot after 3 seconds if chat hasn't been opened
  useEffect(() => {
    if (open) {
      setHasNewMessage(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!open) setHasNewMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    setHasNewMessage(false);
  };

  return (
    <>
      {/* Chat panel */}
      {open && <ChatbotPanel onClose={() => setOpen(false)} />}

      {/* Floating button */}
      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 md:bottom-8 md:right-8"
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {/* Pulse ring animation on first load */}
        {showPulse && !open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-75" />
        )}

        {/* Notification dot */}
        {hasNewMessage && !open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        )}

        {open ? (
          <svg className="relative h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="relative h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
}
