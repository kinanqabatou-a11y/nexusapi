"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface UsageData {
  total_requests: number;
  requests_today: number;
  remaining: number;
  usage_percentage: number;
  chart_30_days: { day: string; requests: number }[];
  usage_by_api: { api_name: string; requests: number }[];
  error_rate: number;
  average_latency: number;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-bg-card ${className || ""}`}
    />
  );
}

function UsageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-card">
        <BarChart3 className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">
        No usage data
      </h3>
      <p className="max-w-sm text-sm text-text-muted">
        Your usage statistics will appear here once you start making API
        requests.
      </p>
    </div>
  );
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      const result = await api.get<UsageData>("/dashboard");
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  if (loading) return <UsageSkeleton />;

  if (!data) return <EmptyState />;

  const usagePercent = Math.min(data.usage_percentage, 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Usage</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Total Requests
            </span>
            <Activity className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.total_requests.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Requests Today
            </span>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.requests_today.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Remaining
            </span>
            <Clock className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.remaining.toLocaleString()}
          </p>
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-card">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              {usagePercent.toFixed(1)}% used
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">
              Avg Latency
            </span>
            <Clock className="h-4 w-4 text-text-muted" />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {data.average_latency < 1000
              ? `${data.average_latency.toFixed(0)}ms`
              : `${(data.average_latency / 1000).toFixed(2)}s`}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <AlertCircle className="h-3 w-3" />
            Error rate: {data.error_rate.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-elevated p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            Usage (Last 30 Days)
          </h2>
          <span className="text-xs text-text-muted">requests/day</span>
        </div>
        {data.chart_30_days.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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
          <div className="flex h-[300px] items-center justify-center text-sm text-text-muted">
            No chart data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Usage by API
            </h2>
            <span className="text-xs text-text-muted">top endpoints</span>
          </div>
          {data.usage_by_api.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data.usage_by_api}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b6b80", fontSize: 12 }}
                  axisLine={{ stroke: "#1a1a2e" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="api_name"
                  tick={{ fill: "#6b6b80", fontSize: 12 }}
                  axisLine={{ stroke: "#1a1a2e" }}
                  tickLine={false}
                  width={100}
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
                  fill="url(#barGradientV)"
                  radius={[0, 4, 4, 0]}
                />
                <defs>
                  <linearGradient
                    id="barGradientV"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-text-muted">
              No API usage data
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">
            Error Rate & Latency
          </h2>
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-text-secondary">Error Rate</span>
                <span
                  className={`text-sm font-semibold ${
                    data.error_rate > 5
                      ? "text-red-400"
                      : data.error_rate > 1
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {data.error_rate.toFixed(2)}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-bg-card">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    data.error_rate > 5
                      ? "bg-gradient-to-r from-red-600 to-red-400"
                      : data.error_rate > 1
                        ? "bg-gradient-to-r from-amber-600 to-amber-400"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  }`}
                  style={{ width: `${Math.min(data.error_rate, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {data.error_rate <= 1
                  ? "Healthy - error rate is below 1%"
                  : data.error_rate <= 5
                    ? "Moderate - error rate is between 1-5%"
                    : "High - error rate exceeds 5%"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Average Latency
                </span>
                <span
                  className={`text-sm font-semibold ${
                    data.average_latency > 1000
                      ? "text-red-400"
                      : data.average_latency > 500
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {data.average_latency < 1000
                    ? `${data.average_latency.toFixed(0)}ms`
                    : `${(data.average_latency / 1000).toFixed(2)}s`}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-bg-card">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    data.average_latency > 1000
                      ? "bg-gradient-to-r from-red-600 to-red-400"
                      : data.average_latency > 500
                        ? "bg-gradient-to-r from-amber-600 to-amber-400"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  }`}
                  style={{
                    width: `${Math.min((data.average_latency / 2000) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {data.average_latency <= 500
                  ? "Fast - under 500ms average"
                  : data.average_latency <= 1000
                    ? "Moderate - between 500ms-1s"
                    : "Slow - over 1s average"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-bg-card p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-muted">Total Requests</p>
                  <p className="mt-1 text-lg font-bold text-text-primary">
                    {data.total_requests.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Today</p>
                  <p className="mt-1 text-lg font-bold text-text-primary">
                    {data.requests_today.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Failed</p>
                  <p className="mt-1 text-lg font-bold text-red-400">
                    {Math.round(
                      data.total_requests * (data.error_rate / 100)
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Successful</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">
                    {(
                      data.total_requests -
                      Math.round(data.total_requests * (data.error_rate / 100))
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
