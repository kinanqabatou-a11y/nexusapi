"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "APIs", href: "#apis" },
  { label: "Precios", href: "#pricing" },
  { label: "Documentación", href: "#docs" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-black/70 backdrop-blur-xl"
            : "border-b border-transparent bg-black/30 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-0 select-none">
              <span className="text-xl font-bold tracking-tight text-white">
                Nexus
              </span>
              <span className="text-xl font-bold tracking-tight text-[#3b82f6]">
                API
              </span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-1">
              {navLinks.map((link) => {
                if (isLanding) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className="rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.label}
                    href={`/${link.href}`}
                    className="rounded-lg px-3.5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex md:items-center md:gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#2563eb] hover:shadow-blue-500/30"
              >
                Crear cuenta
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          {navLinks.map((link, index) => {
            const style = {
              transitionDelay: mobileOpen ? `${index * 75}ms` : "0ms",
            };
            if (isLanding) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={style}
                  className={`text-2xl font-semibold text-neutral-200 transition-all duration-300 hover:text-white ${
                    mobileOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.label}
                href={`/${link.href}`}
                onClick={() => setMobileOpen(false)}
                style={style}
                className={`text-2xl font-semibold text-neutral-200 transition-all duration-300 hover:text-white ${
                  mobileOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div
            style={{
              transitionDelay: mobileOpen
                ? `${navLinks.length * 75}ms`
                : "0ms",
            }}
            className={`mt-4 flex flex-col items-center gap-4 transition-all duration-300 ${
              mobileOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium text-neutral-300 transition-colors hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl bg-[#3b82f6] px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#2563eb]"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
