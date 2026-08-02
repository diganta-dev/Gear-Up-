"use client";

import { useState, useTransition } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      // Simulate API submission delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent successfully.");
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
    });
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl border bg-card text-card-foreground shadow-sm text-center space-y-4 my-auto">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Message Received!</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Thank you for reaching out to Gear Up. Our support team has received your message and will get back to you within 24 hours.
        </p>
        <Button onClick={handleReset} variant="outline" className="mt-4">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Your Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="How can we help?"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={isPending}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900"
          >
            <option value="general">General Inquiry</option>
            <option value="rental">Rental & Booking Issue</option>
            <option value="provider">Gear Provider Support</option>
            <option value="payment">Payment & Billing</option>
            <option value="partnership">Business Partnership</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Write your query or feedback here..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-8 font-semibold h-11"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
