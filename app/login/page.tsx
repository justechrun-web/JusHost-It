// app/login/page.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold mb-2">Sign in to JusHost It</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Access your dashboard
        </p>

        <button className="w-full rounded-xl bg-blue-600 py-2 font-medium hover:bg-blue-500 transition">
          Continue with Email
        </button>

        <p className="text-xs text-neutral-500 mt-6 text-center">
          Don’t have an account? Sign up automatically on first login.
        </p>
      </div>
    </div>
  );
}