import Link from "next/link";
import { ExternalLink } from "lucide-react";

const productLinks = [
  { label: "APIs", href: "#apis" },
  { label: "Precios", href: "#pricing" },
  { label: "Documentación", href: "#docs" },
  { label: "Changelog", href: "#changelog" },
  { label: "Status", href: "#status" },
];

const developerLinks = [
  { label: "Guía de inicio", href: "#getting-started" },
  { label: "SDKs", href: "#sdks" },
  { label: "Ejemplos", href: "#examples" },
  { label: "Webhooks", href: "#webhooks" },
  { label: "API Reference", href: "#reference" },
];

const companyLinks = [
  { label: "Sobre nosotros", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Carreras", href: "#careers" },
  { label: "Contacto", href: "#contact" },
  { label: "Prensa", href: "#press" },
];

const legalLinks = [
  { label: "Privacidad", href: "#privacy" },
  { label: "Términos", href: "#terms" },
  { label: "Cookies", href: "#cookies" },
  { label: "RGPD", href: "#gdpr" },
];

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 md:grid-cols-5 md:gap-8 lg:py-16">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-0 select-none">
              <span className="text-lg font-bold tracking-tight text-white">
                Nexus
              </span>
              <span className="text-lg font-bold tracking-tight text-[#3b82f6]">
                API
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              APIs para automatizar tu negocio
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-neutral-400 transition-all duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white"
                  aria-label={social.label}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Producto</h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Desarrolladores</h3>
            <ul className="mt-4 space-y-3">
              {developerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Empresa</h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-neutral-500">
              &copy; 2026 NexusAPI. Todos los derechos reservados.
            </p>
            <p className="text-sm text-neutral-500">
              Hecho con ❤️ para desarrolladores
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
