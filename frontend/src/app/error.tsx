"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg-base px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="mt-2 max-w-md text-text-muted">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
