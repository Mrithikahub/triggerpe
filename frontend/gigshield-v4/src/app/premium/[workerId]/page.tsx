'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Shield, CheckCircle, Loader2, TrendingUp, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export default function PremiumPage() {
  const { workerId } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [existingPolicy, setExistingPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weeks, setWeeks] = useState(1);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const fetchData = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const [w, q, p] = await Promise.all([
        api.getWorker(workerId as string),
        api.getPremiumQuote(workerId as string),
        api.getWorkerPolicies(workerId as string),
      ]);
      setWorker(w); setQuote(q);
      if (p?.active_policy) setExistingPolicy(p.active_policy);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load quote');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [workerId]);

  const buyPolicy = async () => {
    setBuying(true);
    try {
      const policy = await api.createPolicy({ worker_id: workerId as string, weeks });
      setSuccess(policy);
      setExistingPolicy(policy);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || '';
      if (msg.includes('already exists')) {
        // Renew: show existing policy as success
        setSuccess(existingPolicy);
      } else {
        alert(msg || 'Failed to create policy');
      }
    } finally { setBuying(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  const riskBadge: Record<string, string> = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar workerId={workerId as string} workerName={worker?.name} />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-2xl">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-green-500" />Premium Calculator
              </h1>
              <p className="text-gray-500 text-sm mt-1">AI-powered pricing using live weather data</p>
            </div>
            <button onClick={fetchData} className="text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center space-x-1 text-sm">
              <RefreshCw className="h-4 w-4" /><span>Recalculate</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h2 className="font-bold text-green-800 text-lg">Policy Activated! 🎉</h2>
                  <p className="text-green-600 text-sm">{success.policy_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Coverage/Event', val: `₹${success.coverage_per_event}` },
                  { label: 'Weekly Premium', val: `₹${success.weekly_premium}` },
                  { label: 'Valid Until', val: new Date(success.end_date || success.valid_until).toLocaleDateString('en-IN') },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white rounded-xl p-3 text-center border border-green-100">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-bold text-gray-900 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push(`/dashboard/${workerId}`)}
                className="mt-4 w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 font-medium text-sm">
                Go to Dashboard →
              </button>
            </div>
          )}

          {/* Existing policy notice */}
          {existingPolicy && !success && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">You have an active policy ({existingPolicy.policy_id})</p>
                <p className="text-blue-600 text-xs mt-0.5">Valid until {new Date(existingPolicy.end_date).toLocaleDateString('en-IN')} · You can purchase an additional week below</p>
              </div>
            </div>
          )}

          {quote && !success && (
            <div className="space-y-4">
              {/* Risk profile hero card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Your Risk Profile</p>
                      <p className="text-4xl font-bold text-white">₹{quote.weekly_premium}</p>
                      <p className="text-blue-200 text-sm mt-1">per week</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold border capitalize ${riskBadge[quote.risk_level] || 'bg-gray-100 text-gray-700'}`}>
                        {quote.risk_level} risk
                      </span>
                      <p className="text-blue-200 text-xs mt-2">Score: {quote.risk_score}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Coverage/Event', val: `₹${quote.coverage_per_event}` },
                      { label: 'Risk Zone', val: quote.risk_zone },
                      { label: 'Disruption Prob.', val: `${(quote.disruption_probability * 100).toFixed(0)}%` },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-white/10 rounded-xl p-3">
                        <p className="text-blue-100 text-xs">{label}</p>
                        <p className="text-white font-bold capitalize mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Zap className="h-4 w-4 text-yellow-500 mr-1.5" />Premium Breakdown
                  </p>
                  <div className="space-y-2">
                    {quote.breakdown && Object.entries(quote.breakdown).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-gray-500 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-gray-800">₹{String(val)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 mt-1">
                      <span className="font-bold text-gray-900">Weekly Total</span>
                      <span className="font-bold text-blue-600 text-xl">₹{quote.weekly_premium}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration picker */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="font-semibold text-gray-900 mb-3 text-sm">Choose Duration</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { w: 1, badge: null },
                    { w: 2, badge: 'Popular' },
                    { w: 4, badge: 'Best Value' },
                  ].map(({ w, badge }) => (
                    <button key={w} onClick={() => setWeeks(w)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-center ${weeks === w ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      {badge && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{badge}</span>}
                      <p className="font-bold text-gray-900">{w} Week{w > 1 ? 's' : ''}</p>
                      <p className="text-blue-600 font-bold text-lg mt-1">₹{(quote.weekly_premium * w).toFixed(0)}</p>
                      {w > 1 && <p className="text-green-600 text-xs mt-0.5">₹{quote.weekly_premium}/wk</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total + CTA */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Total to Pay</p>
                    <p className="text-4xl font-bold text-blue-600">₹{(quote.weekly_premium * weeks).toFixed(0)}</p>
                    <p className="text-gray-400 text-xs mt-1">Covers {weeks} week{weeks > 1 ? 's' : ''} · ₹{quote.coverage_per_event} per disruption event</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg font-medium">✓ Instant Activation</div>
                    <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium mt-1">✓ Auto-Payout</div>
                  </div>
                </div>
                <button onClick={buyPolicy} disabled={buying}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center font-bold text-lg transition-colors shadow-lg shadow-blue-200">
                  {buying ? <Loader2 className="animate-spin h-6 w-6" /> : <><Shield className="mr-2 h-5 w-5" />Activate Policy — ₹{(quote.weekly_premium * weeks).toFixed(0)}</>}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">Powered by AI risk assessment · WeatherAPI.com live data · Auto-claims on disruption</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
