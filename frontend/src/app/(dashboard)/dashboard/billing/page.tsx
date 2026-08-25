"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Receipt,
  Check,
  ExternalLink,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  price: number;
  billing_cycle: string;
  next_renewal_date: string;
  payment_method: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
}

interface Plan {
  id: number;
  name: string;
  price: number;
  billing_cycle: string;
  features: string[];
  is_popular: boolean;
}

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  status: string;
  invoice_url: string | null;
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  canceled: "bg-red-500/10 text-red-400 border border-red-500/20",
  past_due: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  trialing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  unpaid: "bg-red-500/10 text-red-400 border border-red-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
};

const fallbackPlans: Plan[] = [
  {
    id: 1,
    name: "Free",
    price: 0,
    billing_cycle: "monthly",
    features: [
      "100 API requests/day",
      "1 API key",
      "Basic documentation",
      "Community support",
    ],
    is_popular: false,
  },
  {
    id: 2,
    name: "Basic",
    price: 19,
    billing_cycle: "monthly",
    features: [
      "10,000 API requests/day",
      "5 API keys",
      "Advanced documentation",
      "Email support",
      "Webhooks",
    ],
    is_popular: false,
  },
  {
    id: 3,
    name: "Pro",
    price: 49,
    billing_cycle: "monthly",
    features: [
      "100,000 API requests/day",
      "25 API keys",
      "Custom domain",
      "Priority support",
      "Analytics dashboard",
      "Rate limit controls",
    ],
    is_popular: true,
  },
  {
    id: 4,
    name: "Business",
    price: 149,
    billing_cycle: "monthly",
    features: [
      "Unlimited API requests",
      "Unlimited API keys",
      "White-label solution",
      "Dedicated support",
      "SLA guarantee",
      "Team management",
      "Audit logs",
    ],
    is_popular: false,
  },
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subData, plansData] = await Promise.allSettled([
          api.get<Subscription>("/subscriptions/current"),
          api.get<Plan[]>("/subscriptions/plans"),
        ]);

        if (subData.status === "fulfilled") {
          setSubscription(subData.value);
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
            payment_method: null,
          });
        }

        if (plansData.status === "fulfilled") {
          setPlans(plansData.value);
        }
      } catch {
        setError("Failed to load billing information.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleManageSubscription = async () => {
    try {
      const data = await api.get<{ url: string }>(
        "/subscriptions/portal"
      );
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      alert(
        "Stripe portal is not configured in this demo. In production, this would redirect you to the Stripe customer portal."
      );
    }
  };

  const handleChangePlan = async (planName: string) => {
    setChangingPlan(planName);
    try {
      await api.post("/subscriptions/change", { plan: planName });
      setSubscription((prev) =>
        prev ? { ...prev, plan_name: planName } : prev
      );
    } catch {
      alert(
        "Plan change is not available in this demo. In production, this would update your subscription via Stripe."
      );
    } finally {
      setChangingPlan(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

      {/* Current Plan */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Current Plan</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-[#94a3b8]">Current Plan</p>
                  <p className="text-xl font-bold text-white">
                    {subscription?.plan_name ?? "Free"}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  statusColors[subscription?.status ?? "active"]
                }`}
              >
                {(() => {
                  const s = subscription?.status ?? "active";
                  return s.charAt(0).toUpperCase() + s.slice(1);
                })()}
              </span>
            </div>

            <div className="space-y-3 border-t border-[#1a1a2e] pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94a3b8]">Price</span>
                <span className="font-medium text-white">
                  ${subscription?.price ?? 0}/
                  {subscription?.billing_cycle === "yearly" ? "yr" : "mo"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[#94a3b8]">
                  <Calendar className="h-4 w-4" />
                  Next Renewal
                </div>
                <span className="font-medium text-white">
                  {subscription?.next_renewal_date
                    ? formatDate(subscription.next_renewal_date)
                    : "N/A"}
                </span>
              </div>
            </div>

            <button
              onClick={handleManageSubscription}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#3a3a4e] hover:bg-[#222233]"
            >
              Manage Subscription
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>

          {/* Payment Method */}
          <div className="rounded-xl border border-[#1a1a2e] bg-[#111118] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Receipt className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[#94a3b8]">Payment Method</p>
                <p className="text-lg font-semibold text-white">Card</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#1a1a2e] pt-4">
              {subscription?.payment_method ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94a3b8]">Card</span>
                    <span className="font-medium capitalize text-white">
                      {subscription.payment_method.brand} ending in{" "}
                      {subscription.payment_method.last4}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94a3b8]">Expires</span>
                    <span className="font-medium text-white">
                      {String(subscription.payment_method.exp_month).padStart(2, "0")}/
                      {subscription.payment_method.exp_year}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#94a3b8]">
                  No payment method on file. Add one when you upgrade your plan.
                </p>
              )}
            </div>

            <button
              onClick={handleManageSubscription}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#3a3a4e] hover:bg-[#222233]"
            >
              Update Payment Method
            </button>
          </div>
        </div>
      </section>

      {/* Payment History */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Payment History
        </h2>
        <div className="overflow-hidden rounded-xl border border-[#1a1a2e] bg-[#111118]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1a1a2e] bg-[#0f0f1a]">
                  <th className="px-6 py-3 font-medium text-[#94a3b8]">
                    Date
                  </th>
                  <th className="px-6 py-3 font-medium text-[#94a3b8]">
                    Amount
                  </th>
                  <th className="px-6 py-3 font-medium text-[#94a3b8]">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium text-[#94a3b8]">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-[#1a1a2e] last:border-0"
                    >
                      <td className="px-6 py-4 text-white">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[payment.status] ?? "bg-[#1a1a2e] text-[#94a3b8]"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.invoice_url ? (
                          <a
                            href={payment.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 transition-colors hover:text-blue-300"
                          >
                            Download
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[#6b6b80]">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-[#6b6b80]"
                    >
                      No payment history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Change Plan */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Change Plan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = plan.name === subscription?.plan_name;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border bg-[#111118] p-6 transition-all ${
                  plan.is_popular
                    ? "border-blue-500/50"
                    : "border-[#1a1a2e]"
                } ${isCurrent ? "ring-2 ring-blue-500/30" : ""}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </div>
                )}

                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-[#6b6b80]">
                    /{plan.billing_cycle === "yearly" ? "yr" : "mo"}
                  </span>
                </div>

                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[#94a3b8]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-[#6b6b80]"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleChangePlan(plan.name)}
                    disabled={changingPlan === plan.name}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      plan.price > (subscription?.price ?? 0)
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "border border-[#2a2a3e] bg-[#1a1a2e] text-white hover:bg-[#222233]"
                    }`}
                  >
                    {changingPlan === plan.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {plan.price > (subscription?.price ?? 0)
                          ? "Upgrade"
                          : plan.price < (subscription?.price ?? 0)
                            ? "Downgrade"
                            : "Select"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
