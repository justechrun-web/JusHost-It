'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-slate-600">
          An unexpected error occurred. Our team has visibility into this.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded bg-slate-900 text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
