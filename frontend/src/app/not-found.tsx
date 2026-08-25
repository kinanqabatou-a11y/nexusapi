import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg-base px-4">
      <div className="text-center">
        <p className="text-[10rem] font-bold leading-none tracking-tighter text-text-primary">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-text-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Back to home
        </Link>
      </div>
      <p className="mt-16 text-sm text-text-muted">NexusAPI</p>
    </div>
  );
}
