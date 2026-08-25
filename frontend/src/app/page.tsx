"use client";

import { useState } from "react";
import {
  FileText,
  Video,
  FileDown,
  Mail,
  ArrowLeftRight,
  Image,
  Zap,
  Shield,
  BookOpen,
  BarChart3,
  Gauge,
  Headphones,
  TrendingUp,
  Webhook,
  Layers,
  Check,
  ChevronDown,
  Copy,
  CheckCheck,
  ArrowRight,
  Star,
  Play,
  Terminal,
} from "lucide-react";

const TrustedBy = () => {
  const companies = [
    "TechCorp",
    "DataFlow",
    "CloudSoft",
    "InnovateLab",
    "ScaleUp",
    "DevStudio",
  ];
  return (
    <div className="mt-20 flex flex-col items-center gap-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
        Empresas que confían en nosotros
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {companies.map((name) => (
          <div
            key={name}
            className="flex h-10 items-center rounded-md border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-400"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsBar = () => {
  const stats = [
    { value: "10M+", label: "requests procesadas" },
    { value: "99.9%", label: "uptime" },
    { value: "50ms", label: "latencia media" },
    { value: "2,000+", label: "desarrolladores" },
  ];
  return (
    <section className="relative border-y border-zinc-800/60 bg-zinc-950/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 py-10 px-6 border-zinc-800/60 md:border-r last:border-r-0"
            style={{ borderRight: i < 3 ? "1px solid rgba(39,39,42,0.6)" : undefined }}
          >
            <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {stat.value}
            </span>
            <span className="text-sm text-zinc-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const steps = [
  {
    num: 1,
    title: "Crea tu cuenta gratuita",
    desc: "Regístrate en segundos sin tarjeta de crédito. Empieza a usar las APIs de inmediato.",
  },
  {
    num: 2,
    title: "Elige las APIs que necesitas",
    desc: "Selecciona entre Document, Video IA, PDF, Email, Conversión de datos y más.",
  },
  {
    num: 3,
    title: "Obtén tu API Key en segundos",
    desc: "Genera tus claves de acceso de forma instantánea con permisos granulares.",
  },
  {
    num: 4,
    title: "Integra con tu stack favorito",
    desc: "SDKs para Python, Node.js, PHP, Go y ejemplos listos para usar.",
  },
  {
    num: 5,
    title: "Monitoriza todo en tiempo real",
    desc: "Dashboard con estadísticas de requests, errores, latencia y más.",
  },
];

const HowItWorks = () => (
  <section className="py-24 md:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Proceso simple
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Cómo funciona
        </h2>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-6 hidden h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent md:block" />
        <div className="grid gap-10 md:grid-cols-5 md:gap-0">
          {steps.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center md:px-4">
              <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-bold text-white">
                {step.num}
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const apiCards = [
  {
    icon: FileText,
    name: "Document API",
    desc: "Genera facturas, contratos y documentos automáticamente",
    status: "available" as const,
    statusLabel: "Disponible",
  },
  {
    icon: Video,
    name: "AI Video API",
    desc: "Crea videos con inteligencia artificial en segundos",
    status: "beta" as const,
    statusLabel: "Beta",
  },
  {
    icon: FileDown,
    name: "PDF API",
    desc: "Genera PDFs profesionales desde cualquier fuente de datos",
    status: "available" as const,
    statusLabel: "Disponible",
  },
  {
    icon: Mail,
    name: "Email API",
    desc: "Envía emails transaccionales masivos de forma fiable",
    status: "available" as const,
    statusLabel: "Disponible",
  },
  {
    icon: ArrowLeftRight,
    name: "Data Conversion API",
    desc: "Convierte entre CSV, Excel, JSON y más formatos",
    status: "coming" as const,
    statusLabel: "Próximamente",
  },
  {
    icon: Image,
    name: "Image API",
    desc: "Genera y transforma imágenes con IA",
    status: "coming" as const,
    statusLabel: "Próximamente",
  },
];

const statusStyles = {
  available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  beta: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  coming: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const APIsSection = () => (
  <section id="apis" className="py-24 md:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Plataforma completa
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          APIs potentes para cada caso de uso
        </h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {apiCards.map((api) => {
          const Icon = api.icon;
          return (
            <div
              key={api.name}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/50 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[api.status]}`}
                  >
                    {api.statusLabel}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {api.name}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                  {api.desc}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Explorar
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const features = [
  {
    icon: Zap,
    title: "Integración en minutos",
    desc: "SDKs para Python, Node.js, PHP, Go y más",
  },
  {
    icon: Shield,
    title: "Seguridad de nivel enterprise",
    desc: "API Keys con hashing, rate limiting y auditoría",
  },
  {
    icon: BookOpen,
    title: "Documentación interactiva",
    desc: "Prueba cada endpoint directamente desde la docs",
  },
  {
    icon: BarChart3,
    title: "Estadísticas en tiempo real",
    desc: "Monitoriza requests, errores y latencia al instante",
  },
  {
    icon: Gauge,
    title: "Límites inteligentes",
    desc: "Controla tu consumo por plan, API y key",
  },
  {
    icon: Headphones,
    title: "Soporte experto",
    desc: "Equipo técnico disponible para ayudarte",
  },
  {
    icon: TrendingUp,
    title: "Escalable",
    desc: "De 0 a millones de requests sin problemas",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    desc: "Recibe eventos en tiempo real en tu servidor",
  },
  {
    icon: Layers,
    title: "Multi-API",
    desc: "Todas las APIs en una sola plataforma, una sola key",
  },
];

const WhyNexus = () => (
  <section id="advantages" className="py-24 md:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Ventajas
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Todo lo que necesitas para automatizar
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/60"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-white">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const codeExamples = {
  curl: {
    label: "cURL",
    code: `curl -X POST https://api.nexusapi.com/v1/documents/generate \\
  -H "Authorization: Bearer nx_live_xK9mP2qR7vL3" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template": "invoice",
    "format": "pdf",
    "data": {
      "company": "Mi Empresa S.L.",
      "client": "Juan Pérez",
      "amount": 1250.00,
      "items": [
        {
          "description": "Consultoría técnica",
          "quantity": 1,
          "price": 1250.00
        }
      ]
    }
  }'`,
  },
  python: {
    label: "Python",
    code: `import nexusapi

client = nexusapi.Client(api_key="nx_live_xK9mP2qR7vL3")

response = client.documents.generate(
    template="invoice",
    format="pdf",
    data={
        "company": "Mi Empresa S.L.",
        "client": "Juan Pérez",
        "amount": 1250.00,
        "items": [
            {
                "description": "Consultoría técnica",
                "quantity": 1,
                "price": 1250.00
            }
        ]
    }
)

print(response.download_url)
# https://cdn.nexusapi.com/docs/abc123.pdf`,
  },
  javascript: {
    label: "JavaScript",
    code: `import NexusAPI from "nexusapi";

const client = new NexusAPI({
  apiKey: "nx_live_xK9mP2qR7vL3",
});

const response = await client.documents.generate({
  template: "invoice",
  format: "pdf",
  data: {
    company: "Mi Empresa S.L.",
    client: "Juan Pérez",
    amount: 1250.00,
    items: [
      {
        description: "Consultoría técnica",
        quantity: 1,
        price: 1250.00,
      },
    ],
  },
});

console.log(response.download_url);
// https://cdn.nexusapi.com/docs/abc123.pdf`,
  },
  php: {
    label: "PHP",
    code: `<?php

use NexusAPI\\Client;

$client = new Client("nx_live_xK9mP2qR7vL3");

$response = $client->documents()->generate([
    "template" => "invoice",
    "format" => "pdf",
    "data" => [
        "company" => "Mi Empresa S.L.",
        "client" => "Juan Pérez",
        "amount" => 1250.00,
        "items" => [
            [
                "description" => "Consultoría técnica",
                "quantity" => 1,
                "price" => 1250.00,
            ],
        ],
    ],
]);

echo $response->download_url;
// https://cdn.nexusapi.com/docs/abc123.pdf`,
  },
};

const apiResponse = `{
  "status": "success",
  "data": {
    "id": "doc_8f2kL9mNx3pQ",
    "template": "invoice",
    "format": "pdf",
    "status": "completed",
    "download_url": "https://cdn.nexusapi.com/docs/doc_8f2kL9mNx3pQ.pdf",
    "pages": 1,
    "size_bytes": 45230,
    "created_at": "2026-08-25T14:30:00Z",
    "expires_at": "2026-09-24T14:30:00Z"
  },
  "meta": {
    "request_id": "req_xK9mP2qR",
    "latency_ms": 247
  }
}`;

const CodeExample = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("curl");
  const [copied, setCopied] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleCopy = async (text: string, type: "code" | "response") => {
    await navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Desarrolladores primero
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Integra en cualquier lenguaje
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4">
              <div className="flex">
                {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map(
                  (key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === key
                          ? "text-white border-b-2 border-blue-500"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {codeExamples[key].label}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => handleCopy(codeExamples[activeTab].code, "code")}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {copied ? (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="overflow-x-auto p-5">
              <pre className="text-sm leading-relaxed">
                <code>
                  {codeExamples[activeTab].code.split("\n").map((line, i) => {
                    let colored = line;
                    if (
                      line.trim().startsWith("//") ||
                      line.trim().startsWith("#")
                    ) {
                      return (
                        <div key={i} className="text-zinc-500">
                          {line}
                        </div>
                      );
                    }
                    return (
                      <div key={i}>
                        {colored.split(/(\s+)/).map((word, j) => {
                          if (
                            [
                              "curl",
                              "import",
                              "from",
                              "def",
                              "class",
                              "new",
                              "const",
                              "var",
                              "let",
                              "return",
                              "if",
                              "else",
                              "for",
                              "while",
                              "echo",
                              "use",
                            ].includes(word)
                          ) {
                            return (
                              <span key={j} className="text-purple-400">
                                {word}
                              </span>
                            );
                          }
                          if (
                            [
                              "POST",
                              "GET",
                              "PUT",
                              "DELETE",
                              "PATCH",
                            ].includes(word)
                          ) {
                            return (
                              <span key={j} className="text-emerald-400">
                                {word}
                              </span>
                            );
                          }
                          if (word.startsWith('"') || word.startsWith("'")) {
                            return (
                              <span key={j} className="text-amber-300">
                                {word}
                              </span>
                            );
                          }
                          if (word.startsWith("nx_") || word.startsWith("req_")) {
                            return (
                              <span key={j} className="text-blue-400">
                                {word}
                              </span>
                            );
                          }
                          if (!isNaN(Number(word)) && word !== " ") {
                            return (
                              <span key={j} className="text-orange-400">
                                {word}
                              </span>
                            );
                          }
                          return <span key={j}>{word}</span>;
                        })}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4">
              <div className="flex items-center gap-2 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="ml-2 text-xs text-zinc-500">
                  Respuesta JSON
                </span>
              </div>
              <button
                onClick={() => handleCopy(apiResponse, "response")}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {copiedResponse ? (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedResponse ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="p-5">
              <pre className="text-sm leading-relaxed text-zinc-300">
                <code>
                  {apiResponse.split("\n").map((line, i) => {
                    const trimmed = line.trim();
                    if (trimmed === "{" || trimmed === "}" || trimmed === "{") {
                      return <div key={i}>{line}</div>;
                    }
                    return (
                      <div key={i}>
                        {line.includes('"') ? (
                          <>
                            <span className="text-blue-300">
                              {line.split(":")[0]}
                            </span>
                            <span className="text-zinc-300">
                              {line.includes(":")
                                ? ": " + line.split(":").slice(1).join(":").trim()
                                : ""}
                            </span>
                          </>
                        ) : (
                          line
                        )}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "/mes",
    desc: "Perfecto para empezar a explorar",
    popular: false,
    features: [
      "500 requests/mes",
      "1 API Key",
      "Acceso a Document API",
      "Soporte por email",
      "Documentación completa",
    ],
    cta: "Comenzar gratis",
    ctaStyle: "border border-zinc-700 text-white hover:bg-zinc-800",
  },
  {
    name: "Professional",
    price: "29",
    period: "/mes",
    desc: "Para proyectos en crecimiento",
    popular: true,
    features: [
      "25,000 requests/mes",
      "20 API Keys",
      "Todas las APIs disponibles",
      "Soporte prioritario",
      "Estadísticas avanzadas",
      "Webhooks",
    ],
    cta: "Empezar ahora",
    ctaStyle:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20",
  },
  {
    name: "Business",
    price: "79",
    period: "/mes",
    desc: "Para equipos y empresas",
    popular: false,
    features: [
      "100,000 requests/mes",
      "API Keys ilimitadas",
      "Todas las APIs disponibles",
      "Soporte dedicado",
      "Límites personalizados",
      "SLA 99.9%",
      "Estadísticas premium",
    ],
    cta: "Empezar ahora",
    ctaStyle: "border border-zinc-700 text-white hover:bg-zinc-800",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Para grandes organizaciones",
    popular: false,
    features: [
      "Requests ilimitadas",
      "API Keys ilimitadas",
      "Todas las APIs + APIs custom",
      "Infraestructura dedicada",
      "Soporte 24/7",
      "SLA personalizado",
      "Onboarding dedicado",
    ],
    cta: "Contactar",
    ctaStyle: "border border-zinc-700 text-white hover:bg-zinc-800",
  },
];

const Pricing = () => (
  <section id="pricing" className="py-24 md:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Precios
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Precios simples y transparentes
        </h2>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">
          Sin costes ocultos. Paga solo por lo que uses.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl border p-6 transition-all duration-300 ${
              plan.popular
                ? "border-blue-500/50 bg-zinc-900/80 shadow-lg shadow-blue-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-0.5 text-[11px] font-semibold text-white">
                Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="mb-1 text-lg font-semibold text-white">
                {plan.name}
              </h3>
              <p className="mb-4 text-sm text-zinc-400">{plan.desc}</p>
              <div className="flex items-baseline gap-1">
                {plan.price !== "Custom" && (
                  <span className="text-lg text-zinc-400">€</span>
                )}
                <span className="text-4xl font-bold tracking-tight text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-zinc-500">{plan.period}</span>
              </div>
            </div>
            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span className="text-sm text-zinc-300">{feat}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${plan.ctaStyle}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const testimonials = [
  {
    text: "[Placeholder 1]",
    author: "Pedro Martínez",
    role: "CTO de TechCorp",
  },
  {
    text: "[Placeholder 2]",
    author: "Laura García",
    role: "Fundadora de InnovaLab",
  },
  {
    text: "[Placeholder 3]",
    author: "Carlos Ruiz",
    role: "Lead Dev en ScaleUp",
  },
];

const Testimonials = () => (
  <section id="testimonials" className="py-24 md:py-32">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-16 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Testimonios
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Lo que dicen nuestros clientes
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-200 hover:border-zinc-700"
          >
            <div className="mb-4 flex gap-0.5">
              {[...Array(5)].map((_, j) => (
                <Star
                  key={j}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="mb-6 text-sm leading-relaxed text-zinc-300">
              &ldquo;{t.text}&rdquo;
            </p>
            <div>
              <p className="text-sm font-semibold text-white">{t.author}</p>
              <p className="text-xs text-zinc-500">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const faqData = [
  {
    q: "¿Qué es NexusAPI?",
    a: "NexusAPI es una plataforma de APIs que te permite automatizar la generación de documentos, videos con IA, PDFs, emails y conversión de datos. Todo desde una sola API key, con documentación interactiva y soporte técnico.",
  },
  {
    q: "¿Cómo obtengo mi API Key?",
    a: "Crea una cuenta gratuita en nuestra plataforma, ve a la sección de API Keys en tu dashboard y genera una nueva key en segundos. Puedes crear múltiples keys con permisos diferentes para cada proyecto.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express), así como transferencia bancaria para planes Enterprise. Los pagos se procesan de forma segura a través de Stripe.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí, puedes actualizar o reducir tu plan en cualquier momento desde tu dashboard. Los cambios de plan se aplican inmediatamente y se prorratean según el tiempo restante de tu ciclo de facturación.",
  },
  {
    q: "¿Cuál es el límite del plan gratuito?",
    a: "El plan Starter gratuito incluye 500 requests por mes, 1 API Key y acceso a la Document API. Si necesitas más, puedes actualizar a un plan de pago en cualquier momento.",
  },
  {
    q: "¿Ofrecen soporte técnico?",
    a: "Sí. El plan gratuito incluye soporte por email. Los planes Professional y Business incluyen soporte prioritario con tiempos de respuesta garantizados. El plan Enterprise incluye soporte 24/7 con un gestor dedicado.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>
        <div className="space-y-3">
          {faqData.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all duration-200 hover:border-zinc-700"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-sm font-medium text-white">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-zinc-800/50 px-6 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => (
  <section className="relative py-24 md:py-32 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
    <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px]" />
    <div className="relative mx-auto max-w-3xl px-6 text-center">
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
        Empieza a automatizar hoy mismo
      </h2>
      <p className="mb-10 text-lg text-zinc-400">
        Crea tu cuenta gratuita en menos de 2 minutos
      </p>
      <a
        href="#"
        className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
      >
        Crear cuenta gratis
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  </section>
);

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 text-xs font-medium text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Ahora en versión pública
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Automatiza tu negocio
            </span>{" "}
            <br className="hidden sm:block" />
            <span className="text-white">con APIs potentes</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            Conecta, automatiza y escala con APIs de última generación.
            Documentos, video IA, datos y más.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Play className="h-4 w-4" />
              Comenzar gratis
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-zinc-500 hover:bg-zinc-900"
            >
              <Terminal className="h-4 w-4" />
              Ver documentación
            </a>
          </div>
          <TrustedBy />
        </div>
      </section>

      <StatsBar />
      <HowItWorks />
      <APIsSection />
      <WhyNexus />
      <CodeExample />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
