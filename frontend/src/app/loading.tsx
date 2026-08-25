export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="text-sm font-medium text-text-muted">NexusAPI</p>
      </div>
    </div>
  );
}
