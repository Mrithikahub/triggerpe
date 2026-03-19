'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, AlertTriangle, Shield, Loader2, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import type { Analytics, Claim } from '@/types';

const STATUS_COLORS = { approved: '#10b981', review: '#f59e0b', rejected: '#ef4444' };
const CITIES = ['mumbai', 'delhi', 'chennai', 'bangalore', 'hyderabad', 'kolkata', 'pune'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('mumbai');
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<any>(null);
  const [liveWeather, setLiveWeather] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [a, c] = await Promise.all([api.getAnalytics(), api.getAllClaims()]);
      setAnalytics(a); setClaims(c.claims || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchWeather = async () => {
    try { const w = await api.getLiveWeather(city); setLiveWeather(w); } catch { setLiveWeather(null); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchWeather(); }, [city]);

  const handleTrigger = async () => {
    setTriggerLoading(true);
    try {
      const r = await api.autoTrigger(city);
      setTriggerResult(r); fetchData();
    } catch {
      const types = [{ temperature: 30, rainfall: 80, aqi: 100 }, { temperature: 44, rainfall: 0, aqi: 100 }, { temperature: 30, rainfall: 0, aqi: 350 }];
      const idx = claims.length % 3;
      try { const r = await api.fireTrigger({ city, ...types[idx] }); setTriggerResult(r); fetchData(); } catch {}
    } finally { setTriggerLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!analytics) return null;

  const pieData = [
    { name: 'Approved', value: analytics.claims.approved },
    { name: 'Review', value: analytics.claims.review },
    { name: 'Rejected', value: analytics.claims.rejected },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2"><Shield className="h-7 w-7 text-blue-600" /><span className="text-xl font-bold">GigShield AI</span></Link>
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 font-medium">Admin Dashboard</span>
            <button onClick={fetchData} className="text-blue-600 flex items-center space-x-1 text-sm border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
              <RefreshCw className="h-4 w-4" /><span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {analytics.active_disruptions.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-700">Active Disruptions:</span>
            <span className="text-orange-600">{analytics.active_disruptions.join(', ')}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, color: 'bg-blue-50 text-blue-600', val: analytics.total_workers, label: 'Total Workers' },
            { icon: FileText, color: 'bg-green-50 text-green-600', val: analytics.total_claims, label: 'Total Claims' },
            { icon: AlertTriangle, color: 'bg-red-50 text-red-600', val: analytics.fraud_alerts, label: 'Fraud Alerts' },
            { icon: TrendingUp, color: 'bg-purple-50 text-purple-600', val: `₹${analytics.financials.net_position}`, label: 'Net Position' },
          ].map(({ icon: Icon, color, val, label }) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className={`w-11 h-11 ${color} rounded-lg flex items-center justify-center mb-3`}><Icon className="h-5 w-5" /></div>
              <p className="text-2xl font-bold text-gray-900">{val}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Claims Status</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Financials (₹)</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Premium In', v: analytics.financials.premium_in }, { name: 'Payouts Out', v: analytics.financials.payouts_out }, { name: 'Net', v: analytics.financials.net_position }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v}`} />
                  <Bar dataKey="v" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trigger Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><Zap className="h-5 w-5 text-orange-500 mr-2" />Fire Disruption Trigger</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <select value={city} onChange={e => setCity(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400">
                  {CITIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <button onClick={handleTrigger} disabled={triggerLoading}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center space-x-2 font-medium">
                  {triggerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                  <span>Fire Trigger</span>
                </button>
              </div>
              {triggerResult && (
                <div className={`p-3 rounded-lg text-sm ${triggerResult.triggered ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
                  {triggerResult.triggered
                    ? <><p className="font-semibold text-orange-700">⚠️ {triggerResult.city} disrupted!</p><p className="text-gray-600">{triggerResult.disruptions_detected?.join(', ')} · {triggerResult.claims_created} claims · ₹{triggerResult.total_payout_inr} payout</p></>
                    : <p className="text-gray-600">{triggerResult.message || 'No thresholds breached.'}</p>}
                </div>
              )}
            </div>
            {liveWeather && !liveWeather.error && liveWeather.weather && (
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-2">Live: {city}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-gray-500 text-xs">Temp</p><p className="font-bold">{liveWeather.weather.temperature?.toFixed(1)}°C</p></div>
                  <div><p className="text-gray-500 text-xs">Rain</p><p className="font-bold">{liveWeather.weather.rainfall?.toFixed(1)}mm</p></div>
                  <div><p className="text-gray-500 text-xs">AQI</p><p className="font-bold">{liveWeather.weather.aqi}</p></div>
                </div>
                {liveWeather.disrupted && <p className="text-red-600 font-semibold text-center mt-2">⚠️ DISRUPTION ACTIVE</p>}
              </div>
            )}
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Claims ({claims.length})</h3>
            <div className="flex space-x-3 text-xs font-medium">
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded">✓ {analytics.claims.approved}</span>
              <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">⏳ {analytics.claims.review}</span>
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded">✗ {analytics.claims.rejected}</span>
            </div>
          </div>
          {claims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-gray-400 text-xs uppercase tracking-wide">
                  <th className="py-2 px-3 text-left">Claim ID</th>
                  <th className="py-2 px-3 text-left">Worker</th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-left">Amount</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Fraud</th>
                  <th className="py-2 px-3 text-left">Date</th>
                </tr></thead>
                <tbody>
                  {claims.map(c => (
                    <tr key={c.claim_id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono text-xs text-gray-500">{c.claim_id}</td>
                      <td className="py-2 px-3 font-mono text-xs text-gray-500">{c.worker_id}</td>
                      <td className="py-2 px-3">{c.trigger_type.replace('_', ' ')}</td>
                      <td className="py-2 px-3 font-semibold">₹{c.amount}</td>
                      <td className="py-2 px-3">
                        <span className="flex items-center space-x-1">
                          {c.status === 'approved' ? <CheckCircle className="h-4 w-4 text-green-500" /> : c.status === 'rejected' ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                          <span className="capitalize">{c.status}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.fraud_score >= 0.65 ? 'bg-red-100 text-red-700' : c.fraud_score >= 0.35 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {c.fraud_score.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center text-gray-400 py-10">No claims yet. Fire a trigger above!</p>}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Policy Summary', items: [['Total', analytics.policies.total], ['Active', analytics.policies.active], ['Premium Collected', `₹${analytics.policies.premium_collected}`]] },
            { title: 'Fraud Summary', items: [['Flagged', analytics.fraud.flagged], ['Rejected', analytics.fraud.rejected], ['Fraud Rate', `${analytics.fraud.fraud_rate}%`]] },
            { title: 'Auto-Trigger Stats', items: [['Auto Claims', analytics.claims.auto_triggered], ['Total Payout', `₹${analytics.claims.total_payout}`], ['Net Position', `₹${analytics.financials.net_position}`]] },
          ].map(({ title, items }) => (
            <div key={title} className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h4>
              <div className="space-y-2">
                {items.map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between"><span className="text-gray-600 text-sm">{label}</span><span className="font-semibold text-sm">{val}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
