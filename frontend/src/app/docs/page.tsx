"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Key,
  FileText,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Menu,
  X,
  ChevronRight,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

const navSections = [
  { id: "getting-started", label: "Getting Started", icon: Zap },
  { id: "authentication", label: "Authentication", icon: Shield },
  { id: "api-keys", label: "Creating API Keys", icon: Key },
  { id: "first-request", label: "Your First Request", icon: ArrowRight },
  { id: "document-api", label: "Document API Reference", icon: FileText },
  { id: "error-codes", label: "Error Codes", icon: AlertTriangle },
  { id: "rate-limits", label: "Rate Limits", icon: Clock },
  { id: "code-examples", label: "Code Examples", icon: Code2 },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 rounded-md border border-border bg-bg-card p-1.5 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-bg-base overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-medium text-text-muted">{language}</span>
      </div>
      <div className="relative">
        <CopyButton text={code} />
        <pre className="overflow-x-auto p-4 text-sm font-mono text-text-secondary">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function EndpointCard({ method, path, description }: { method: string; path: string; description: string }) {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className={`inline-block rounded border px-2.5 py-0.5 text-xs font-bold ${methodColors[method] || ""}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-text-primary">{path}</code>
      </div>
      <p className="text-sm text-text-muted">{description}</p>
    </div>
  );
}

const errorCodes = [
  { code: 200, name: "OK", description: "Request succeeded" },
  { code: 201, name: "Created", description: "Resource created successfully" },
  { code: 204, name: "No Content", description: "Request succeeded, no content returned" },
  { code: 400, name: "Bad Request", description: "Invalid request body or parameters" },
  { code: 401, name: "Unauthorized", description: "Missing or invalid API key" },
  { code: 403, name: "Forbidden", description: "Insufficient permissions for this action" },
  { code: 404, name: "Not Found", description: "The requested resource does not exist" },
  { code: 409, name: "Conflict", description: "Resource already exists or conflict with current state" },
  { code: 422, name: "Unprocessable Entity", description: "Validation error in request data" },
  { code: 429, name: "Too Many Requests", description: "Rate limit exceeded, slow down" },
  { code: 500, name: "Internal Server Error", description: "Something went wrong on our end" },
];

const rateLimitTiers = [
  { plan: "Free", requests: "100", window: "per day", keys: "2" },
  { plan: "Starter", requests: "10,000", window: "per month", keys: "5" },
  { plan: "Pro", requests: "100,000", window: "per month", keys: "20" },
  { plan: "Enterprise", requests: "Unlimited", window: "per month", keys: "Unlimited" },
];

export default function DocsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-base">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-border bg-bg-elevated transition-transform lg:static lg:translate-x-0 lg:z-auto lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">
              <span className="text-text-primary">NexusAPI</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-text-muted lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Documentation</p>
          <ul className="space-y-1">
            {navSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                  }`}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-lg border border-border bg-bg-card p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">Need help?</p>
            <p className="mb-3 text-xs text-text-muted">Contact our support team for assistance.</p>
            <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light">
              Contact Support <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </nav>
      </aside>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-bg-elevated shrink-0">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">
              <span className="text-text-primary">NexusAPI</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Documentation</p>
          <ul className="space-y-1">
            {navSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
                  }`}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-lg border border-border bg-bg-card p-4">
            <p className="mb-2 text-sm font-semibold text-text-primary">Need help?</p>
            <p className="mb-3 text-xs text-text-muted">Contact our support team for assistance.</p>
            <Link href="/contact" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light">
              Contact Support <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-elevated px-6">
          <button onClick={() => setSidebarOpen(true)} className="text-text-muted lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
            <BookOpen className="h-5 w-5 text-primary" />
            Documentation
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Get Started
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
            <div className="mb-12">
              <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">NexusAPI Documentation</h1>
              <p className="mt-4 text-lg text-text-secondary">
                Everything you need to integrate with NexusAPI. Build powerful applications with our RESTful API.
              </p>
            </div>

            <section id="getting-started" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Getting Started</h2>
              <p className="mb-6 text-text-secondary">
                NexusAPI provides a simple, powerful REST API for managing documents, users, and subscriptions. Follow these steps to start making API calls in minutes.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-lg border border-border bg-bg-elevated p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">1</div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Sign up for an account</h3>
                    <p className="text-sm text-text-muted">Create a free account at <Link href="/register" className="text-primary hover:text-primary-light">nexusapi.dev/register</Link></p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-lg border border-border bg-bg-elevated p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">2</div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Generate an API key</h3>
                    <p className="text-sm text-text-muted">Navigate to your dashboard and create an API key from the API Keys section.</p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-lg border border-border bg-bg-elevated p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">3</div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Make your first API call</h3>
                    <p className="text-sm text-text-muted">Use your API key to authenticate requests. See the examples below.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="authentication" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Authentication</h2>
              <p className="mb-4 text-text-secondary">
                All API requests must be authenticated using a Bearer token. You receive access tokens when you log in or register.
              </p>
              <p className="mb-6 text-text-secondary">
                Include the token in the <code className="rounded bg-bg-card px-1.5 py-0.5 text-sm font-mono text-primary">Authorization</code> header of every request:
              </p>
              <CodeBlock
                language="HTTP Header"
                code="Authorization: Bearer YOUR_ACCESS_TOKEN"
              />
              <div className="mt-6 rounded-lg border border-border bg-bg-elevated p-4">
                <h3 className="mb-2 font-semibold text-text-primary">Token Lifecycle</h3>
                <ul className="space-y-1 text-sm text-text-secondary">
                  <li className="flex items-start gap-2"><span className="mt-1 text-primary">&#8226;</span> Access tokens expire after 30 minutes of inactivity.</li>
                  <li className="flex items-start gap-2"><span className="mt-1 text-primary">&#8226;</span> Use the refresh token endpoint to obtain a new access token.</li>
                  <li className="flex items-start gap-2"><span className="mt-1 text-primary">&#8226;</span> API keys are separate from user tokens and are used for server-to-server calls.</li>
                </ul>
              </div>
            </section>

            <section id="api-keys" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Creating API Keys</h2>
              <p className="mb-6 text-text-secondary">
                API keys allow your applications to authenticate with NexusAPI programmatically. Follow these steps to create one:
              </p>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                  <p className="text-text-secondary">Log in to your NexusAPI dashboard and navigate to <strong className="text-text-primary">API Keys</strong> in the sidebar.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                  <p className="text-text-secondary">Click the <strong className="text-text-primary">Create API Key</strong> button.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">3</span>
                  <p className="text-text-secondary">Give your key a descriptive name (e.g., &quot;Production Backend&quot;).</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">4</span>
                  <p className="text-text-secondary">Copy the generated key immediately. It will only be shown once.</p>
                </li>
              </ol>
              <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-400">Important: Store your API key securely. It cannot be retrieved after creation. If lost, generate a new one.</p>
              </div>
            </section>

            <section id="first-request" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Your First Request</h2>
              <p className="mb-6 text-text-secondary">
                Let&apos;s create a document using the Document API. This is the most common use case for NexusAPI.
              </p>
              <CodeBlock
                language="cURL"
                code={`curl -X POST https://api.nexusapi.dev/api/v1/documents \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My First Document",
    "content": "Hello, NexusAPI!",
    "type": "text"
  }'`}
              />
              <p className="mt-4 mb-2 text-text-secondary">Response:</p>
              <CodeBlock
                language="JSON"
                code={`{
  "id": "doc_abc123",
  "title": "My First Document",
  "content": "Hello, NexusAPI!",
  "type": "text",
  "created_at": "2026-08-25T10:30:00Z",
  "status": "active"
}`}
              />
            </section>

            <section id="document-api" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Document API Reference</h2>
              <p className="mb-6 text-text-secondary">
                The Document API allows you to create, retrieve, and delete documents programmatically.
              </p>

              <div className="space-y-4 mb-8">
                <EndpointCard method="POST" path="/api/v1/documents" description="Create a new document. Requires a JSON body with title, content, and optional type." />
                <EndpointCard method="GET" path="/api/v1/documents" description="List all documents. Supports pagination via ?page and ?limit query parameters." />
                <EndpointCard method="GET" path="/api/v1/documents/:id" description="Retrieve a specific document by its unique ID." />
                <EndpointCard method="DELETE" path="/api/v1/documents/:id" description="Permanently delete a document. This action cannot be undone." />
              </div>

              <h3 className="mb-3 text-lg font-semibold text-text-primary">Create Document</h3>
              <CodeBlock
                language="cURL"
                code={`curl -X POST https://api.nexusapi.dev/api/v1/documents \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Project Notes",
    "content": "Meeting notes from today...",
    "type": "markdown"
  }'`}
              />

              <h3 className="mb-3 mt-8 text-lg font-semibold text-text-primary">List Documents</h3>
              <CodeBlock
                language="cURL"
                code={`curl -X GET "https://api.nexusapi.dev/api/v1/documents?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
              />

              <h3 className="mb-3 mt-8 text-lg font-semibold text-text-primary">Delete Document</h3>
              <CodeBlock
                language="cURL"
                code={`curl -X DELETE https://api.nexusapi.dev/api/v1/documents/doc_abc123 \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
              />
            </section>

            <section id="error-codes" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Error Codes</h2>
              <p className="mb-6 text-text-secondary">
                NexusAPI uses standard HTTP status codes. The response body will always contain a JSON object with a <code className="rounded bg-bg-card px-1.5 py-0.5 text-sm font-mono text-primary">detail</code> field explaining the error.
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg-surface">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {errorCodes.map((err) => (
                      <tr key={err.code} className="transition-colors hover:bg-bg-card/50">
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={`font-mono font-bold ${
                            err.code < 300 ? "text-emerald-400" :
                            err.code < 400 ? "text-blue-400" :
                            err.code < 500 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {err.code}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">{err.name}</td>
                        <td className="px-4 py-3 text-text-muted">{err.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-text-primary">Error Response Example</h3>
                <CodeBlock
                  language="JSON"
                  code={`{
  "detail": "Invalid API key provided"
}`}
                />
              </div>
            </section>

            <section id="rate-limits" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Rate Limits</h2>
              <p className="mb-6 text-text-secondary">
                NexusAPI applies rate limits per plan to ensure fair usage and platform stability. When you exceed your limit, you&apos;ll receive a <code className="rounded bg-bg-card px-1.5 py-0.5 text-sm font-mono text-primary">429 Too Many Requests</code> response.
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg-surface">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Requests</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Window</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">API Keys</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rateLimitTiers.map((tier) => (
                      <tr key={tier.plan} className="transition-colors hover:bg-bg-card/50">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">{tier.plan}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-text-secondary">{tier.requests}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-text-muted">{tier.window}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-text-secondary">{tier.keys}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-sm text-text-secondary">
                  Rate limit headers are included in every response:
                </p>
                <CodeBlock
                  language="HTTP Headers"
                  code={`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9842
X-RateLimit-Reset: 1692000000`}
                />
              </div>
            </section>

            <section id="code-examples" className="mb-16 scroll-mt-24">
              <h2 className="mb-4 text-2xl font-bold text-text-primary">Code Examples</h2>
              <p className="mb-6 text-text-secondary">
                Ready-to-use code snippets for the most popular languages and frameworks.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-text-primary">cURL</h3>
              <CodeBlock
                language="cURL"
                code={`curl -X GET https://api.nexusapi.dev/api/v1/documents \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"`}
              />

              <h3 className="mb-3 mt-8 text-lg font-semibold text-text-title">Python</h3>
              <CodeBlock
                language="Python"
                code={`import requests

url = "https://api.nexusapi.dev/api/v1/documents"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}

# List all documents
response = requests.get(url, headers=headers)
documents = response.json()

# Create a new document
new_doc = {
    "title": "My Document",
    "content": "Document content here",
    "type": "text"
}
response = requests.post(url, json=new_doc, headers=headers)
created = response.json()`}
              />

              <h3 className="mb-3 mt-8 text-lg font-semibold text-text-title">JavaScript (Fetch)</h3>
              <CodeBlock
                language="JavaScript"
                code={`const API_URL = "https://api.nexusapi.dev/api/v1";
const headers = {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
};

// List all documents
const response = await fetch(\`\${API_URL}/documents\`, { headers });
const documents = await response.json();

// Create a new document
const createResponse = await fetch(\`\${API_URL}/documents\`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    title: "My Document",
    content: "Document content here",
    type: "text"
  })
});
const created = await createResponse.json();`}
              />

              <h3 className="mb-3 mt-8 text-lg font-semibold text-text-title">PHP</h3>
              <CodeBlock
                language="PHP"
                code={`<?php
$apiUrl = "https://api.nexusapi.dev/api/v1";
$token = "YOUR_ACCESS_TOKEN";

// List all documents
$ch = curl_init("$apiUrl/documents");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ]
]);
$response = curl_exec($ch);
$documents = json_decode($response, true);
curl_close($ch);

// Create a new document
$data = json_encode([
    "title" => "My Document",
    "content" => "Document content here",
    "type" => "text"
]);

$ch = curl_init("$apiUrl/documents");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $data,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ]
]);
$response = curl_exec($ch);
$created = json_decode($response, true);
curl_close($ch);
?>`}
              />
            </section>

            <div className="rounded-xl border border-border bg-bg-elevated p-8 text-center">
              <h2 className="mb-3 text-xl font-bold text-text-primary">Ready to build?</h2>
              <p className="mb-6 text-text-secondary">Start integrating with NexusAPI today and ship faster.</p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/register" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
                  Get Started Free
                </Link>
                <Link href="/contact" className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-card hover:text-text-primary transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
