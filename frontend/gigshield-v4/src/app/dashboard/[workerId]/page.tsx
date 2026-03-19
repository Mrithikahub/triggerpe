'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { WeatherWidget } from '@/components/ui/WeatherWidget';
import { Shield, AlertTriangle, DollarSign, FileText, Clock, Loader2, RefreshCw, CheckCircle, XCircle, Zap } from 'lucide-react';
import type { Claim } from '@/types';

export default function DashboardPage() {
  const { workerId } = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [policies, setPolicies] = useState<any>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<any>(null);
  const [policyCreating, setPolicyCreating] = useState(false);

  const fetchAll = async () => {
    try {
      const [w, p, c] = await Promise.all([
        api.getWorker(workerId as string),
        api.getWorkerPolicies(workerId as string),
        api.getWorkerClaims(workerId as string),
      ]);
      setWorker(w); setPolicies(p); setClaims(c);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [workerId]);

  const createPolicy = async () => {
    setPolicyCreating(true);
    try {
      await api.createPolicy({ worker_id: workerId as string, weeks: 1 });
      await fetchAll();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || '';
      if (msg.includes('already exists')) {
        await fetchAll(); // Policy exists, just refresh
      } else {
        alert('Could not create policy: ' + msg);
      }
    } finally { setPolicyCreating(false); }
  };

  const handleTrigger = async () => {
    if (!worker) return;
    setTriggerLoading(true);
    try {
      // Try live weather trigger first
      const r = await api.autoTrigger(worker.city);
      setTriggerResult(r); fetchAll();
    } catch {
      // Fallback: cycle through demo disruptions
      const types = [
        { temperature: 30, rainfall: 80, aqi: 100 },
        { temperature: 44, rainfall: 0,  aqi: 100 },
        { temperature: 30, rainfall: 0,  aqi: 350 },
      ];
      const idx = (claims?.claims?.length || 0) % 3;
      try {
        const r = await api.fireTrigger({ city: worker.city, ...types[idx] });
        setTriggerResult(r); fetchAll();
      } catch {}
    } finally { setTriggerLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (!worker) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Worker not found. <button onClick={() => router.push('/register')} className="ml-2 text-blue-600 underline">Register here</button>
    </div>
  );

  const approvedCount = claims?.claims?.filter((c: Claim) => c.status === 'approved').length || 0;
  const activePolicy = policies?.active_policy;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar workerId={workerId as string} workerName={worker.name} />

      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome, {worker.name}! 👋</h1>
              <p className="text-gray-500 mt-1 text-sm capitalize">📍 {worker.city} · {worker.platform} · {worker.worker_id}</p>
            </div>
            <button onClick={fetchAll} className="flex items-center space-x-1 text-blue-600 text-sm border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
              <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline ml-1">Refresh</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Shield, color: 'text-blue-600 bg-blue-50', val: worker.risk_level.toUpperCase(), label: 'Risk Level', sub: `Score: ${worker.risk_score}` },
              { icon: DollarSign, color: 'text-green-600 bg-green-50', val: activePolicy ? `₹${activePolicy.coverage_per_event}` : '—', label: 'Coverage/Event', sub: activePolicy ? 'Active policy' : 'No policy yet' },
              { icon: FileText, color: 'text-purple-600 bg-purple-50', val: claims?.total_claims || 0, label: 'Total Claims', sub: `${approvedCount} approved` },
              { icon: Clock, color: 'text-orange-600 bg-orange-50', val: `₹${claims?.total_paid || 0}`, label: 'Total Paid Out', sub: 'All time' },
            ].map(({ icon: Icon, color, val, label, sub }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}><Icon className="h-5 w-5" /></div>
                <p className="text-xl font-bold text-gray-900 capitalize">{val}</p>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Weather + Policy row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WeatherWidget city={worker.city} />

            {activePolicy ? (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg flex items-center"><Shield className="mr-2 h-5 w-5" />Active Policy</h3>
                  <span className="bg-green-400 text-white text-xs px-2 py-1 rounded-full font-bold">✓ ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Coverage/Event', `₹${activePolicy.coverage_per_event}`],
                    ['Weekly Premium', `₹${activePolicy.weekly_premium}`],
                    ['Risk Level', activePolicy.risk_level],
                    ['Valid Until', new Date(activePolicy.end_date).toLocaleDateString('en-IN')],
                  ].map(([label, val]) => (
                    <div key={label}><p className="text-blue-100 text-xs">{label}</p><p className="font-bold capitalize">{val}</p></div>
                  ))}
                </div>
                <button onClick={() => router.push(`/premium/${workerId}`)}
                  className="mt-4 w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Renew / Upgrade Policy
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200">
                <Shield className="h-12 w-12 text-gray-200 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No Active Policy</h3>
                <p className="text-gray-400 text-sm mb-4">You need a policy to receive payouts when disruptions happen</p>
                <div className="flex space-x-3">
                  <button onClick={createPolicy} disabled={policyCreating}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2 disabled:bg-gray-400">
                    {policyCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    <span>{policyCreating ? 'Creating...' : 'Quick Activate (1 week)'}</span>
                  </button>
                  <button onClick={() => router.push(`/premium/${workerId}`)}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50">
                    See Quote
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trigger */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <Zap className="h-5 w-5 text-orange-500 mr-2" />Trigger Disruption Demo
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Tries live weather first — falls back to demo values (Heavy Rain → Heat → AQI) if weather unavailable.
            </p>
            <button onClick={handleTrigger} disabled={triggerLoading}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 flex items-center space-x-2 font-medium text-sm transition-colors">
              {triggerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              <span>{triggerLoading ? 'Triggering...' : 'Trigger Disruption'}</span>
            </button>
            {triggerResult && (
              <div className={`mt-3 p-4 rounded-lg text-sm ${triggerResult.triggered ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
                {triggerResult.triggered ? (
                  <>
                    <p className="font-semibold text-orange-700">⚠️ Disruption triggered in {triggerResult.city}!</p>
                    <p className="text-gray-600 mt-1">
                      Events: <b>{triggerResult.disruptions_detected?.join(', ')}</b> ·
                      Claims: <b>{triggerResult.claims_created}</b> ·
                      Payout: <b>₹{triggerResult.total_payout_inr}</b>
                      {triggerResult.weather?.source && <span className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded">{triggerResult.weather.source}</span>}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">{triggerResult.message || 'No thresholds breached.'}</p>
                )}
              </div>
            )}
          </div>

          {/* Claims */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Recent Claims</h3>
              <span className="text-sm text-green-600 font-medium">₹{claims?.total_paid || 0} total paid</span>
            </div>
            {claims?.claims?.length > 0 ? (
              <div className="space-y-2">
                {claims.claims.slice(0, 6).map((claim: Claim) => (
                  <div key={claim.claim_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {claim.status === 'approved' ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        : claim.status === 'rejected' ? <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        : <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                      <div>
                        <p className="font-medium text-sm">{claim.trigger_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-400">{claim.claim_id} · {new Date(claim.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{claim.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${claim.status === 'approved' ? 'bg-green-100 text-green-700' : claim.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Shield className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No claims yet. Trigger a disruption above!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
