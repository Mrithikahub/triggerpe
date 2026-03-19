'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function BuyPolicyPage() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId') || '';
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [worker, setWorker] = useState<any>(null);
  const [weeks, setWeeks] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingPolicy, setExistingPolicy] = useState<any>(null);

  useEffect(() => {
    if (!workerId) return;
    Promise.all([
      api.getWorker(workerId),
      api.getPremiumQuote(workerId),
      api.getWorkerPolicies(workerId),
    ]).then(([w, q, p]) => {
      setWorker(w); setQuote(q);
      if (p?.active_policy) setExistingPolicy(p.active_policy);
    }).catch(console.error).finally(() => setLoading(false));
  }, [workerId]);

  const buyPolicy = async () => {
    setBuying(true);
    try {
      await api.createPolicy({ worker_id: workerId, weeks });
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/${workerId}`), 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || '';
      if (msg.includes('already exists')) {
        // Just redirect — policy exists
        router.push(`/dashboard/${workerId}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar workerId={workerId} workerName={worker?.name} />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-xl mx-auto">

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Buy Insurance Policy</h1>
          <p className="text-gray-500 mb-6 text-sm">Choose your coverage duration and activate</p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-800">Policy Activated! 🎉</h2>
              <p className="text-green-600 mt-2">Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Existing policy warning */}
              {existingPolicy && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 text-sm">You already have an active policy</p>
                    <p className="text-yellow-600 text-xs mt-0.5">Policy {existingPolicy.policy_id} · Valid until {new Date(existingPolicy.end_date).toLocaleDateString('en-IN')}</p>
                    <button onClick={() => router.push(`/dashboard/${workerId}`)} className="text-yellow-700 underline text-xs mt-1">View on Dashboard →</button>
                  </div>
                </div>
              )}

              {/* Quote card */}
              {quote && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
                    <h2 className="font-semibold text-lg">Your Quote</h2>
                    <p className="text-blue-100 text-sm">Based on live weather + AI risk assessment</p>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Risk Level', val: quote.risk_level, capitalize: true },
                      { label: 'Weekly Premium', val: `₹${quote.weekly_premium}` },
                      { label: 'Coverage/Event', val: `₹${quote.coverage_per_event}` },
                      { label: 'Risk Score', val: quote.risk_score },
                    ].map(({ label, val, capitalize }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                        <p className={`font-bold text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration picker */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Coverage Duration</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 4].map(w => (
                    <button key={w} onClick={() => setWeeks(w)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${weeks === w ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <p className="font-semibold text-gray-900 text-sm">{w} Week{w > 1 ? 's' : ''}</p>
                      <p className="text-blue-600 font-bold mt-1">₹{quote ? (quote.weekly_premium * w).toFixed(0) : '—'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total to Pay</span>
                <span className="text-2xl font-bold text-blue-600">₹{quote ? (quote.weekly_premium * weeks).toFixed(0) : '—'}</span>
              </div>

              <button onClick={buyPolicy} disabled={buying}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center font-bold text-base transition-colors">
                {buying ? <Loader2 className="animate-spin h-5 w-5" /> : <><Shield className="mr-2 h-5 w-5" />Activate Policy</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
