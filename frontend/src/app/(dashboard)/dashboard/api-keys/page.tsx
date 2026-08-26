"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Ban,
  Check,
  AlertTriangle,
  Shield,
  X,
} from "lucide-react";

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  api_id: string | null;
  api_name: string | null;
  last_used: string | null;
  created_at: string;
  is_active: boolean;
}

interface AvailableApi {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface CreateKeyResponse {
  id: number;
  name: string;
  key: string;
  key_prefix: string;
  created_at: string;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-bg-card ${className || ""}`}
    />
  );
}

function KeysSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
        <Key className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">
        No API keys
      </h3>
      <p className="mb-6 max-w-sm text-sm text-text-muted">
        Create your first API key to start making requests to the NexusAPI
        platform.
      </p>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        <Plus className="h-4 w-4" />
        Create API Key
      </button>
    </div>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Never";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreateKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [availableApis, setAvailableApis] = useState<AvailableApi[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string>("");

  const fetchKeys = useCallback(async () => {
    try {
      const result = await api.get<{ api_keys: ApiKey[] }>("/api-keys");
      setKeys(result.api_keys || []);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    api.get<{ apis: AvailableApi[] }>("/api-keys/apis/available").then((r) => setAvailableApis(r.apis || [])).catch(() => {});
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const result = await api.post<CreateKeyResponse>("/api-keys", {
        name: newKeyName.trim(),
        api_id: selectedApiId || undefined,
      });
      setCreatedKey(result);
      setNewKeyName("");
      setSelectedApiId("");
      await fetchKeys();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey?.key) {
      navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (id: number) => {
    setActionLoading(id);
    try {
      await api.post(`/api-keys/${id}/revoke`);
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, is_active: false } : k))
      );
    } catch {
      setError("Failed to revoke API key");
    } finally {
      setActionLoading(null);
      setConfirmRevoke(null);
    }
  };

  const handleDelete = async (id: number) => {
    setActionLoading(id);
    try {
      await api.delete(`/api-keys/${id}`);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to delete API key");
    } finally {
      setActionLoading(null);
      setConfirmDelete(null);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreatedKey(null);
    setNewKeyName("");
    setSelectedApiId("");
    setError(null);
  };

  if (loading) return <KeysSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">API Keys</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {keys.length === 0 && !error ? (
        <EmptyState onOpen={() => setShowCreateModal(true)} />
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="rounded-xl border border-border bg-bg-elevated p-5 transition-colors hover:border-border-light"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-card">
                    <Key
                      className={`h-5 w-5 ${
                        key.is_active ? "text-primary" : "text-text-muted"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {key.name}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          key.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-bg-card text-text-muted"
                        }`}
                      >
                        {key.is_active ? "Active" : "Revoked"}
                      </span>
                      {key.api_name && (
                        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {key.api_name}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className="font-mono">{key.key_prefix}****</span>
                      <span>
                        Created {formatDate(key.created_at)}
                      </span>
                      <span>Last used {formatDate(key.last_used)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {key.is_active && (
                    <>
                      {confirmRevoke === key.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400">
                            Revoke?
                          </span>
                          <button
                            onClick={() => handleRevoke(key.id)}
                            disabled={actionLoading === key.id}
                            className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
                          >
                            {actionLoading === key.id ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmRevoke(null)}
                            className="rounded-lg bg-bg-card px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRevoke(key.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-amber-500/30 hover:text-amber-400"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      )}
                    </>
                  )}

                  {confirmDelete === key.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(key.id)}
                        disabled={actionLoading === key.id}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {actionLoading === key.id ? "..." : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-lg bg-bg-card px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(key.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-red-500/30 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeCreateModal}
          />
          <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-bg-elevated p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Create API Key
              </h2>
              <button
                onClick={closeCreateModal}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">
                      Save your API key
                    </p>
                    <p className="mt-1 text-xs text-amber-400/80">
                      This key will only be shown once. Make sure to copy it
                      now.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-bg-base p-4">
                  <p className="mb-2 text-xs font-medium text-text-muted">
                    {createdKey.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-bg-card px-3 py-2 font-mono text-xs text-text-primary">
                      {createdKey.key}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="shrink-0 rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={closeCreateModal}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label
                    htmlFor="keyName"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Key Name
                  </label>
                  <input
                    id="keyName"
                    type="text"
                    placeholder="e.g. Production Server"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-primary"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="apiKeyType"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    API Type (Optional)
                  </label>
                  <select
                    id="apiKeyType"
                    value={selectedApiId}
                    onChange={(e) => setSelectedApiId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary"
                  >
                    <option value="">All APIs (unrestricted)</option>
                    {availableApis.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-text-muted">Leave empty to allow access to all APIs.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Key"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
