'use client';
import { useState, useEffect } from 'react';

interface LocationData {
  lat: number | null;
  lng: number | null;
  city: string | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData>({ lat: null, lng: null, city: null, error: null, loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lng: null, city: null, error: 'Geolocation not supported', loading: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Unknown';
          setLocation({ lat: latitude, lng: longitude, city, error: null, loading: false });
        } catch {
          setLocation({ lat: latitude, lng: longitude, city: 'Unknown', error: null, loading: false });
        }
      },
      (error) => setLocation({ lat: null, lng: null, city: null, error: error.message, loading: false }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return location;
}
