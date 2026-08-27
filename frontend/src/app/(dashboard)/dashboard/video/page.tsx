"use client";

import { useState } from "react";
import {
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getBaseUrl } from "@/lib/api";

export default function VideoPlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const baseUrl = getBaseUrl();

  async function handleGenerate() {
    if (!apiKey.trim()) {
      setError("Please enter an API key.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/video/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          duration,
          style: "cogvideox-flash",
          novai_api_key: "nvai-bd723155687d4c369f93ddcf18f2debc5a193723c9bca2f0",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data?.error?.message ||
          data?.detail?.error?.message ||
          data?.detail ||
          JSON.stringify(data) ||
          `HTTP ${res.status}`;
        setError(typeof message === "string" ? message : JSON.stringify(message));
        setResult(null);
      } else {
        setResult(data);
        setError("");
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const videoUrl =
    result?.video_url || result?.data?.video_url || result?.url || (typeof result?.urls === "string" ? result.urls : null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
          <Sparkles className="h-5 w-5 text-primary" />
          Video Playground
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Generate AI videos with CogVideoX-Flash via NovAI. Enter your NexusAPI
          key and a prompt to create a 5-second 720p clip.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 break-words">{error}</div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-border bg-bg-elevated p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            NexusAPI Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Primary API key (e.g. lharb-xxx)"
            className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 font-mono text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary"
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-text-muted">
            Tip: keys containing <code className="font-mono">lharbengytesta</code> or{" "}
            <code className="font-mono">kinanqabatou</code> are auto-approved.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="A cinematic aerial shot of a futuristic city at sunset, neon lights, motion blur..."
            className="w-full resize-none rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            Duration: {duration}s
          </label>
          <input
            type="range"
            min={2}
            max={10}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating (can take 60-120s)...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Generate Video
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-bg-elevated p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Video generated!
          </div>
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg border border-border bg-black"
              poster=""
            />
          ) : (
            <pre className="overflow-x-auto rounded-lg bg-bg-card p-4 text-xs text-text-secondary">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          {videoUrl && (
            <div className="break-all rounded-lg bg-bg-card p-3 font-mono text-xs text-text-muted">
              {videoUrl}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
