'use client';
import { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Wind, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export function WeatherWidget({ city }: { city: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    api.getLiveWeather(city)
      .then(res => {
        if (res?.weather) { setData(res); setError(false); }
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl p-5 flex items-center justify-center h-36">
      <Loader2 className="h-6 w-6 text-white animate-spin" />
    </div>
  );

  if (error || !data?.weather) return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start space-x-3">
      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-yellow-800">Live weather unavailable</p>
        <p className="text-yellow-600 text-sm mt-0.5">Make sure <code className="bg-yellow-100 px-1 rounded">WEATHER_API_KEY</code> is set in your backend <code className="bg-yellow-100 px-1 rounded">.env</code></p>
      </div>
    </div>
  );

  const w = data.weather;
  const disrupted = data.disrupted;
  const isRaining = w.rainfall > 5;
  const isHot = w.temperature > 40;

  return (
    <div className={`rounded-xl p-5 text-white ${disrupted ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg capitalize">Live Weather — {city}</h3>
          <p className="text-sm opacity-80">{w.condition}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isRaining ? <CloudRain className="h-7 w-7" /> : isHot ? <Thermometer className="h-7 w-7 text-orange-200" /> : <Sun className="h-7 w-7 text-yellow-200" />}
          {disrupted && (
            <span className="bg-white text-red-500 text-xs px-2 py-1 rounded-full font-bold animate-pulse">⚠️ DISRUPTION</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Temperature', val: `${w.temperature?.toFixed(1)}°C`, warn: w.temperature > 42 },
          { label: 'Rainfall', val: `${w.rainfall?.toFixed(1)} mm/hr`, warn: w.rainfall > 50 },
          { label: 'AQI', val: String(w.aqi), warn: w.aqi > 300 },
        ].map(({ label, val, warn }) => (
          <div key={label} className={`rounded-lg p-2.5 text-center ${warn ? 'bg-red-400 bg-opacity-50' : 'bg-white bg-opacity-20'}`}>
            <p className="text-xs opacity-75 mb-0.5">{label}</p>
            <p className="font-bold">{val}</p>
            {warn && <p className="text-xs text-red-200 font-medium">Above limit!</p>}
          </div>
        ))}
      </div>

      {data.disruptions_detected?.length > 0 && (
        <div className="mt-3 bg-white bg-opacity-20 rounded-lg px-3 py-2 text-sm">
          🚨 Active triggers: <span className="font-semibold">{data.disruptions_detected.join(', ')}</span>
        </div>
      )}

      <p className="text-xs opacity-50 mt-2 text-right">Source: WeatherAPI.com · Live</p>
    </div>
  );
}
