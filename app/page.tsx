'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] text-white overflow-hidden">
      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-lg font-semibold tracking-tight">JusHost It</div>
        <nav className="hidden md:flex gap-6 text-sm text-neutral-300">
          <a className="hover:text-white" href="#">Home</a>
          <a className="hover:text-white" href="#">About</a>
          <a className="hover:text-white" href="#">Why JusHost</a>
          <a className="hover:text-white" href="#">Compare</a>
        </nav>
        <Button size="sm" className="rounded-full" onClick={() => window.location.href = '/login'}>Get Started</Button>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-40">
        {/* Glow background */}
        <div className="absolute inset-0 flex justify-center">
          <div className="w-[900px] h-[900px] bg-blue-500/20 blur-[140px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <span className="inline-block mb-6 px-4 py-1.5 text-xs rounded-full border border-blue-400/30 text-blue-300">
            AI‑Powered Hosting Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Hosting That <span className="text-blue-400">Connects</span> Your Stack
            <br /> and Gets Work Done
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            JusHost It automates infrastructure, deployments, and scaling — so you ship faster with less friction.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" className="rounded-full px-8" onClick={() => window.location.href = '/login'}>
              Start Building
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 border-neutral-700" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 border-t border-white/10" />

      {/* Value Prop */}
      <section id="features" className="relative z-10 py-28 text-center px-6">
        <h2 className="text-2xl md:text-3xl font-medium">
          Build better products.
        </h2>
        <p className="mt-4 text-neutral-400 max-w-3xl mx-auto">
          Hosting, CI, secrets, environments, and automation designed for modern teams.
          JusHost It gives you one platform instead of five tools.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {["Automated Deploys", "Smart Environments", "Secure by Default"].map((title) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur"
            >
              <h3 className="text-lg font-medium mb-2">{title}</h3>
              <p className="text-sm text-neutral-400">
                Built-in intelligence to remove manual ops and keep your system fast, safe, and scalable.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold">Ship faster with confidence</h2>
        <p className="mt-4 text-neutral-400">Deploy once. Scale forever.</p>
        <Button size="lg" className="mt-8 rounded-full px-10" onClick={() => window.location.href = '/login'}>
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}
