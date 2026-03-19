'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';
import { api } from '@/lib/api';
import { MapPin, Loader2, ArrowLeft, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const CITIES = ['mumbai', 'delhi', 'chennai', 'bangalore', 'hyderabad', 'kolkata', 'pune'];

export default function RegisterPage() {
  const router = useRouter();
  const location = useLocation();
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'Zomato' | 'Swiggy'>('Zomato');
  const [earning, setEarning] = useState(500);
  const [manualCity, setManualCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'creating' | 'policy'>('form');
  const [error, setError] = useState('');

  // Use GPS city if available, else manual selection
  const effectiveCity = location.city?.toLowerCase() || manualCity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!effectiveCity) { setError('Please select your city'); return; }

    setLoading(true); setError(''); setStep('creating');
    try {
      // Step 1: Register worker
      const worker = await api.registerWorker({
        name,
        city: effectiveCity,
        platform,
        avg_daily_earning: earning,
      });

      // Step 2: Auto-create 1-week policy
      setStep('policy');
      try {
        await api.createPolicy({ worker_id: worker.worker_id, weeks: 1 });
      } catch (policyErr: any) {
        // Policy may already exist — that's fine
        console.log('Policy note:', policyErr?.response?.data?.detail);
      }

      // Redirect to dashboard
      router.push(`/dashboard/${worker.worker_id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
      setStep('form');
    } finally { setLoading(false); }
  };

  if (location.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Detecting your location...</p>
      </div>
    </div>
  );

  if (step === 'creating' || step === 'policy') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {step === 'creating' ? 'Registering you...' : 'Activating your policy...'}
        </h2>
        <div className="space-y-2 text-sm text-gray-500 mt-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Creating worker profile</span>
          </div>
          <div className="flex items-center space-x-2">
            {step === 'policy' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
            <span>Calculating AI risk score</span>
          </div>
          <div className="flex items-center space-x-2">
            {step === 'policy' ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
            <span>Activating weekly policy</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg"><Shield className="h-6 w-6 text-blue-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Worker Registration</h1>
              <p className="text-gray-500 text-sm">Get covered in 30 seconds</p>
            </div>
          </div>

          {/* Location */}
          <div className={`p-4 rounded-lg mb-6 border ${location.city ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Your location</p>
                {location.city ? (
                  <p className="font-semibold text-gray-900 capitalize">{location.city} ✅</p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">GPS not available — select your city:</p>
                    <select value={manualCity} onChange={e => setManualCity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 capitalize">
                      <option value="">Select city...</option>
                      {CITIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Arjun Sharma" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Platform</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Zomato', 'Swiggy'] as const).map(p => (
                  <button key={p} type="button" onClick={() => setPlatform(p)}
                    className={`py-3 rounded-lg border-2 font-medium transition-all ${platform === p ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Average Daily Earning: <span className="text-blue-600 font-bold">₹{earning}</span>
              </label>
              <input type="range" min="100" max="2000" step="50" value={earning}
                onChange={e => setEarning(Number(e.target.value))} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹100</span><span>₹1000</span><span>₹2000</span></div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              ✅ A <b>1-week policy</b> will be automatically activated after registration
            </div>

            <button type="submit" disabled={loading || !effectiveCity}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-base">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register & Activate Coverage →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
