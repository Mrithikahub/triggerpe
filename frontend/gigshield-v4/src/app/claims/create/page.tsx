'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { FileText, Loader2, CheckCircle, XCircle, AlertTriangle, CloudRain, Thermometer, Wind } from 'lucide-react';

const TRIGGERS = [
  { value: 'HEAVY_RAIN', label: 'Heavy Rain', icon: CloudRain, desc: 'Rainfall > 50mm/hr', color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'EXTREME_HEAT', label: 'Extreme Heat', icon: Thermometer, desc: 'Temperature > 42°C', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'HIGH_AQI', label: 'High AQI', icon: Wind, desc: 'AQI Index > 300', color: 'border-purple-500 bg-purple-50 text-purple-700' },
] as const;

export default function FileClaimPage() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId') || '';
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [triggerType, setTriggerType] = useState<'HEAVY_RAIN' | 'EXTREME_HEAT' | 'HIGH_AQI'>('HEAVY_RAIN');
  const [amount, setAmount] = useState(350);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!workerId) return;
    api.getWorker(workerId).then(setWorker).catch(console.error);
    api.getWorkerPolicies(workerId).then(p => setPolicy(p?.active_policy)).catch(console.error);
  }, [workerId]);

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) { alert('You need an active policy to file a claim!'); return; }
    setLoading(true); setResult(null);
    try {
      const r = await api.createClaim({
        worker_id: workerId,
        trigger_type: triggerType,
        amount,
        location: worker?.city || 'unknown',
      });
      setResult(r);
    } catch (e: any) {
      setResult({ error: e?.response?.data?.detail || 'Failed to submit claim' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar workerId={workerId} workerName={worker?.name} />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-xl mx-auto">

          <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-orange-500" />File a Claim
          </h1>
          <p className="text-gray-500 mb-6 text-sm">Submit a weather disruption claim for review</p>

          {!policy && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 text-sm">No active policy found</p>
                <p className="text-red-600 text-xs mt-0.5">You need an active policy to file claims.</p>
                <button onClick={() => router.push(`/policies/create?workerId=${workerId}`)} className="text-red-700 underline text-xs mt-1">Buy a policy →</button>
              </div>
            </div>
          )}

          {result ? (
            <div className={`rounded-2xl p-8 text-center border ${result.error ? 'bg-red-50 border-red-200' : result.status === 'approved' ? 'bg-green-50 border-green-200' : result.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              {result.error
                ? <><XCircle className="h-14 w-14 text-red-400 mx-auto mb-3" /><h2 className="text-lg font-bold text-red-800">Error</h2><p className="text-red-600 text-sm mt-1">{result.error}</p></>
                : result.status === 'approved'
                ? <><CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" /><h2 className="text-lg font-bold text-green-800">Claim Approved! 🎉</h2><p className="text-green-700 mt-1">₹{result.amount} will be paid via UPI</p><p className="text-green-500 text-xs mt-1">{result.claim_id}</p></>
                : result.status === 'rejected'
                ? <><XCircle className="h-14 w-14 text-red-400 mx-auto mb-3" /><h2 className="text-lg font-bold text-red-800">Claim Rejected</h2><p className="text-red-600 text-sm mt-1">Fraud score: {result.fraud_score}</p></>
                : <><AlertTriangle className="h-14 w-14 text-yellow-500 mx-auto mb-3" /><h2 className="text-lg font-bold text-yellow-800">Under Review</h2><p className="text-yellow-600 text-sm mt-1">{result.claim_id}</p></>}
              <div className="flex space-x-3 justify-center mt-5">
                <button onClick={() => setResult(null)} className="bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium">Submit Another</button>
                <button onClick={() => router.push(`/dashboard/${workerId}`)} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Dashboard</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitClaim} className="space-y-5">
              {/* Trigger type */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">Disruption Type</h2>
                <div className="space-y-2">
                  {TRIGGERS.map(({ value, label, icon: Icon, desc, color }) => (
                    <label key={value}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${triggerType === value ? color : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      <input type="radio" name="trigger" value={value} checked={triggerType === value} onChange={() => setTriggerType(value)} className="sr-only" />
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs opacity-70">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">
                  Claim Amount: <span className="text-orange-500">₹{amount}</span>
                  {policy && <span className="text-gray-400 font-normal ml-1">(max: ₹{policy.coverage_per_event})</span>}
                </h2>
                <input type="range" min="100" max={policy?.coverage_per_event || 500} step="50"
                  value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-orange-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹100</span><span>₹{policy?.coverage_per_event || 500}</span>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">📍 Location</span>
                  <span className="font-medium text-gray-700 capitalize">{worker?.city || 'detecting...'}</span>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-gray-500">🤖 Fraud detection</span>
                  <span className="text-green-600 font-medium">Auto-runs on submit</span>
                </div>
              </div>

              <button type="submit" disabled={loading || !policy}
                className="w-full bg-orange-500 text-white py-4 rounded-xl hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center font-bold text-base transition-colors">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Claim'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
