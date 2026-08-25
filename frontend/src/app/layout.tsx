import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://nexusapi.dev"
  ),
  title:
    "NexusAPI - APIs para automatizar tu negocio | Documentos, Video IA, Datos",
  description:
    "NexusAPI提供 APIs potentes para automatizar procesos, generar documentos, crear videos con IA y convertir datos. Empieza gratis hoy.",
  keywords: [
    "API",
    "automatización",
    "video IA",
    "documentos",
    "API REST",
    "SaaS",
    "desarrolladores",
    "integración API",
  ],
  openGraph: {
    title:
      "NexusAPI - APIs para automatizar tu negocio | Documentos, Video IA, Datos",
    description:
      "NexusAPI提供 APIs potentes para automatizar procesos, generar documentos, crear videos con IA y convertir datos. Empieza gratis hoy.",
    url: "/",
    siteName: "NexusAPI",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "NexusAPI - APIs para automatizar tu negocio | Documentos, Video IA, Datos",
    description:
      "NexusAPI提供 APIs potentes para automatizar procesos, generar documentos, crear videos con IA y convertir datos. Empieza gratis hoy.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "google-site-verification": "UD02eru15ZaaB-3G7LoUKwHMTIU2VFuOa_h0A8N5qZ8",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
