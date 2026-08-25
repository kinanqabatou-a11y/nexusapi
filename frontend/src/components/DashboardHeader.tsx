"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Menu, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/apis": "APIs",
  "/dashboard/api-keys": "API Keys",
  "/dashboard/usage": "Usage",
  "/dashboard/billing": "Billing",
  "/dashboard/subscription": "Subscription",
  "/dashboard/support": "Support",
  "/dashboard/settings": "Settings",
  "/docs": "Documentation",
};

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export default function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const title =
    pageTitles[pathname] ??
    pathname
      .split("/")
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/^\w/, (c) => c.toUpperCase()) ??
    "Dashboard";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1a1a2e] bg-[#0f0f1a] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-2 text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#1a1a2e]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
              {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <span className="hidden text-sm font-medium text-white sm:block">
              {user?.full_name ?? "User"}
            </span>
            <ChevronDown
              className={`hidden h-4 w-4 text-[#94a3b8] transition-transform sm:block ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] py-1 shadow-xl shadow-black/40">
              <div className="border-b border-[#1a1a2e] px-4 py-3">
                <p className="truncate text-sm font-medium text-white">
                  {user?.full_name ?? "User"}
                </p>
                <p className="truncate text-xs text-[#94a3b8]">
                  {user?.email ?? ""}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] transition-colors hover:bg-[#1a1a2e] hover:text-white"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] transition-colors hover:bg-[#1a1a2e] hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-[#1a1a2e] py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#94a3b8] transition-colors hover:bg-[#1a1a2e] hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
