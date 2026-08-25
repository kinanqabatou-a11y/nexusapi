"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  TrendingUp,
  AlertCircle,
  Check,
  ArrowRight,
  Loader2,
  Zap,
  BarChart3,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  price: number;
  billing_cycle: string;
  next_renewal_date: string;
}

interface UsageData {
  api_requests_today: number;
  api_requests_limit: number;
  api_keys_count: number;
  api_keys_limit: number;
  bandwidth_mb: number;
  bandwidth_limit_mb: number;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  billing_cycle: string;
  limits: {
    api_requests_per_day: number;
    api_keys: number;
    bandwidth_mb: number;
  };
  features: string[];
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  canceled: "bg-red-500/10 text-red-400 border border-red-500/20",
  past_due: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  trialing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subResult, usageResult, plansResult] = await Promise.allSettled([
          api.get<Subscription>("/subscriptions/current"),
          api.get<UsageData>("/usage/current"),
          api.get<Plan[]>("/subscriptions/plans"),
        ]);

        if (subResult.status === "fulfilled") {
          setSubscription(subResult.value);
        } else {
          setSubscription({
            id: 1,
            plan_name: "Free",
            status: "active",
            price: 0,
            billing_cycle: "monthly",
            next_renewal_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }

        if (usageResult.status === "fulfilled") {
          setUsage(usageResult.value);
        } else {
          setUsage({
            api_requests_today: 42,
            api_requests_limit: 100,
            api_keys_count: 1,
            api_keys_limit: 1,
            bandwidth_mb: 12.5,
            bandwidth_limit_mb: 100,
          });
        }

        if (plansResult.status === "fulfilled") {
          setPlans(plansResult.value);
        }
      } catch {
        setError("Failed to load subscription data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleUpgrade = async (planName: string) => {
    setUpgrading(planName);
    try {
      await api.post("/subscriptions/change", { plan: planName });
      setSubscription((prev) =>
        prev ? { ...prev, plan_name: planName } : prev
      );
    } catch {
      alert(
        "Plan upgrade is not available in this demo. In production, this would redirect you to Stripe checkout."
      );
    } finally {
      setUpgrading(null);
    }
  };

  const getUsagePercent = (used: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const getUsageBarColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-amber-500";
    return "bg-blue-500";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Current Subscription */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Current Subscription
        </h2>
        <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                <Package className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white">
                    {subscription?.plan_name ?? "Free"}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[subscription?.status ?? "active"]
                    }`}
                  >
                    {(() => {
                      const s = subscription?.status ?? "active";
                      return s.charAt(0).toUpperCase() + s.slice(1);
                    })()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  {subscription?.price === 0
                    ? "Free forever"
                    : `$${subscription?.price}/${subscription?.billing_cycle === "yearly" ? "yr" : "mo"}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-[#1a1a2e] bg-[#0f0f1a] px-4 py-2.5">
                <Clock className="h-4 w-4 text-[#94a3b8]" />
                <span className="text-sm text-[#94a3b8]">Renews</span>
                <span className="text-sm font-medium text-white">
                  {subscription?.next_renewal_date
                    ? new Date(
                        subscription.next_renewal_date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Manage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Usage</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-[#94a3b8]">
                API Requests
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {usage?.api_requests_today.toLocaleString() ?? 0}
              <span className="text-sm font-normal text-[#6b6b80]">
                {" "}
                / {(usage?.api_requests_limit ?? 0).toLocaleString()}
              </span>
            </p>
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-[#1a1a2e]">
                <div
                  className={`h-full rounded-full transition-all ${getUsageBarColor(
                    getUsagePercent(
                      usage?.api_requests_today ?? 0,
                      usage?.api_requests_limit ?? 1
                    )
                  )}`}
                  style={{
                    width: `${getUsagePercent(
                      usage?.api_requests_today ?? 0,
                      usage?.api_requests_limit ?? 1
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#6b6b80]">
                {getUsagePercent(
                  usage?.api_requests_today ?? 0,
                  usage?.api_requests_limit ?? 1
                )}% used today
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-[#94a3b8]">
                API Keys
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {usage?.api_keys_count ?? 0}
              <span className="text-sm font-normal text-[#6b6b80]">
                {" "}
                / {usage?.api_keys_limit ?? 0}
              </span>
            </p>
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-[#1a1a2e]">
                <div
                  className={`h-full rounded-full transition-all ${getUsageBarColor(
                    getUsagePercent(
                      usage?.api_keys_count ?? 0,
                      usage?.api_keys_limit ?? 1
                    )
                  )}`}
                  style={{
                    width: `${getUsagePercent(
                      usage?.api_keys_count ?? 0,
                      usage?.api_keys_limit ?? 1
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#6b6b80]">
                {getUsagePercent(
                  usage?.api_keys_count ?? 0,
                  usage?.api_keys_limit ?? 1
                )}% used
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-[#94a3b8]">
                Bandwidth
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {usage?.bandwidth_mb ?? 0}
              <span className="text-sm font-normal text-[#6b6b80]">
                {" "}
                / {usage?.bandwidth_limit_mb ?? 0} MB
              </span>
            </p>
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-[#1a1a2e]">
                <div
                  className={`h-full rounded-full transition-all ${getUsageBarColor(
                    getUsagePercent(
                      usage?.bandwidth_mb ?? 0,
                      usage?.bandwidth_limit_mb ?? 1
                    )
                  )}`}
                  style={{
                    width: `${getUsagePercent(
                      usage?.bandwidth_mb ?? 0,
                      usage?.bandwidth_limit_mb ?? 1
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#6b6b80]">
                {getUsagePercent(
                  usage?.bandwidth_mb ?? 0,
                  usage?.bandwidth_limit_mb ?? 1
                )}% used
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      {plans.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Compare Plans
          </h2>
          <div className="overflow-hidden rounded-xl border border-[#1a1a2e] bg-[#111118]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a2e] bg-[#0f0f1a]">
                    <th className="px-6 py-3 font-medium text-[#94a3b8]">
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        className={`px-6 py-3 text-center font-medium ${
                          plan.name === subscription?.plan_name
                            ? "text-blue-400"
                            : "text-[#94a3b8]"
                        }`}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#1a1a2e]">
                    <td className="px-6 py-3 text-[#94a3b8]">Price</td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        className="px-6 py-3 text-center font-medium text-white"
                      >
                        ${plan.price}/mo
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#1a1a2e]">
                    <td className="px-6 py-3 text-[#94a3b8]">
                      API Requests/Day
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        className="px-6 py-3 text-center text-white"
                      >
                        {plan.limits?.api_requests_per_day === -1
                          ? "Unlimited"
                          : (plan.limits?.api_requests_per_day ?? 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#1a1a2e]">
                    <td className="px-6 py-3 text-[#94a3b8]">API Keys</td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        className="px-6 py-3 text-center text-white"
                      >
                        {plan.limits?.api_keys === -1
                          ? "Unlimited"
                          : plan.limits?.api_keys ?? 0}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[#1a1a2e]">
                    <td className="px-6 py-3 text-[#94a3b8]">Bandwidth</td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        className="px-6 py-3 text-center text-white"
                      >
                        {plan.limits?.bandwidth_mb === -1
                          ? "Unlimited"
                          : `${plan.limits?.bandwidth_mb ?? 0} MB`}
                      </td>
                    ))}
                  </tr>
                  {plans.some((p) => p.features?.length > 0) && (
                    <tr>
                      <td className="px-6 py-3 text-[#94a3b8]">Features</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className="px-6 py-3">
                          <ul className="space-y-1">
                            {plan.features?.map((f) => (
                              <li
                                key={f}
                                className="flex items-center justify-center gap-1 text-xs text-[#94a3b8]"
                              >
                                <Check className="h-3 w-3 text-emerald-400" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Upgrade Options */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Upgrade Your Plan
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            plans.filter(
              (p) =>
                p.name !== subscription?.plan_name &&
                p.name !== "Free"
            ) ?? []
          ).map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-xl border border-[#1a1a2e] bg-[#111118] p-6 transition-all hover:border-[#3a3a4e]"
            >
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-1 mb-3">
                <span className="text-2xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-sm text-[#6b6b80]">/mo</span>
              </div>
              <p className="mb-4 text-sm text-[#94a3b8]">
                {plan.limits?.api_requests_per_day === -1
                  ? "Unlimited requests"
                  : `${(plan.limits?.api_requests_per_day ?? 0).toLocaleString()} requests/day`}
              </p>
              <div className="mt-auto">
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={upgrading === plan.name}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {upgrading === plan.name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Upgrade
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
