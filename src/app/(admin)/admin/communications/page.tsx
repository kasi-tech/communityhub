"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const RECIPIENT_SEGMENTS = [
  { value: "all", label: "All Members" },
  { value: "active", label: "Active Members" },
  { value: "expired", label: "Expired Members" },
];

const MERGE_TAGS = ["{{name}}", "{{event_name}}", "{{member_id}}"];

export default function AdminCommunicationsPage() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    recipients: "active",
    subject: "",
    body: "",
    channelEmail: true,
    channelPush: false,
    channelWhatsApp: false,
  });

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const insertMergeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, body: prev.body + tag }));
  };

  const handleSend = async () => {
    if (!form.subject || !form.body) {
      toast({ title: "Validation error", message: "Subject and body are required", variant: "error" });
      return;
    }

    setSending(true);
    try {
      const channels = form.channelEmail ? "email" : form.channelPush ? "push" : "email";
      const res = await fetch("/api/v1/admin/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: form.recipients,
          subject: form.subject,
          body: form.body,
          channels,
        }),
      });

      if (!res.ok) throw new Error("Send failed");
      const json = await res.json();
      toast({
        title: "Messages sent",
        message: `Successfully sent to ${json.sent} recipients`,
        variant: "success",
      });
      setForm((prev) => ({ ...prev, subject: "", body: "" }));
    } catch {
      toast({ title: "Error", message: "Failed to send messages", variant: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
        <p className="mt-1 text-sm text-gray-500">Send messages to your community</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Compose form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Compose Message</h2>
            </div>
            <CardContent className="space-y-4">
              {/* Recipients */}
              <div>
                <label htmlFor="recipients" className="mb-1 block text-sm font-medium text-gray-700">
                  Recipients
                </label>
                <select
                  id="recipients"
                  value={form.recipients}
                  onChange={(e) => handleChange("recipients", e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {RECIPIENT_SEGMENTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Channels */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Channels</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.channelEmail}
                      onChange={(e) => handleChange("channelEmail", e.target.checked)}
                      className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-300"
                    />
                    Email
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.channelPush}
                      onChange={(e) => handleChange("channelPush", e.target.checked)}
                      className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-300"
                    />
                    Push Notification
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.channelWhatsApp}
                      onChange={(e) => handleChange("channelWhatsApp", e.target.checked)}
                      className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-300"
                    />
                    WhatsApp
                  </label>
                </div>
              </div>

              {/* Subject */}
              <Input
                label="Subject"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Enter email subject..."
              />

              {/* Merge tags */}
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Merge Tags</p>
                <div className="flex gap-2">
                  {MERGE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertMergeTag(tag)}
                      className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-100"
                      aria-label={`Insert merge tag ${tag}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div>
                <label htmlFor="message-body" className="mb-1 block text-sm font-medium text-gray-700">
                  Message Body
                </label>
                <textarea
                  id="message-body"
                  value={form.body}
                  onChange={(e) => handleChange("body", e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  rows={8}
                  placeholder="Write your message..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button loading={sending} onClick={handleSend}>
                  Send Now
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toast({
                      title: "Coming soon",
                      message: "Message scheduling will be available in a future update",
                      variant: "info",
                    })
                  }
                >
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: AI + recent messages */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">🤖</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">AI Newsletter</h3>
                  <p className="text-xs text-gray-500">Generate content with AI</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    toast({
                      title: "Coming soon",
                      message: "AI newsletter generation will be available in a future update",
                      variant: "info",
                    })
                  }
                >
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Recent Messages</h3>
            </div>
            <CardContent>
              <div className="space-y-3">
                {/* Placeholder recent messages */}
                <div className="flex items-start justify-between rounded-md border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Newsletter</p>
                    <p className="text-xs text-gray-500">Sent 3 days ago to Active Members</p>
                  </div>
                  <Badge variant="success">Sent</Badge>
                </div>
                <div className="flex items-start justify-between rounded-md border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Event Reminder</p>
                    <p className="text-xs text-gray-500">Sent 1 week ago to Event Registrants</p>
                  </div>
                  <Badge variant="success">Sent</Badge>
                </div>
                <div className="flex items-start justify-between rounded-md border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Membership Renewal</p>
                    <p className="text-xs text-gray-500">Scheduled for next week</p>
                  </div>
                  <Badge variant="warning">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
