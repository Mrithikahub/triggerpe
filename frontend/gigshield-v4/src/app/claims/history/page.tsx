'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { History, CheckCircle, XCircle, Clock, Loader2, RefreshCw, CloudRain, Thermometer, Wind } from 'lucide-react';
import type { Claim } from '@/types';

const TRIGGER_ICONS: Record<string, any> = {
  HEAVY_RAIN: CloudRain,
  EXTREME_HEAT: Thermometer,
  HIGH_AQI: Wind,
};

export default function ClaimHistoryPage() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('workerId') || '';
  const [worker, setWorker] = useState<any>(null);
  const [claims, setClaims] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'review' | 'rejected'>('all');

  const fetchData = () => {
    if (!workerId) return;
    Promise.all([api.getWorker(workerId), api.getWorkerClaims(workerId)])
      .then(([w, c]) => { setWorker(w); setClaims(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [workerId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  const allClaims: Claim[] = claims?.claims || [];
  const filtered = filter === 'all' ? allClaims : allClaims.filter(c => c.status === filter);

  const counts = {
    all: allClaims.length,
    approved: allClaims.filter(c => c.status === 'approved').length,
    review: allClaims.filter(c => c.status === 'review').length,
    rejected: allClaims.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar workerId={workerId} workerName={worker?.name} />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <History className="mr-2 h-6 w-6 text-indigo-500" />Claim History
              </h1>
              <p className="text-gray-500 mt-1 text-sm">All your insurance claims</p>
            </div>
            <button onClick={fetchData} className="flex items-center space-x-1.5 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-sm">
              <RefreshCw className="h-4 w-4" /><span>Refresh</span>
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Claims', val: counts.all, color: 'text-gray-900 bg-white' },
              { label: 'Approved', val: counts.approved, color: 'text-green-700 bg-green-50' },
              { label: 'Under Review', val: counts.review, color: 'text-yellow-700 bg-yellow-50' },
              { label: 'Total Paid', val: `₹${claims?.total_paid || 0}`, color: 'text-blue-700 bg-blue-50' },
            ].map(({ label, val, color }) => (
              <div key={label} className={`${color} rounded-xl p-4 border border-gray-100 shadow-sm text-center`}>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-sm opacity-70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-1">
            {(['all', 'approved', 'review', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
              </button>
            ))}
          </div>

          {/* Claims list */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filtered.map((c: Claim) => {
                  const TriggerIcon = TRIGGER_ICONS[c.trigger_type] || CloudRain;
                  return (
                    <div key={c.claim_id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.trigger_type === 'HEAVY_RAIN' ? 'bg-blue-100' : c.trigger_type === 'EXTREME_HEAT' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                          <TriggerIcon className={`h-5 w-5 ${c.trigger_type === 'HEAVY_RAIN' ? 'text-blue-600' : c.trigger_type === 'EXTREME_HEAT' ? 'text-orange-600' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{c.trigger_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{c.claim_id} · {c.location} · {new Date(c.created_at).toLocaleDateString('en-IN')}</p>
                          {c.fraud_flags?.length > 0 && (
                            <p className="text-xs text-red-500 mt-0.5">⚠️ {c.fraud_flags.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-bold text-gray-900">₹{c.amount}</p>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          {c.status === 'approved' ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : c.status === 'rejected' ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <Clock className="h-3.5 w-3.5 text-yellow-500" />}
                          <span className={`text-xs font-medium capitalize ${c.status === 'approved' ? 'text-green-600' : c.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{c.status}</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5">fraud: {c.fraud_score.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                <p className="font-medium">No {filter !== 'all' ? filter : ''} claims found</p>
                <p className="text-sm mt-1">Trigger a disruption from your dashboard to create claims</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
