import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
            <span className="text-xl font-bold text-blue-500">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white">NexusAPI</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
