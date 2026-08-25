const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://nexusapi.dev";

interface JsonLdProps {
  type?: "organization" | "website" | "software" | "faq" | "breadcrumb";
  data?: Record<string, unknown>;
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NexusAPI",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    "NexusAPI提供 APIs potentes para automatizar procesos, generar documentos, crear videos con IA y convertir datos.",
  sameAs: [
    "https://github.com/nexusapi",
    "https://twitter.com/nexusapi",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Spanish", "English"],
  },
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NexusAPI",
  url: BASE_URL,
  description:
    "NexusAPI提供 APIs potentes para automatizar procesos, generar documentos, crear videos con IA y convertir datos.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NexusAPI",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "Plataforma de APIs para automatizar procesos, generar documentos, crear videos con IA y convertir datos.",
  url: BASE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Plan gratuito disponible",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
  },
};

const defaultFaqData = {
  questions: [
    {
      question: "¿Qué es NexusAPI?",
      answer:
        "NexusAPI es una plataforma de APIs que permite automatizar procesos, generar documentos, crear videos con IA y convertir datos de forma sencilla.",
    },
    {
      question: "¿Puedo probar NexusAPI gratis?",
      answer:
        "Sí, NexusAPI ofrece un plan gratuito con acceso limitado a todas nuestras APIs.",
    },
    {
      question: "¿Qué APIs ofrece NexusAPI?",
      answer:
        "Ofrecemos APIs de generación de documentos, creación de videos con IA, conversión de datos, automatización de procesos y más.",
    },
    {
      question: "¿NexusAPI es compatible con otros sistemas?",
      answer:
        "Sí, NexusAPI se integra fácilmente con tu stack tecnológico existente a través de nuestra API REST.",
    },
  ],
};

function buildFaqSchema(
  faqData: { questions: { question: string; answer: string }[] } = defaultFaqData
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildBreadcrumbSchema(
  items: { name: string; url: string }[] = [
    { name: "Inicio", url: BASE_URL },
  ]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function JsonLdScript({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function JsonLd({ type = "organization", data }: JsonLdProps) {
  let schema: Record<string, unknown>;

  switch (type) {
    case "website":
      schema = websiteSchema;
      break;
    case "software":
      schema = softwareApplicationSchema;
      break;
    case "faq":
      schema = buildFaqSchema(
        data as
          | { questions: { question: string; answer: string }[] }
          | undefined
      );
      break;
    case "breadcrumb":
      schema = buildBreadcrumbSchema(
        data as { name: string; url: string }[] | undefined
      );
      break;
    default:
      schema = organizationSchema;
  }

  return <JsonLdScript schema={schema} />;
}

export function OrganizationJsonLd() {
  return <JsonLdScript schema={organizationSchema} />;
}

export function WebsiteJsonLd() {
  return <JsonLdScript schema={websiteSchema} />;
}

export function SoftwareJsonLd() {
  return <JsonLdScript schema={softwareApplicationSchema} />;
}

export function FaqJsonLd({
  data,
}: {
  data?: { questions: { question: string; answer: string }[] };
}) {
  return <JsonLdScript schema={buildFaqSchema(data)} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return <JsonLdScript schema={buildBreadcrumbSchema(items)} />;
}
