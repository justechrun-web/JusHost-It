'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AboutUsPage() {
    
    useEffect(() => {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e: Event) {
                e.preventDefault();
                const targetId = (this as HTMLAnchorElement).getAttribute('href');
                if (targetId) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Add scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target as HTMLElement;
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .glass').forEach((el) => {
            const element = el as HTMLElement;
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });

        // Cleanup observers on component unmount
        return () => {
            document.querySelectorAll('.feature-card, .glass').forEach((el) => {
                observer.unobserve(el);
            });
        }
    }, []);

    return (
        <div className="bg-slate-950 text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                                </svg>
                            </div>
                            <span className="text-xl font-bold">Justechrun Systems Inc</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#about" className="nav-link text-slate-300 hover:text-white">About</a>
                            <a href="#approach" className="nav-link text-slate-300 hover:text-white">Approach</a>
                            <a href="#capabilities" className="nav-link text-slate-300 hover:text-white">Capabilities</a>
                            <a href="/dashboard" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all">Go to App</a>
                        </div>
                        <button className="md:hidden text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 grid-pattern opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
                
                <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
                    <div className="mb-6">
                        <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                            Where Systems Meet Intelligence
                        </span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Engineering Intelligent<br/>
                        <span className="gradient-text">Systems for the Modern World</span>
                    </h1>
                    
                    <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        We design and develop modern software platforms where automation, intelligence, and thoughtful design come together seamlessly. Technology that amplifies human capability—not overwhelms it.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#contact" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all transform hover:scale-105">
                            Start Your Project
                        </a>
                        <a href="#about" className="px-8 py-4 glass rounded-lg font-semibold text-lg hover:bg-white/10 transition-all">
                            Learn More
                        </a>
                    </div>
                    
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div>
                            <div className="text-4xl font-bold gradient-text mb-2">100%</div>
                            <div className="text-slate-400 text-sm">Client Satisfaction</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
                            <div className="text-slate-400 text-sm">System Reliability</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold gradient-text mb-2">10x</div>
                            <div className="text-slate-400 text-sm">Efficiency Gains</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Built for Scale.<br/>
                                <span className="gradient-text">Designed for Clarity.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                Today's businesses face fragmented tools, complex infrastructure, and rapidly evolving technology. Justechrun Systems Inc was founded to simplify that complexity.
                            </p>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                We build systems that are modular, secure, and intelligent—designed to adapt as your business grows, engineered with reliability in mind, and powered by automation where it delivers real value.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="glass rounded-2xl p-8 feature-card">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">Modular Architecture</h3>
                                            <p className="text-slate-400">Systems designed to adapt and scale as your business evolves</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
                                            <p className="text-slate-400">Engineered with reliability and compliance at the core</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
                                            <p className="text-slate-400">Automation that delivers measurable business value</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Approach Section */}
            <section id="approach" className="py-24 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            <span className="gradient-text">Human-Centered</span> Technology
                        </h2>
                        <p className="text-slate-400 text-xl max-w-3xl mx-auto">
                            Technology should amplify human capability—not overwhelm it. Our approach is grounded in engineering precision and user-focused design.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass rounded-2xl p-8 feature-card">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Clean Interfaces</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Minimal, intuitive designs that reduce friction and enhance productivity. Every interaction is purposeful.
                            </p>
                        </div>
                        
                        <div className="glass rounded-2xl p-8 feature-card">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Intelligent Workflows</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Automated processes that streamline decision-making and eliminate repetitive tasks at scale.
                            </p>
                        </div>
                        
                        <div className="glass rounded-2xl p-8 feature-card">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">User-First Design</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Systems designed around how people actually work, not how technology dictates they should.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="glass rounded-2xl p-10">
                            <div className="text-blue-400 text-sm font-semibold mb-4 uppercase tracking-wider">Our Mission</div>
                            <h3 className="text-3xl font-bold mb-6">Empowering Organizations</h3>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                To design and deploy intelligent technology systems that empower organizations to operate efficiently, innovate confidently, and scale sustainably.
                            </p>
                        </div>
                        
                        <div className="glass rounded-2xl p-10">
                            <div className="text-purple-400 text-sm font-semibold mb-4 uppercase tracking-wider">Our Vision</div>
                            <h3 className="text-3xl font-bold mb-6">Trusted Technology Partner</h3>
                            <p className="text-slate-300 text-lg leading-relaxed">
                                To become a trusted technology partner for forward-thinking companies—providing the infrastructure, intelligence, and tools that power the next generation of digital businesses.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section id="capabilities" className="py-24 bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Foundations That <span className="gradient-text">Scale</span>
                        </h2>
                        <p className="text-slate-400 text-xl max-w-3xl mx-auto">
                            We don't chase trends—we engineer foundations. Foundations that adapt, perform, and endure.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">🏗️</div>
                            <h4 className="font-semibold mb-2">System Architecture</h4>
                            <p className="text-slate-400 text-sm">Scalable infrastructure designed for growth</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">🤖</div>
                            <h4 className="font-semibold mb-2">AI & Automation</h4>
                            <p className="text-slate-400 text-sm">Intelligent workflows that drive efficiency</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">☁️</div>
                            <h4 className="font-semibold mb-2">Cloud Solutions</h4>
                            <p className="text-slate-400 text-sm">Modern infrastructure with enterprise reliability</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">📊</div>
                            <h4 className="font-semibold mb-2">Data Intelligence</h4>
                            <p className="text-slate-400 text-sm">Insights that power strategic decisions</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">🔐</div>
                            <h4 className="font-semibold mb-2">Security & Compliance</h4>
                            <p className="text-slate-400 text-sm">Enterprise-grade protection by design</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">⚡</div>
                            <h4 className="font-semibold mb-2">Performance Optimization</h4>
                            <p className="text-slate-400 text-sm">Systems engineered for speed and efficiency</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">🔄</div>
                            <h4 className="font-semibold mb-2">Integration Services</h4>
                            <p className="text-slate-400 text-sm">Seamless connectivity across platforms</p>
                        </div>
                        
                        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="text-2xl mb-3">📱</div>
                            <h4 className="font-semibold mb-2">Modern Platforms</h4>
                            <p className="text-slate-400 text-sm">Applications built for today and tomorrow</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to Build Something<br/>
                                <span className="gradient-text">Exceptional?</span>
                            </h2>
                            <p className="text-slate-400 text-xl mb-8 max-w-2xl mx-auto">
                                Let's discuss how Justechrun Systems Inc can help you build the intelligent, scalable foundation your business deserves.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="mailto:hello@justechrun.com" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all transform hover:scale-105">
                                    Start a Conversation
                                </a>
                                <a href="#about" className="px-8 py-4 glass rounded-lg font-semibold text-lg hover:bg-white/10 transition-all">
                                    View Our Work
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                                    </svg>
                                </div>
                                <span className="text-xl font-bold">Justechrun Systems Inc</span>
                            </div>
                            <p className="text-slate-400 max-w-md">
                                Engineering intelligent systems for the modern world. Where systems meet intelligence.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#approach" className="hover:text-white transition-colors">Our Approach</a></li>
                                <li><a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a></li>
                                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="mailto:hello@justechrun.com" className="hover:text-white transition-colors">Email Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-sm">
                            © 2025 Justechrun Systems Inc. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-slate-500 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
