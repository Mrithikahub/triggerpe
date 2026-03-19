'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Cloud, RefreshCw, AlertTriangle, CheckCircle, Loader2, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react';

const CITIES = ['mumbai', 'delhi', 'chennai', 'bangalore', 'hyderabad', 'kolkata', 'pune'];

export default function WeatherAlertsPage() {
  const { workerId } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [myWeather, setMyWeather] = useState<any>(null);
  const [myWeatherLoading, setMyWeatherLoading] = useState(true);
  const [allCityWeather, setAllCityWeather] = useState<Record<string, any>>({});
  const [allLoading, setAllLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    if (!workerId) return;
    api.getWorker(workerId as string).then(w => {
      setWorker(w);
      // Fetch weather for worker's city
      api.getLiveWeather(w.city)
        .then(res => {
          if (res?.weather) { setMyWeather(res); setWeatherError(false); }
          else setWeatherError(true);
        })
        .catch(() => setWeatherError(true))
        .finally(() => setMyWeatherLoading(false));
    }).catch(() => setMyWeatherLoading(false));
  }, [workerId]);

  const fetchAllCities = async () => {
    setAllLoading(true);
    const results: Record<string, any> = {};
    await Promise.allSettled(
      CITIES.map(async city => {
        try {
          const r = await api.getLiveWeather(city);
          if (r?.weather) results[city] = r;
        } catch {}
      })
    );
    setAllCityWeather(results);
    setAllLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar workerId={workerId as string} workerName={worker?.name} />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Cloud className="mr-2 h-6 w-6 text-cyan-500" />Weather Alerts
              </h1>
              <p className="text-gray-500 mt-1">Live weather monitoring via WeatherAPI.com</p>
            </div>
            <button onClick={fetchAllCities} disabled={allLoading}
              className="flex items-center space-x-2 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium">
              <RefreshCw className={`h-4 w-4 ${allLoading ? 'animate-spin' : ''}`} />
              <span>Check All Cities</span>
            </button>
          </div>

          {/* Your city */}
          {myWeatherLoading ? (
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-6 mb-6 flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : weatherError || !myWeather?.weather ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">Live weather unavailable for {worker?.city}</p>
                <p className="text-yellow-600 text-sm mt-1">Make sure <code className="bg-yellow-100 px-1 rounded">WEATHER_API_KEY</code> is in your backend <code className="bg-yellow-100 px-1 rounded">.env</code> and backend is running</p>
                <p className="text-yellow-600 text-sm mt-1">Also replace <b>trigger_engine.py</b> and <b>triggers.py</b> in your backend with the files I gave you!</p>
              </div>
            </div>
          ) : (
            <div className={`rounded-xl p-6 mb-6 text-white ${myWeather.disrupted ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-600'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold capitalize">Your City: {worker?.city}</h2>
                  <p className="text-sm opacity-80">{myWeather.weather.condition}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {myWeather.disrupted
                    ? <span className="bg-white text-red-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse">⚠️ DISRUPTION!</span>
                    : <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">✅ Normal</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Thermometer, label: 'Temp', val: `${myWeather.weather.temperature?.toFixed(1)}°C`, limit: '42°C', over: myWeather.weather.temperature > 42 },
                  { icon: Droplets, label: 'Rainfall', val: `${myWeather.weather.rainfall?.toFixed(1)}mm/hr`, limit: '50mm', over: myWeather.weather.rainfall > 50 },
                  { icon: Wind, label: 'AQI', val: String(myWeather.weather.aqi), limit: '300', over: myWeather.weather.aqi > 300 },
                ].map(({ icon: Icon, label, val, limit, over }) => (
                  <div key={label} className={`rounded-lg p-3 ${over ? 'bg-red-500 bg-opacity-40' : 'bg-white bg-opacity-20'}`}>
                    <div className="flex items-center space-x-1 mb-1">
                      <Icon className="h-4 w-4 opacity-75" />
                      <p className="text-xs opacity-75">{label} (limit: {limit})</p>
                    </div>
                    <p className="font-bold text-lg">{val}</p>
                    {over && <p className="text-xs text-red-200 font-semibold">⚠️ EXCEEDED</p>}
                  </div>
                ))}
              </div>
              {myWeather.disruptions_detected?.length > 0 && (
                <div className="mt-3 bg-white bg-opacity-20 rounded-lg px-3 py-2 text-sm font-medium">
                  🚨 Active triggers: {myWeather.disruptions_detected.join(', ')}
                </div>
              )}
              <p className="text-xs opacity-40 mt-2 text-right">Source: WeatherAPI.com · Live data</p>
            </div>
          )}

          {/* Thresholds */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Disruption Thresholds & Payouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: '🌧️ Heavy Rain', threshold: 'Rainfall > 50mm/hr', payout: '100% of coverage', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                { label: '🌡️ Extreme Heat', threshold: 'Temperature > 42°C', payout: '75% of coverage', color: 'bg-orange-50 border-orange-200 text-orange-800' },
                { label: '😷 High AQI', threshold: 'AQI Index > 300', payout: '75% of coverage', color: 'bg-purple-50 border-purple-200 text-purple-800' },
              ].map(({ label, threshold, payout, color }) => (
                <div key={label} className={`border rounded-xl p-4 ${color}`}>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm mt-1 opacity-80">{threshold}</p>
                  <p className="text-sm font-medium mt-1">💰 {payout}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All cities grid */}
          {Object.keys(allCityWeather).length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">All Cities Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {CITIES.map(city => {
                  const w = allCityWeather[city];
                  if (!w) return (
                    <div key={city} className="border border-gray-200 rounded-lg p-3 text-center text-gray-400 text-sm capitalize">{city}: unavailable</div>
                  );
                  return (
                    <div key={city} className={`border rounded-xl p-4 ${w.disrupted ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold capitalize">{city}</span>
                        {w.disrupted ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      {w.weather && (
                        <div className="grid grid-cols-3 gap-1 text-xs text-gray-600">
                          <span>🌡️ {w.weather.temperature?.toFixed(0)}°C</span>
                          <span>🌧️ {w.weather.rainfall?.toFixed(0)}mm</span>
                          <span>💨 AQI {w.weather.aqi}</span>
                        </div>
                      )}
                      {w.disruptions_detected?.length > 0 && (
                        <p className="text-xs text-red-600 mt-2 font-semibold">{w.disruptions_detected.join(', ')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow-sm">
              <Cloud className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">Click "Check All Cities" to see live weather across India</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
