"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  Activity,
  CreditCard,
  Globe,
  Key,
  CalendarClock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface DashboardData {
  user_name: string;
  plan: {
    name: string;
    status: string;
  };
  usage: {
    used: number;
    limit: number;
    remaining: number;
    renewal_date: string;
  };
  stats: {
    active_api_keys: number;
    active_apis: number;
  };
  chart_7_days: { day: string; requests: number }[];
  chart_30_days: { day: string; requests: number }[];
  recent_requests: {
    endpoint: string;
    method: string;
    status_code: number;
    date: string;
  }[];
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-bg-card ${className || ""}`}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
        <Activity className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">
        No data yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-text-muted">
        Start making API requests to see your usage data, analytics, and
        statistics here.
      </p>
      <Link
        href="/dashboard/api-keys"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Create an API Key
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function methodColor(method: string) {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-emerald-400 bg-emerald-400/10";
    case "POST":
      return "text-blue-400 bg-blue-400/10";
    case "PUT":
      return "text-amber-400 bg-amber-400/10";
    case "PATCH":
      return "text-purple-400 bg-purple-400/10";
    case "DELETE":
      return "text-red-400 bg-red-400/10";
    default:
      return "text-text-muted bg-bg-card";
  }
}

function statusColor(code: number) {
  if (code >= 200 && code < 300) return "text-emerald-400";
  if (code >= 300 && code < 400) return "text-blue-400";
  if (code >= 400 && code < 500) return "text-amber-400";
  if (code >= 500) return "text-red-400";
  return "text-text-muted";
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await api.get<DashboardData>("/dashboard");
        setData(result);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) return <EmptyState />;

  const usagePercent =
    data.usage.limit > 0
      ? Math.min((data.usage.used / data.usage.limit) * 100, 100)
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">
        Welcome back, {user?.full_name || data.user_name || "there"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Current Plan
            </span>
            <CreditCard className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            {data.plan.name}
          </p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              data.plan.status === "active"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {data.plan.status}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              API Requests
            </span>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-xl font-bold text-text-primary">
            {data.usage.used.toLocaleString()} / {data.usage.limit.toLocaleString()}
          </p>
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-card">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-text-muted">
              Remaining: {data.usage.remaining.toLocaleString()} requests
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Active API Keys
            </span>
            <Key className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {data.stats.active_api_keys}
          </p>
          <Link
            href="/dashboard/api-keys"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors"
          >
            Manage keys <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Active APIs
            </span>
            <Globe className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary">
            {data.stats.active_apis}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
            <CalendarClock className="h-3 w-3" />
            Renews {formatShortDate(data.usage.renewal_date)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Last 7 Days
            </h2>
            <span className="text-xs text-text-muted">requests/day</span>
          </div>
          {data.chart_7_days.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.chart_7_days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6b6b80", fontSize: 12 }}
                  axisLine={{ stroke: "#1a1a2e" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b6b80", fontSize: 12 }}
                  axisLine={{ stroke: "#1a1a2e" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111118",
                    border: "1px solid #2a2a3e",
                    borderRadius: "8px",
                    color: "#f0f0f5",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="requests"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-text-muted">
              No data for the last 7 days
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Last 30 Days
            </h2>
            <span className="text-xs text-text-muted">requests/day</span>
          </div>
          {data.chart_30_days.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.chart_30_days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6b6b80", fontSize: 12 }}
                  axisLine={{ stroke: "#1a1a2e" }}
                  tickLine={false}
                  interval={Math.floor(data.chart_30_days.length / 6)}
                />
                <YAxis
                  tick={{ fill: "#6b6b80", fontSize: 12 }}
                  axisLine={{ stroke: "#1a1a2e" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111118",
                    border: "1px solid #2a2a3e",
                    borderRadius: "8px",
                    color: "#f0f0f5",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#3b82f6",
                    stroke: "#111118",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-text-muted">
              No data for the last 30 days
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-elevated">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Recent Requests
          </h2>
          <Link
            href="/dashboard/usage"
            className="text-xs text-primary hover:text-primary-light transition-colors"
          >
            View all
          </Link>
        </div>
        {data.recent_requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Endpoint
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Method
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recent_requests.map((req, i) => (
                  <tr
                    key={i}
                    className="transition-colors hover:bg-bg-card/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-text-primary">
                      {req.endpoint}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${methodColor(
                          req.method
                        )}`}
                      >
                        {req.method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium ${statusColor(
                          req.status_code
                        )}`}
                      >
                        {req.status_code}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-text-muted">
                      {formatDate(req.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-text-muted">
            No recent requests
          </div>
        )}
      </div>
    </div>
  );
}
