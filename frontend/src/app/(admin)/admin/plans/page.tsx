"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Package, Pencil, X, Check, Loader2 } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  price: number;
  request_limit: number;
  key_limit: number;
  is_active: boolean;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const result = await api.get<Plan[]>("/admin/plans");
        setPlans(result);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr?.message || "Failed to load plans");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditForm({
      name: plan.name,
      price: plan.price,
      request_limit: plan.request_limit,
      key_limit: plan.key_limit,
      is_active: plan.is_active,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const savePlan = async (id: number) => {
    setSaving(true);
    try {
      await api.put(`/admin/plans/${id}`, editForm);
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...editForm } : p))
      );
      cancelEdit();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-bg-card" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Plans</h1>

      <div className="space-y-3">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-xl border bg-bg-elevated p-5 transition-colors ${
                isEditing ? "border-accent" : "border-border"
              }`}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">Name</label>
                      <input
                        type="text"
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">Price ($/month)</label>
                      <input
                        type="number"
                        value={editForm.price ?? 0}
                        onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">Request Limit</label>
                      <input
                        type="number"
                        value={editForm.request_limit ?? 0}
                        onChange={(e) => setEditForm((f) => ({ ...f, request_limit: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-muted">Key Limit</label>
                      <input
                        type="number"
                        value={editForm.key_limit ?? 0}
                        onChange={(e) => setEditForm((f) => ({ ...f, key_limit: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => savePlan(plan.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-card transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Package className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{plan.name}</h3>
                      <div className="mt-0.5 flex items-center gap-4 text-sm text-text-muted">
                        <span>${plan.price}/mo</span>
                        <span>{plan.request_limit.toLocaleString()} requests</span>
                        <span>{plan.key_limit} API keys</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      plan.is_active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => startEdit(plan)}
                      className="rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-bg-card hover:text-text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
