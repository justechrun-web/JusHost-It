
'use client';

import { ArrowRight, ChevronRight, Menu, Bot } from 'lucide-react';

// =====================
// app/page.tsx — High-tech AI platform landing page
// =====================
// Tailwind-only, no external UI libs, production-safe

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
    {children}
  </a>
);

export default function LuminaLandingPage() {
  return (
    <div className="min-h-screen bg-[#0A101E] text-white font-sans overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-30" 
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(20, 83, 160, 0.4), transparent 70%), linear-gradient(to bottom, #0A101E, #0A101E)',
        }}
      >
        <div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwy1NSwwLjA1KSI+PGcgaWQ9ImdyaWQiPjxwYXRoIGQ9Ik0zMiAwIEwwIDAgTDAgMzIiLz48L2c+PC9zdmc+')] opacity-50">
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 md:px-10 max-w-screen-xl mx-auto">
          <div className="text-xl font-bold tracking-wider">Lumina</div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#">HOME</NavLink>
            <NavLink href="#">ABOUT</NavLink>
            <NavLink href="#">HOW IT WORKS</NavLink>
            <NavLink href="#">COMPARE</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center pt-24 pb-32 px-4">
          <div className="inline-block bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            #NEW: AI-POWERED AUTOMATION PLATFORM
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            AI That Connects Your Tools and Gets Work Done
          </h1>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              START BUILDING
            </button>
            <button className="bg-gray-800/50 border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              EXPLORE LUMINA
            </button>
          </div>
        </section>

        {/* Section 2: Build Better Products */}
        <section className="text-center pt-16 pb-24 px-4">
            <div className="relative flex flex-col items-center">
                <h2 className="text-2xl md:text-3xl font-semibold max-w-2xl mx-auto leading-relaxed mb-8">
                    Build better products. SDKs for your users, MCP servers for LLMs. On a platform made for your team.
                </h2>
                <div className="relative mb-8">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-50"></div>
                     <div className="relative w-16 h-16 bg-[#1D2432] border border-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bot className="w-8 h-8 text-blue-400"/>
                    </div>
                </div>
                <div className="h-24 w-px bg-gradient-to-b from-gray-700 to-transparent"></div>
            </div>
        </section>

        {/* Section 3: GTM at Full Throttle */}
        <section className="max-w-screen-xl mx-auto px-6 md:px-10 pb-24">
            <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 text-gray-400 text-xs font-bold px-3 py-1 rounded-md mb-4">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                WHAT WE DO
            </div>
            <h3 className="text-2xl md:text-4xl font-semibold max-w-3xl leading-snug">
                GTM at full throttle. Execute your revenue strategy with precision. Design powerful workflows.
            </h3>
        </section>
      </div>
    </div>
  );
}
