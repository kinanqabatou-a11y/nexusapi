"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Code,
  Key,
  BarChart3,
  CreditCard,
  Package,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "APIs", href: "/dashboard/apis", icon: Code },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Usage", href: "/dashboard/usage", icon: BarChart3 },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Subscription", href: "/dashboard/subscription", icon: Package },
  { label: "Documentation", href: "/docs", icon: BookOpen },
  { label: "Support", href: "/dashboard/support", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col
        bg-[#0f0f1a] border-r border-[#1a1a2e]
        transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex h-16 items-center justify-between border-b border-[#1a1a2e] px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Zap className="h-7 w-7 text-blue-500" />
          <span className="text-lg font-bold tracking-tight text-white">
            NexusAPI
          </span>
        </Link>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-colors duration-150
                    ${
                      active
                        ? "border-l-2 border-blue-500 bg-blue-500/10 text-white"
                        : "border-l-2 border-transparent text-[#94a3b8] hover:bg-[#1a1a2e] hover:text-white"
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? "text-blue-400" : ""
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#1a1a2e] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
            {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user?.full_name ?? "User"}
            </p>
            <p className="truncate text-xs text-[#94a3b8]">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#1a1a2e] hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
