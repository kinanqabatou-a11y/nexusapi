"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Users,
  UserCheck,
  CreditCard,
  Activity,
  Code2,
  MessageSquare,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  active_users: number;
  active_subscriptions: number;
  total_requests: number;
  total_apis: number;
  open_tickets: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-text-primary">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-bg-card ${className || ""}`} />
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await api.get<AdminStats>("/admin/stats");
        setStats(result);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr?.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
          <Activity className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">No data available</h3>
        <p className="text-sm text-text-muted">{error || "Unable to load admin statistics."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={stats.total_users}
          icon={<Users className="h-4 w-4 text-accent" />}
          color="accent"
        />
        <StatCard
          label="Active Users"
          value={stats.active_users}
          icon={<UserCheck className="h-4 w-4 text-success" />}
          color="success"
        />
        <StatCard
          label="Active Subscriptions"
          value={stats.active_subscriptions}
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          color="primary"
        />
        <StatCard
          label="Total Requests"
          value={stats.total_requests}
          icon={<Activity className="h-4 w-4 text-warning" />}
          color="warning"
        />
        <StatCard
          label="Total APIs"
          value={stats.total_apis}
          icon={<Code2 className="h-4 w-4 text-primary-light" />}
          color="primary-light"
        />
        <StatCard
          label="Open Tickets"
          value={stats.open_tickets}
          icon={<MessageSquare className="h-4 w-4 text-danger" />}
          color="danger"
        />
      </div>
    </div>
  );
}
