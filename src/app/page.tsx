import { Check, Server, Shield, BarChart3, Zap, CreditCard, Users } from 'lucide-react';

// =====================
// app/page.tsx — High‑conversion marketing landing page
// Static, fast, investor‑grade
// =====================

export default function JusHostItLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="font-bold text-xl">JusHostIt</div>
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="/pricing" className="hover:underline">Pricing</a>
          <a href="/security" className="hover:underline">Security</a>
          <a href="/login" className="hover:underline">Login</a>
        </nav>
        <a href="/signup">
          <button className="px-4 py-2 rounded-lg bg-black text-white text-sm">Get Started</button>
        </a>
      </header>

      {/* HERO */}
      <section className="px-6 py-28 text-center bg-gradient-to-b from-gray-50 to-white">
        <h1 className="text-6xl font-bold tracking-tight mb-6">
          Hosting without surprises
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          JusHostIt is a modern hosting platform with transparent usage‑based pricing,
          built‑in cost controls, and enterprise‑grade security — no credit card required to start.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/signup">
            <button className="px-6 py-3 rounded-xl bg-black text-white font-medium text-lg">
              Start Free Trial
            </button>
          </a>
          <a href="/pricing">
            <button className="px-6 py-3 rounded-xl border border-gray-300 text-gray-900 font-medium text-lg">
              View Pricing
            </button>
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-6">7‑day free trial · No credit card required</p>
      </section>

      {/* TRUST */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm text-gray-600">
          <div>SOC‑2 Ready</div>
          <div>Stripe‑powered billing</div>
          <div>Google SSO</div>
          <div>Kubernetes‑backed</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <Feature icon={<Zap />} title="Instant Provisioning" desc="Deploy apps and infrastructure in seconds." />
          <Feature icon={<BarChart3 />} title="Usage Transparency" desc="Track CPU, memory, and bandwidth in real time." />
          <Feature icon={<Shield />} title="Enterprise Security" desc="RBAC, audit logs, MFA, and SSO ready." />
          <Feature icon={<CreditCard />} title="No Surprise Billing" desc="Free trials, alerts, caps, and auto‑suspension." />
          <Feature icon={<Users />} title="Team‑ready" desc="Organizations, roles, and admin controls built‑in." />
          <Feature icon={<Server />} title="Built for Scale" desc="Kubernetes‑native, production‑grade architecture." />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-12">How it works</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6">
          {[
            'Create your account',
            'Start your free trial',
            'Deploy instantly',
            'Pay only for what you use',
          ].map((step, i) => (
            <div key={i} className="border rounded-xl p-6 text-center">
              <p className="text-xl font-bold">{i + 1}</p>
              <p className="text-gray-600 mt-2">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 bg-gray-900 text-white text-center">
        <h2 className="text-5xl font-bold mb-6">Launch with confidence</h2>
        <p className="text-lg text-gray-300 mb-10">
          Transparent pricing, strong security, and full control — without enterprise complexity.
        </p>
        <a href="/signup">
          <button className="px-8 py-4 rounded-xl bg-white text-gray-900 font-medium text-lg">
            Start Your Free Trial
          </button>
        </a>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} JusHostIt · <a href="/terms" className="underline">Terms</a> · <a href="/privacy" className="underline">Privacy</a>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: JSX.Element; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
