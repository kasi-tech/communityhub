"use client";

import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatStats {
  totalConversations: number;
  resolutionRate: number;
  avgSatisfaction: number;
}

interface ConversationPreview {
  id: string;
  sessionId: string;
  lastMessage: string;
  messageCount: number;
  satisfaction: number | null;
  resolved: boolean;
  createdAt: string;
}

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Placeholder FAQ data (future: fetch from DB)
// ---------------------------------------------------------------------------

const PLACEHOLDER_FAQS: FaqEntry[] = [
  { id: "1", question: "How do I become a member?", answer: "Visit our membership page and complete the application form. You'll need a referral from an existing member." },
  { id: "2", question: "What are the membership fees?", answer: "We offer several tiers. Individual membership starts at $50/year, Family membership at $80/year." },
  { id: "3", question: "How do I register for events?", answer: "Browse upcoming events on our Events page, select the event, and click Register. Payment can be made online." },
  { id: "4", question: "Can I get a refund for event registration?", answer: "Refunds are available up to 48 hours before the event. Contact admin for processing." },
  { id: "5", question: "How do I update my profile?", answer: "Log in to your account, go to Profile settings, and update your information." },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminChatbotPage() {
  const [stats, setStats] = useState<ChatStats>({
    totalConversations: 0,
    resolutionRate: 0,
    avgSatisfaction: 0,
  });
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [faqs] = useState<FaqEntry[]>(PLACEHOLDER_FAQS);
  const [faqSearch, setFaqSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/v1/admin/chatbot-stats");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setStats(json.data.stats);
          setConversations(json.data.conversations);
        }
      }
    } catch (err) {
      console.error("Failed to fetch chatbot stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()),
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Chatbot</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the community chatbot, view conversations, and maintain the knowledge base.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Conversations (30d)</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "--" : stats.totalConversations}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "--" : `${stats.resolutionRate.toFixed(0)}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "--" : stats.avgSatisfaction > 0 ? `${stats.avgSatisfaction.toFixed(1)}/5` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base / FAQ section */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
          <button
            type="button"
            className="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          >
            + Add FAQ Entry
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-100 px-6 py-3">
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          />
        </div>

        {/* FAQ table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Question
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Answer
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    {faq.question}
                  </td>
                  <td className="max-w-xs truncate px-6 py-3 text-sm text-gray-500">
                    {faq.answer}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFaqs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                    No FAQ entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No conversations yet. The chatbot will start recording conversations when users interact with it.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((convo) => (
              <li key={convo.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-gray-900">
                      Session {convo.sessionId.slice(0, 8)}...
                    </p>
                    {convo.resolved && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {convo.lastMessage}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {convo.messageCount} messages &middot; {formatDate(convo.createdAt)}
                  </p>
                </div>

                {convo.satisfaction !== null && (
                  <div className="ml-4 flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-3.5 w-3.5 ${i < convo.satisfaction! ? "fill-current" : "text-gray-200"}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
