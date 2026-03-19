'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Shield, AlertTriangle, Loader2, CloudRain, Thermometer, Wind } from 'lucide-react';
import Link from 'next/link';

const CITIES = ['mumbai', 'delhi', 'chennai', 'bangalore', 'hyderabad', 'kolkata', 'pune'];
const PRESETS = [
  { label: '🌧️ Heavy Rain', temperature: 28, rainfall: 80, aqi: 120 },
  { label: '🌡️ Extreme Heat', temperature: 46, rainfall: 0, aqi: 150 },
  { label: '😷 High AQI', temperature: 30, rainfall: 0, aqi: 380 },
  { label: '⛈️ Multiple Events', temperature: 44, rainfall: 60, aqi: 360 },
];

export default function TriggerSimulatePage() {
  const [city, setCity] = useState('mumbai');
  const [temperature, setTemperature] = useState(30);
  const [rainfall, setRainfall] = useState(0);
  const [aqi, setAqi] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  const applyPreset = (p: typeof PRESETS[0]) => { setTemperature(p.temperature); setRainfall(p.rainfall); setAqi(p.aqi); };

  const handleFire = async () => {
    setLoading(true); setResult(null);
    try {
      if (mode === 'auto') {
        const r = await api.autoTrigger(city);
        setResult(r);
      } else {
        const r = await api.fireTrigger({ city, temperature, rainfall, aqi });
        setResult(r);
      }
    } catch (e: any) {
      setResult({ error: e?.response?.data?.detail || 'Request failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2"><Shield className="h-7 w-7 text-blue-600" /><span className="text-xl font-bold">GigShield AI</span></Link>
          <Link href="/admin/dashboard" className="text-blue-600 text-sm hover:underline">← Admin Dashboard</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center"><AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />Disruption Trigger Simulator</h1>
          <p className="text-gray-500 mt-1">Test the auto-claim pipeline by firing weather triggers</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {/* Mode toggle */}
          <div className="flex space-x-3">
            {(['auto', 'manual'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {m === 'auto' ? '🌐 Live Weather (Auto)' : '🎛️ Manual Values'}
              </button>
            ))}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <select value={city} onChange={e => setCity(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400 w-48">
              {CITIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          {mode === 'manual' && (
            <>
              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => applyPreset(p)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-orange-400 hover:bg-orange-50 transition-colors text-left">{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { icon: Thermometer, label: 'Temperature (°C)', val: temperature, set: setTemperature, min: 20, max: 55, threshold: 42, color: 'accent-orange-500' },
                  { icon: CloudRain, label: 'Rainfall (mm/hr)', val: rainfall, set: setRainfall, min: 0, max: 150, threshold: 50, color: 'accent-blue-500' },
                  { icon: Wind, label: 'AQI Index', val: aqi, set: setAqi, min: 0, max: 500, threshold: 300, color: 'accent-purple-500' },
                ].map(({ icon: Icon, label, val, set, min, max, threshold, color }) => (
                  <div key={label} className={`p-4 rounded-lg border ${val >= threshold ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center"><Icon className="h-4 w-4 mr-1" />{label}</span>
                      <span className={`text-lg font-bold ${val >= threshold ? 'text-red-600' : 'text-gray-800'}`}>{val}{label.includes('°') ? '°C' : ''}</span>
                    </div>
                    <input type="range" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} className={`w-full ${color}`} />
                    {val >= threshold && <p className="text-xs text-red-600 mt-1 font-medium">⚠️ Above threshold ({threshold})</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          <button onClick={handleFire} disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center space-x-2 font-semibold text-base transition-colors">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertTriangle className="h-5 w-5" />}
            <span>{loading ? 'Firing...' : mode === 'auto' ? `🌐 Fire Live Trigger for ${city}` : '🎛️ Fire Manual Trigger'}</span>
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${result.error ? 'border-red-500' : result.triggered ? 'border-orange-500' : 'border-green-500'}`}>
            <h3 className="text-lg font-semibold mb-3">
              {result.error ? '❌ Error' : result.triggered ? '⚠️ Disruption Triggered!' : '✅ No Disruption'}
            </h3>
            {result.error ? (
              <p className="text-red-600">{result.error}</p>
            ) : result.triggered ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'City', val: result.city },
                    { label: 'Events', val: result.disruptions_detected?.join(', ') },
                    { label: 'Workers Affected', val: result.workers_affected },
                    { label: 'Claims Created', val: result.claims_created },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-orange-50 p-3 rounded-lg"><p className="text-gray-500 text-xs">{label}</p><p className="font-bold text-gray-800">{val}</p></div>
                  ))}
                </div>
                <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Payout Processed</span>
                  <span className="text-green-600 font-bold text-xl">₹{result.total_payout_inr}</span>
                </div>
                {result.claims?.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Claims Generated:</p>
                    {result.claims.map((c: any) => (
                      <div key={c.claim_id} className="flex justify-between items-center py-1.5 border-b text-xs">
                        <span>{c.worker_name}</span>
                        <span>{c.trigger_type}</span>
                        <span>₹{c.amount}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">{result.message || 'No disruption thresholds were breached.'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
