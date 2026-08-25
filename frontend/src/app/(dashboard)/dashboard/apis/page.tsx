"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
  ArrowRight,
  BookOpen,
  Zap,
  Lock,
} from "lucide-react";
import { api } from "@/lib/api";

interface ApiInfo {
  id: number;
  name: string;
  description: string;
  version: string;
  base_path: string;
  is_available: boolean;
  category: string;
}

export default function ApisPage() {
  const [apis, setApis] = useState<ApiInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchApis() {
      try {
        const data = await api.get<ApiInfo[]>("/apis");
        setApis(data);
      } catch {
        setApis([
          {
            id: 1,
            name: "Documents API",
            description:
              "Create, manage, and generate documents programmatically. Supports PDF, HTML, and JSON formats.",
            version: "1.2.0",
            base_path: "/api/v1/documents",
            is_available: true,
            category: "Core",
          },
          {
            id: 2,
            name: "Invoices API",
            description:
              "Generate and manage invoices with automatic tax calculations and multi-currency support.",
            version: "1.0.0",
            base_path: "/api/v1/invoices",
            is_available: true,
            category: "Core",
          },
          {
            id: 3,
            name: "Webhooks API",
            description:
              "Configure and manage webhook endpoints for real-time event notifications.",
            version: "0.9.0",
            base_path: "/api/v1/webhooks",
            is_available: true,
            category: "Integration",
          },
          {
            id: 4,
            name: "Analytics API",
            description:
              "Access detailed usage analytics, metrics, and performance data for your APIs.",
            version: "1.1.0",
            base_path: "/api/v1/analytics",
            is_available: false,
            category: "Analytics",
          },
          {
            id: 5,
            name: "Templates API",
            description:
              "Create and manage reusable document templates with dynamic variable interpolation.",
            version: "1.0.0",
            base_path: "/api/v1/templates",
            is_available: false,
            category: "Core",
          },
          {
            id: 6,
            name: "Users API",
            description:
              "Manage user accounts, permissions, and team memberships within your organization.",
            version: "0.8.0",
            base_path: "/api/v1/users",
            is_available: false,
            category: "Management",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchApis();
  }, []);

  const categories = [
    "all",
    ...new Set(apis.map((api) => api.category)),
  ];

  const filteredApis = apis.filter((api) => {
    const matchesSearch =
      searchQuery === "" ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || api.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b6b80]" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a3e] bg-[#111118] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#6b6b80] outline-none transition-colors focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "border border-[#1a1a2e] bg-[#111118] text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-white"
              }`}
            >
              {category === "all" ? "All APIs" : category}
            </button>
          ))}
        </div>
      </div>

      {/* API Cards */}
      {filteredApis.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#1a1a2e] bg-[#111118] py-16">
          <Search className="mb-3 h-8 w-8 text-[#6b6b80]" />
          <p className="text-sm text-[#94a3b8]">
            No APIs match your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredApis.map((apiItem) => (
            <div
              key={apiItem.id}
              className={`relative flex flex-col rounded-xl border bg-[#111118] p-6 transition-all ${
                apiItem.is_available
                  ? "border-[#1a1a2e] hover:border-[#3a3a4e]"
                  : "border-[#1a1a2e] opacity-75"
              }`}
            >
              {!apiItem.is_available && (
                <div className="absolute right-4 top-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    <Lock className="h-3 w-3" />
                    Coming Soon
                  </span>
                </div>
              )}

              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Code className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white">
                    {apiItem.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-[#6b6b80]">
                      v{apiItem.version}
                    </span>
                    <span className="text-[#2a2a3e]">·</span>
                    <span className="font-mono text-xs text-[#6b6b80]">
                      {apiItem.base_path}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-4 flex-1 text-sm leading-relaxed text-[#94a3b8]">
                {apiItem.description}
              </p>

              <div className="flex items-center gap-3 border-t border-[#1a1a2e] pt-4">
                {apiItem.is_available ? (
                  <>
                    <Link
                      href={`/dashboard/documents`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      <Zap className="h-4 w-4" />
                      Try it
                    </Link>
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#222233] hover:text-white">
                      <BookOpen className="h-4 w-4" />
                      Docs
                    </button>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-4 py-2.5 text-sm font-medium text-[#6b6b80]">
                    <Lock className="h-4 w-4" />
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
