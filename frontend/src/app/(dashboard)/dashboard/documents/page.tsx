"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  FileText,
  Send,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Key,
  Code,
} from "lucide-react";
import { api } from "@/lib/api";

interface ApiKey {
  id: number;
  name: string;
  key: string;
  created_at: string;
}

interface DocumentResponse {
  id: number;
  customer_name: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [hasKeys, setHasKeys] = useState(false);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [docDate, setDocDate] = useState("");

  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseError, setResponseError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const data = await api.get<ApiKey[]>("/api-keys");
        setApiKeys(data);
        setHasKeys(data.length > 0);
      } catch {
        setHasKeys(false);
      } finally {
        setLoading(false);
      }
    }

    fetchKeys();
  }, []);

  const handleSendRequest = async (e: FormEvent) => {
    e.preventDefault();
    setResponseError("");
    setResponse(null);

    if (!customerName.trim() || !amount || !description.trim() || !docDate) {
      setResponseError("Please fill in all fields.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setResponseError("Please enter a valid amount.");
      return;
    }

    setSending(true);
    try {
      const result = await api.post<DocumentResponse>("/documents", {
        customer_name: customerName.trim(),
        amount: parsedAmount,
        description: description.trim(),
        date: docDate,
      });
      setResponse(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setResponseError(
        err?.detail ||
          err?.message ||
          "Failed to create document. Please check your request."
      );
    } finally {
      setSending(false);
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!hasKeys) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <Key className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            API Key Required
          </h2>
          <p className="mt-2 max-w-sm mx-auto text-sm text-[#94a3b8]">
            You need at least one API key to test the Documents API. Create an
            API key first to get started.
          </p>
          <a
            href="/dashboard/api-keys"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Key className="h-4 w-4" />
            Create API Key
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <FileText className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Documents API - Quick Test
            </h2>
            <p className="mt-1 text-sm text-[#94a3b8]">
              Create documents by sending a POST request to the Documents API.
              Fill in the form below and click &quot;Send Request&quot; to see the
              response.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                POST
              </span>
              <code className="font-mono text-xs text-[#94a3b8]">
                /api/v1/documents
              </code>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Form */}
        <form
          onSubmit={handleSendRequest}
          className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6"
        >
          <h3 className="mb-4 text-base font-semibold text-white">
            Request Body
          </h3>

          {responseError && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {responseError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="customerName"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Customer Name
              </label>
              <input
                id="customerName"
                type="text"
                placeholder="Acme Corporation"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-2.5 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b6b80]">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a14] py-2.5 pl-7 pr-4 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Annual subscription payment for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-3 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="docDate"
                className="mb-1.5 block text-sm font-medium text-[#94a3b8]"
              >
                Date
              </label>
              <input
                id="docDate"
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                max={today}
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a14] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Request
              </>
            )}
          </button>
        </form>

        {/* Response */}
        <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Response</h3>
            {response && (
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[#94a3b8] transition-colors hover:bg-[#1a1a2e] hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {response ? (
            <div className="relative overflow-hidden rounded-lg border border-[#2a2a3e] bg-[#0a0a14]">
              <div className="flex items-center gap-2 border-b border-[#2a2a3e] bg-[#0f0f1a] px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-400">
                  200 OK
                </span>
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                <code className="font-mono text-[#94a3b8]">{response}</code>
              </pre>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[#2a2a3e] bg-[#0a0a14]">
              <Code className="mb-3 h-8 w-8 text-[#6b6b80]" />
              <p className="text-sm text-[#6b6b80]">
                Response will appear here after sending a request.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* API Key Indicator */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-4">
        <div className="flex items-center gap-3">
          <Key className="h-4 w-4 text-emerald-400" />
          <p className="text-sm text-[#94a3b8]">
            Using API key:
          </p>
          <code className="rounded bg-[#0a0a14] px-2 py-0.5 font-mono text-xs text-[#94a3b8]">
            {apiKeys[0]?.key
              ? `${apiKeys[0].key.slice(0, 8)}...${apiKeys[0].key.slice(-4)}`
              : "No key"}
          </code>
          <span className="text-xs text-[#6b6b80]">
            ({apiKeys[0]?.name ?? "default"})
          </span>
        </div>
      </div>
    </div>
  );
}
