'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, CloudRain, TrendingUp, Users, DollarSign, Activity, Zap, Menu, X, LogIn } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  const handleWorkerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId.trim()) { setLoginError('Please enter your Worker ID'); return; }
    setLoginLoading(true); setLoginError('');
    try {
      await api.getWorker(workerId.trim().toUpperCase());
      router.push(`/dashboard/${workerId.trim().toUpperCase()}`);
    } catch {
      setLoginError('Worker ID not found. Please register first.');
    } finally { setLoginLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Nav */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">GigShield AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#how-it-works" className="text-gray-300 hover:text-white text-sm">How It Works</a>
            <a href="#features" className="text-gray-300 hover:text-white text-sm">Features</a>
            <Link href="/admin/login" className="text-gray-300 hover:text-white text-sm">Admin</Link>
            <button onClick={() => setShowLogin(!showLogin)} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <LogIn className="h-4 w-4" /><span>Worker Login</span>
            </button>
            <Link href="/register" className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Register →
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Worker Login Dropdown */}
        {showLogin && (
          <div className="absolute right-4 top-16 md:right-8 bg-white rounded-2xl shadow-2xl p-6 w-80 z-50 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">Worker Login</h3>
            <p className="text-gray-500 text-sm mb-4">Enter your Worker ID to access your dashboard</p>
            {loginError && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">❌ {loginError}</p>}
            <form onSubmit={handleWorkerLogin} className="space-y-3">
              <input
                type="text"
                value={workerId}
                onChange={e => setWorkerId(e.target.value)}
                placeholder="e.g. W-08536B"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
              <button type="submit" disabled={loginLoading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-semibold flex items-center justify-center">
                {loginLoading ? 'Checking...' : 'Go to Dashboard →'}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3 text-center">Don't have an ID? <Link href="/register" className="text-blue-600 hover:underline">Register here</Link></p>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3">
            <a href="#how-it-works" className="block text-gray-300 py-2">How It Works</a>
            <a href="#features" className="block text-gray-300 py-2">Features</a>
            <Link href="/admin/login" className="block text-gray-300 py-2">Admin</Link>
            <button onClick={() => { setMobileMenuOpen(false); setShowLogin(true); }} className="block w-full text-left text-gray-300 py-2">Worker Login</button>
            <Link href="/register" className="block bg-blue-500 text-white px-4 py-2 rounded-lg text-center">Register</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-full mb-8 text-sm font-medium">
          <Zap className="h-4 w-4 mr-2" /> Guidewire DEVTrails 2026 Hackathon
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Insurance That<br /><span className="text-blue-400">Auto-Triggers</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          AI-powered parametric insurance for Zomato & Swiggy delivery partners. Get paid automatically when weather disrupts your work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors inline-flex items-center justify-center">
            Get Started <TrendingUp className="ml-2 h-5 w-5" />
          </Link>
          <button onClick={() => setShowLogin(true)} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-semibold transition-colors inline-flex items-center justify-center">
            <LogIn className="mr-2 h-5 w-5" /> Worker Login
          </button>
        </div>
      </section>

      {/* Live Stats */}
      {analytics && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, val: analytics.total_workers, label: 'Active Workers', color: 'text-blue-400' },
              { icon: DollarSign, val: `₹${analytics.financials?.premium_in?.toLocaleString() || 0}`, label: 'Premium Collected', color: 'text-green-400' },
              { icon: Activity, val: analytics.fraud_alerts, label: 'Fraud Alerts', color: 'text-orange-400' },
              { icon: CloudRain, val: analytics.active_disruptions?.length || 0, label: 'Active Disruptions', color: 'text-purple-400' },
            ].map(({ icon: Icon, val, label, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur-sm">
                <Icon className={`h-6 w-6 ${color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Register', desc: 'Sign up in 2 minutes. GPS auto-detects your city for fraud prevention.', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
            { num: '02', title: 'Get Covered', desc: 'AI calculates your risk using live WeatherAPI data and sets your weekly premium.', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
            { num: '03', title: 'Auto-Payout', desc: 'When rain/heat/AQI crosses thresholds, claims trigger and pay automatically via UPI.', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
          ].map(({ num, title, desc, color }) => (
            <div key={num} className={`border rounded-2xl p-6 ${color}`}>
              <p className="text-4xl font-bold opacity-40 mb-3">{num}</p>
              <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Why GigShield?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: CloudRain, title: 'Weather Triggers', desc: 'Automatic payouts when rain, heat, or AQI crosses thresholds — no manual filing.', color: 'text-blue-400 bg-blue-500/10' },
            { icon: Shield, title: 'AI Fraud Detection', desc: 'ML models detect GPS spoofing, duplicate claims, and suspicious patterns in real-time.', color: 'text-red-400 bg-red-500/10' },
            { icon: Zap, title: 'Instant UPI Payouts', desc: 'Verified claims pay out automatically within hours, not weeks.', color: 'text-yellow-400 bg-yellow-500/10' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-white/10 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Protect Your Income?</h2>
          <p className="text-gray-300 mb-8">Join delivery partners already protected by GigShield AI</p>
          <Link href="/register" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors inline-flex items-center">
            Register Now <TrendingUp className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-white font-bold">GigShield AI</span>
          </div>
          <p className="text-gray-500 text-sm">Built for Guidewire DEVTrails 2026 Hackathon</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/admin/login" className="text-gray-400 hover:text-white text-sm">Admin</Link>
            <Link href="/register" className="text-gray-400 hover:text-white text-sm">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
