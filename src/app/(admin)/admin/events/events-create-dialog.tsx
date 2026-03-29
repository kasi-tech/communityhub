"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/shared/image-upload";
import { useToast } from "@/components/ui/toast";

export function EventsCreateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    capacity: "",
    priceAdult: "",
    priceChild: "",
    description: "",
    aiPrompt: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date) {
      toast({ title: "Validation error", message: "Title and date are required", variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          date: form.date,
          start_time: form.startTime,
          end_time: form.endTime,
          venue_name: form.venueName,
          venue_address: form.venueAddress,
          capacity: Number(form.capacity) || 0,
          price_adult: Number(form.priceAdult) || 0,
          price_child: Number(form.priceChild) || 0,
          description: form.description,
          status: "draft",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create event");
      }

      toast({ title: "Event created", message: "Your event has been saved as a draft", variant: "success" });
      setOpen(false);
      setForm({
        title: "", category: "", date: "", startTime: "", endTime: "",
        venueName: "", venueAddress: "", capacity: "", priceAdult: "",
        priceChild: "", description: "", aiPrompt: "",
      });
      // Trigger page refresh
      window.location.reload();
    } catch {
      toast({ title: "Error", message: "Failed to create event. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-label="Create new event">
        + Create Event
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create Event"
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={loading} onClick={handleSubmit}>
              Create Event
            </Button>
          </>
        }
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {/* AI Copilot */}
          <div>
            <label htmlFor="ai-prompt" className="mb-1 block text-sm font-medium text-gray-700">
              AI Copilot (optional)
            </label>
            <textarea
              id="ai-prompt"
              value={form.aiPrompt}
              onChange={(e) => handleChange("aiPrompt", e.target.value)}
              placeholder="Describe the event and let AI fill in the details..."
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="e.g. Cultural, Sports"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Venue Name"
              value={form.venueName}
              onChange={(e) => handleChange("venueName", e.target.value)}
            />
            <Input
              label="Venue Address"
              value={form.venueAddress}
              onChange={(e) => handleChange("venueAddress", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Capacity"
              type="number"
              value={form.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
            />
            <Input
              label="Price (Adult)"
              type="number"
              step="0.01"
              value={form.priceAdult}
              onChange={(e) => handleChange("priceAdult", e.target.value)}
            />
            <Input
              label="Price (Child)"
              type="number"
              step="0.01"
              value={form.priceChild}
              onChange={(e) => handleChange("priceChild", e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={3}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Event Image</p>
            <ImageUpload maxFiles={1} />
          </div>
        </div>
      </Dialog>
    </>
  );
}
