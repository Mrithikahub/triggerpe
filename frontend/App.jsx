import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CloudRain, Wind, Flame, AlertTriangle, Lock, Zap, TrendingUp, Users, DollarSign, Clock, CheckCircle, AlertCircle, MapPin, Heart, Navigation } from 'lucide-react';

const API = "http://localhost:8000";

const post = async (path, body) => {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "API Error");
  return data;
};

const get = async (path) => {
  const res = await fetch(`${API}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "API Error");
  return data;
};

export default function GigShieldAI() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [adminData, setAdminData] = useState(null);

  const recentClaims = [
    { id: 'CLM001', date: '15 Mar 2024', amount: '₹500', status: 'approved', reason: 'Heavy rainfall' },
    { id: 'CLM002', date: '14 Mar 2024', amount: '₹500', status: 'approved', reason: 'Extreme heat' },
    { id: 'CLM003', date: '13 Mar 2024', amount: '₹500', status: 'pending', reason: 'Curfew' },
    { id: 'CLM004', date: '12 Mar 2024', amount: '₹300', status: 'approved', reason: 'Poor AQI' },
  ];

  const Shield = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  );

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen overflow-hidden bg-white">
      <nav className="fixed top-0 w-full backdrop-blur-md border-b z-50 bg-white/90" style={{borderColor: 'rgba(0,0,0, 0.1)'}}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">GigShield AI</span>
          </div>
          <button 
            onClick={() => setCurrentPage('register')}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-sky-300/50 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="pt-40 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div style={{animation: 'slideInLeft 0.8s ease-out'}}>
              <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-sky-700 via-teal-700 to-emerald-600 bg-clip-text text-transparent leading-tight">
                Income Protection for Gig Workers
              </h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-lg">
                Weather won't stop you from earning. GigShield AI provides parametric insurance that pays instantly when disruptions hit. No forms. No waiting.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-sky-300/50 transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial
                </button>
                <button className="px-8 py-4 rounded-full border-2 border-sky-500 text-teal-600 font-bold text-lg hover:bg-teal-50 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            <div style={{animation: 'slideInRight 0.8s ease-out'}}>
              <div className="relative h-96">
                <div className="absolute top-0 right-0 w-64 h-40 rounded-3xl backdrop-blur-md bg-white/40 border border-white/60 p-6 shadow-2xl transform hover:scale-105 transition-all duration-300" style={{animation: 'float 3s ease-in-out infinite'}}>
                  <div className="flex items-center gap-3 mb-4">
                    <CloudRain className="w-8 h-8 text-sky-500" />
                    <span className="font-bold text-gray-700">Rain Guard</span>
                  </div>
                  <p className="text-sm text-gray-600">Coverage: ₹500/day</p>
                  <p className="text-sm text-gray-600">Premium: ₹49/month</p>
                </div>

                <div className="absolute bottom-0 left-0 w-64 h-40 rounded-3xl backdrop-blur-md bg-white/40 border border-white/60 p-6 shadow-2xl transform hover:scale-105 transition-all duration-300" style={{animation: 'float 3s ease-in-out infinite', animationDelay: '1s'}}>
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-8 h-8 text-amber-500" />
                    <span className="font-bold text-gray-700">Heat Shield</span>
                  </div>
                  <p className="text-sm text-gray-600">Coverage: ₹500/day</p>
                  <p className="text-sm text-gray-600">Premium: ₹49/month</p>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-sky-300/30 to-teal-300/30 rounded-full blur-3xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-16 bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent">
            Why GigShield AI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Instant Payouts', desc: 'Claims approved in minutes, not months' },
              { icon: Lock, title: 'AI-Powered', desc: 'Smart parametric insurance without paperwork' },
              { icon: TrendingUp, title: 'Fair Pricing', desc: 'Only pay for the coverage you need' },
            ].map((item, i) => (
              <div 
                key={i}
                className="p-8 rounded-3xl backdrop-blur-md bg-white/50 border border-white/60 hover:border-white/80 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <item.icon className="w-12 h-12 mb-4 text-sky-500" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );

  // Registration Page
  const RegistrationPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      platform: 'Zomato',
      city: '',
      work_zone: '',
      avg_daily_earning: 500
    });

    const handleRegister = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const response = await post('/api/workers/register', formData);
        setWorkerData(response);
        
        const quoteData = await post('/api/premium/quote', {
          city: formData.city,
          platform: formData.platform,
          work_zone: formData.work_zone,
          avg_daily_earning: formData.avg_daily_earning
        });
        setQuote(quoteData);
        setCurrentPage('purchase');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-teal-700 to-sky-700 bg-clip-text text-transparent mb-4">
              Join GigShield AI
            </h1>
            <p className="text-lg text-gray-600">Get protected in 3 minutes</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between mb-12">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 ${step === 1 ? 'bg-gradient-to-r from-sky-500 to-teal-500 shadow-lg' : 'bg-gray-300'}`}>
                    {step}
                  </div>
                  <span className="text-sm text-gray-600 text-center">{step === 1 ? 'Personal Info' : step === 2 ? 'Quote' : 'Payment'}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl backdrop-blur-md bg-white border border-gray-200 p-10 shadow-2xl">
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Rajesh Kumar" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-400 focus:outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number (10 digits)</label>
                  <input 
                    type="tel" 
                    placeholder="9876543210" 
                    maxLength="10"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-400 focus:outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Platform</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Zomato', 'Swiggy'].map(platform => (
                      <button 
                        key={platform} 
                        type="button"
                        onClick={() => setFormData({...formData, platform})}
                        className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                          formData.platform === platform 
                            ? 'border-sky-400 bg-sky-50 text-sky-700' 
                            : 'border-gray-200 hover:border-sky-400'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <input 
                    type="text" 
                    placeholder="Mumbai" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-400 focus:outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Work Zone</label>
                  <input 
                    type="text" 
                    placeholder="Bandra" 
                    value={formData.work_zone}
                    onChange={(e) => setFormData({...formData, work_zone: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-400 focus:outline-none transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Avg Daily Earning (₹)</label>
                  <input 
                    type="number" 
                    placeholder="500" 
                    value={formData.avg_daily_earning}
                    onChange={(e) => setFormData({...formData, avg_daily_earning: parseInt(e.target.value)})}
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-sky-400 focus:outline-none transition-all" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Get Your Quote →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Policy Purchase
  const PolicyPurchasePage = () => {
    const handlePurchase = async () => {
      if (!workerData || !quote) return;
      
      setLoading(true);
      setError(null);
      try {
        const policyResponse = await post('/api/policies/create', {
          worker_id: workerData.worker_id,
          weeks: 1
        });
        setActivePolicy(policyResponse);
        setCurrentPage('dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-sky-700 to-emerald-700 bg-clip-text text-transparent mb-4">
              Your Insurance Quote
            </h1>
            <p className="text-lg text-gray-600">Protect yourself from weather disruptions</p>
          </div>

          {quote && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl backdrop-blur-md bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-xl">
                <h3 className="text-3xl font-bold mb-6">Your Premium</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between pb-4 border-b border-white/20">
                    <span className="text-white/90">Risk Level:</span>
                    <span className="font-bold text-xl">{quote.risk_level}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-white/20">
                    <span className="text-white/90">Weekly Premium:</span>
                    <span className="font-bold text-2xl">₹{quote.weekly_premium}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-white/20">
                    <span className="text-white/90">Monthly Estimate:</span>
                    <span className="font-bold text-xl">₹{quote.monthly_estimate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/90">Coverage/Event:</span>
                    <span className="font-bold text-xl">₹{quote.coverage_per_event}</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white/20 rounded-lg border border-white/30">
                  <p className="text-sm leading-relaxed">{quote.advice}</p>
                </div>
              </div>

              <div className="p-8 rounded-2xl backdrop-blur-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
                <h3 className="text-3xl font-bold mb-6">What You Get</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <span>Instant automatic payouts when weather hits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <span>No paperwork or claim forms needed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <span>24/7 protection every day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <span>Covers: Heavy Rain, Heat, Floods, Curfews, Poor AQI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                    <span>Money directly to your UPI account</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700 max-w-2xl mx-auto">
              {error}
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <button 
              onClick={handlePurchase}
              disabled={loading || !workerData}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-sky-300/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Activate Coverage - ₹${quote?.weekly_premium || 0}/week`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Worker Dashboard
  const WorkerDashboard = () => {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent mb-2">
              Welcome back, {workerData?.name || 'Rajesh'}! 👋
            </h1>
            <p className="text-gray-600">Your income protection status</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {activePolicy && [
              { label: 'Coverage Status', value: activePolicy.is_active ? '✓ Active' : '✗ Inactive', color: 'from-sky-500 to-cyan-500' },
              { label: 'Weekly Premium', value: `₹${activePolicy.weekly_premium}`, color: 'from-teal-500 to-emerald-500' },
              { label: 'Per Event', value: `₹${activePolicy.coverage_per_event}`, color: 'from-cyan-500 to-teal-500' },
              { label: 'Valid Until', value: activePolicy.valid_until?.split('T')[0] || 'N/A', color: 'from-amber-400 to-yellow-400' },
            ].map((stat, i) => (
              <div 
                key={i}
                className={`p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br ${stat.color} text-white shadow-xl`}
              >
                <p className="text-sm font-semibold opacity-90 mb-2">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Claims</h2>
              <div className="space-y-4">
                {recentClaims.map(claim => (
                  <div key={claim.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-sky-300 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">{claim.reason}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${claim.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {claim.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{claim.date}</span>
                      <span className="font-bold text-green-600">{claim.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <button 
                  onClick={() => setCurrentPage('purchase')}
                  className="w-full py-3 mb-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-bold hover:shadow-lg transition-all"
                >
                  Add Policy
                </button>
                <button className="w-full py-3 mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg transition-all">
                  File Claim
                </button>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-bold hover:shadow-lg transition-all">
                  Track Claims
                </button>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-200 p-8 shadow-xl">
                <Heart className="w-6 h-6 text-red-500 mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Pro Tip</h3>
                <p className="text-sm text-gray-700">Your coverage triggers automatically. No need to file claims - we detect heavy rain, extreme heat, and other disruptions in real-time!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Claims Status Page
  const ClaimsStatusPage = () => (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-sky-700 to-teal-700 bg-clip-text text-transparent mb-2">
            Claims Status
          </h1>
          <p className="text-gray-600">Track all your insurance claims in real-time</p>
        </div>

        <div className="space-y-4">
          {recentClaims.map((claim, i) => (
            <div 
              key={i}
              className="rounded-2xl bg-white border border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">CLAIM ID</p>
                  <p className="text-lg font-bold text-gray-800">{claim.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">DATE</p>
                  <p className="text-lg font-bold text-gray-800">{claim.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">REASON</p>
                  <p className="text-lg font-bold text-gray-800">{claim.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">AMOUNT</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{claim.amount}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    claim.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {claim.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Admin Dashboard
  const AdminDashboard = () => {
    useEffect(() => {
      const fetchAdmin = async () => {
        try {
          const data = await get('/api/analytics/admin/summary');
          setAdminData(data);
        } catch (err) {
          console.error("Failed to load admin data:", err);
        }
      };
      fetchAdmin();
    }, []);

    return (
      <div className="min-h-screen pt-24 pb-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-sky-700 to-emerald-700 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mb-10">Platform performance & insights</p>

          {adminData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-xl">
                <p className="text-sm font-semibold opacity-90 mb-2">Total Workers</p>
                <p className="text-3xl font-black">{adminData.workers?.total || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-xl">
                <p className="text-sm font-semibold opacity-90 mb-2">Active Policies</p>
                <p className="text-3xl font-black">{adminData.policies?.active || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-xl">
                <p className="text-sm font-semibold opacity-90 mb-2">Claims Approved</p>
                <p className="text-3xl font-black">{adminData.claims?.approved || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-xl">
                <p className="text-sm font-semibold opacity-90 mb-2">Total Payouts</p>
                <p className="text-3xl font-black">₹{adminData.claims?.total_payout || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'register' && <RegistrationPage />}
      {currentPage === 'purchase' && <PolicyPurchasePage />}
      {currentPage === 'dashboard' && <WorkerDashboard />}
      {currentPage === 'claims' && <ClaimsStatusPage />}
      {currentPage === 'admin' && <AdminDashboard />}

      <div className="fixed bottom-0 w-full backdrop-blur-md bg-white/90 border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-center gap-3 flex-wrap">
          {[
            { key: 'landing', label: 'Landing' },
            { key: 'register', label: 'Register' },
            { key: 'purchase', label: 'Policies' },
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'claims', label: 'Claims' },
            { key: 'admin', label: 'Admin' },
          ].map(page => (
            <button 
              key={page.key}
              onClick={() => setCurrentPage(page.key)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${currentPage === page.key ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
