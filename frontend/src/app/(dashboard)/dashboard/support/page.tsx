"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  MessageSquare,
  Plus,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Inbox,
  ChevronRight,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";

interface TicketMessage {
  id: number;
  ticket_id: number;
  sender: string;
  message: string;
  created_at: string;
  is_staff: boolean;
}

interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  closed: "bg-[#1a1a2e] text-[#6b6b80] border border-[#2a2a3e]",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  technical: "Technical",
  billing: "Billing",
  api_support: "API Support",
  feature_request: "Feature Request",
  bug_report: "Bug Report",
};

const categories = [
  "general",
  "technical",
  "billing",
  "api_support",
  "feature_request",
  "bug_report",
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);

  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<Ticket[]>("/support/tickets");
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newSubject.trim() || !newMessage.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await api.post<Ticket>("/support/tickets", {
        subject: newSubject.trim(),
        category: newCategory,
        message: newMessage.trim(),
      });
      setTickets((prev) => [ticket, ...prev]);
      setShowCreateForm(false);
      setNewSubject("");
      setNewCategory("general");
      setNewMessage("");
    } catch (err: any) {
      setError(
        err?.detail ||
          err?.message ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const messages = await api.get<TicketMessage[]>(
        `/support/tickets/${ticket.id}/messages`
      );
      setTicketMessages(messages);
    } catch {
      setTicketMessages(ticket.messages ?? []);
    }
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const msg = await api.post<TicketMessage>(
        `/support/tickets/${selectedTicket.id}/messages`,
        { message: replyMessage.trim() }
      );
      setTicketMessages((prev) => [...prev, msg]);
      setReplyMessage("");
    } catch (err: any) {
      setError(err?.detail || "Failed to send reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selectedTicket) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => {
            setSelectedTicket(null);
            setTicketMessages([]);
          }}
          className="flex items-center gap-2 text-sm text-[#94a3b8] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </button>

        <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedTicket.subject}
              </h2>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[selectedTicket.status]
                  }`}
                >
                  {selectedTicket.status
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
                <span className="text-sm text-[#6b6b80]">
                  {categoryLabels[selectedTicket.category] ??
                    selectedTicket.category}
                </span>
                <span className="text-sm text-[#6b6b80]">
                  Created {formatDate(selectedTicket.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {ticketMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border p-4 ${
                msg.is_staff
                  ? "border-blue-500/20 bg-blue-500/5"
                  : "border-[#1a1a2e] bg-[#111118]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      msg.is_staff
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-[#2a2a3e] text-[#94a3b8]"
                    }`}
                  >
                    {msg.sender?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {msg.sender}
                  </span>
                  {msg.is_staff && (
                    <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                      Support
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#6b6b80]">
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-[#94a3b8]">
                {msg.message}
              </p>
            </div>
          ))}

          {ticketMessages.length === 0 && (
            <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-8 text-center">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 text-[#6b6b80]" />
              <p className="text-sm text-[#6b6b80]">No messages yet.</p>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {selectedTicket.status !== "closed" && (
          <form
            onSubmit={handleSendReply}
            className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-4"
          >
            <textarea
              placeholder="Type your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-3 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={sendingReply || !replyMessage.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingReply ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Reply
              </button>
            </div>
          </form>
        )}

        {selectedTicket.status === "closed" && (
          <div className="rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] p-4 text-center text-sm text-[#6b6b80]">
            This ticket is closed. Create a new ticket for further assistance.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Support Tickets</h2>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Manage your support requests and get help.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setError("");
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Create Ticket
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create Ticket Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateTicket}
          className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6"
        >
          <h3 className="mb-4 text-base font-semibold text-white">
            Create New Ticket
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Brief description of your issue"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-2.5 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Category
              </label>
              <select
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Message
              </label>
              <textarea
                id="message"
                placeholder="Describe your issue in detail..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-3 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#222233] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Create Ticket
            </button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#1a1a2e] bg-[#111118] py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a2e]">
            <Inbox className="h-8 w-8 text-[#6b6b80]" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            No tickets yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-[#94a3b8]">
            Need help? Create a support ticket and our team will assist you.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => handleViewTicket(ticket)}
              className="flex w-full items-center justify-between rounded-xl border border-[#1a1a2e] bg-[#111118] p-5 text-left transition-all hover:border-[#3a3a4e]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="truncate text-sm font-medium text-white">
                    {ticket.subject}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[ticket.status]
                    }`}
                  >
                    {ticket.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="text-xs text-[#6b6b80]">
                    {categoryLabels[ticket.category] ?? ticket.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#6b6b80]">
                    <Clock className="h-3 w-3" />
                    {formatDate(ticket.updated_at)}
                  </div>
                </div>
              </div>
              <ChevronRight className="ml-4 h-5 w-5 shrink-0 text-[#6b6b80]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
