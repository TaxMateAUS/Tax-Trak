import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Square, Navigation, Wifi, WifiOff, Clock, Ruler, Briefcase, Heart, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

// Haversine formula — returns km between two lat/lon coords
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Reverse geocode a lat/lon to a human-readable address using Nominatim (free, no key needed)
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.road || addr.pedestrian,
      addr.suburb || addr.neighbourhood,
      addr.city || addr.town || addr.village,
    ].filter(Boolean);
    return parts.slice(0, 2).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}

const CATEGORIES = [
  { value: 'business', label: 'Business', icon: Briefcase, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'medical', label: 'Medical', icon: Heart, color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'moving', label: 'Moving', icon: ArrowRight, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'charitable', label: 'Charitable', icon: Heart, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'other', label: 'Other', icon: Navigation, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function LiveTripTracker({ vehicles = [], onTripComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | tracking | done
  const [category, setCategory] = useState('business');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [startCoords, setStartCoords] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [gpsError, setGpsError] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [accuracy, setAccuracy] = useState(null);

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastCoordsRef = useRef(null);
  const accumulatedDistRef = useRef(0);

  // Timer
  useEffect(() => {
    if (phase === 'tracking') {
      timerRef.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported on this device.');
      return;
    }
    setGpsError(null);
    setPhase('tracking');
    startTimeRef.current = Date.now();
    accumulatedDistRef.current = 0;
    setDistanceKm(0);
    setElapsedSec(0);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setAccuracy(Math.round(acc));

        if (!startCoords) {
          setStartCoords({ lat: latitude, lon: longitude });
          lastCoordsRef.current = { lat: latitude, lon: longitude };
          // Reverse geocode start in background
          reverseGeocode(latitude, longitude).then(setStartAddress);
        }

        setCurrentCoords({ lat: latitude, lon: longitude });

        // Accumulate distance only if accuracy is reasonable (< 50m)
        if (lastCoordsRef.current && acc < 50) {
          const delta = haversineKm(
            lastCoordsRef.current.lat, lastCoordsRef.current.lon,
            latitude, longitude
          );
          // Only count movement >= 0.01 km to filter GPS jitter
          if (delta >= 0.01) {
            accumulatedDistRef.current += delta;
            setDistanceKm(accumulatedDistRef.current);
            lastCoordsRef.current = { lat: latitude, lon: longitude };
          }
        }
      },
      (err) => {
        setGpsError(err.code === 1 ? 'Location permission denied. Please allow access.' : 'Unable to get GPS signal.');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, [startCoords]);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    clearInterval(timerRef.current);
    setPhase('done');

    // Reverse geocode end position
    if (currentCoords) {
      const addr = await reverseGeocode(currentCoords.lat, currentCoords.lon);
      setEndAddress(addr);
    }
  }, [currentCoords]);

  const handleSave = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const today = new Date().toISOString().split('T')[0];
    onTripComplete({
      date: today,
      start_location: startAddress,
      end_location: endAddress,
      distance_km: parseFloat(accumulatedDistRef.current.toFixed(2)),
      category,
      vehicle_id: selectedVehicleId || undefined,
      vehicle_name: vehicle?.name || '',
      tax_year: new Date().getFullYear(),
      is_deductible: category !== 'other',
      notes: `GPS tracked trip — ${formatTime(elapsedSec)}`,
    });
    // Reset
    setPhase('idle');
    setDistanceKm(0);
    setElapsedSec(0);
    setStartCoords(null);
    setCurrentCoords(null);
    setStartAddress('');
    setEndAddress('');
    accumulatedDistRef.current = 0;
  };

  const handleDiscard = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    clearInterval(timerRef.current);
    setPhase('idle');
    setDistanceKm(0);
    setElapsedSec(0);
    setStartCoords(null);
    setCurrentCoords(null);
    setStartAddress('');
    setEndAddress('');
    accumulatedDistRef.current = 0;
  };

  const activeCat = CATEGORIES.find(c => c.value === category) || CATEGORIES[0];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-white" />
          <span className="font-semibold text-white text-sm">Live GPS Tracker</span>
        </div>
        {phase === 'tracking' && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-xs font-medium">TRACKING</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* GPS Error */}
        {gpsError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{gpsError}</p>
          </div>
        )}

        {/* Live Stats — shown while tracking or done */}
        <AnimatePresence>
          {(phase === 'tracking' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatTime(elapsedSec)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Distance</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{distanceKm.toFixed(2)} <span className="text-sm font-normal text-slate-500">km</span></p>
              </div>

              {/* GPS accuracy badge */}
              {accuracy !== null && phase === 'tracking' && (
                <div className="col-span-2 flex items-center justify-center gap-1.5">
                  {accuracy < 20 ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  ) : accuracy < 50 ? (
                    <Wifi className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400">GPS accuracy: ±{accuracy}m</span>
                </div>
              )}

              {/* Start location */}
              {startAddress && (
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Started at</span>
                    <span>{startAddress}</span>
                  </div>
                  {phase === 'done' && endAddress && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Ended at</span>
                      <span>{endAddress}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category selector — always visible */}
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Trip Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  category === cat.value
                    ? cat.color + ' ring-2 ring-offset-1 ring-current'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle selector */}
        {vehicles.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Vehicle (optional)</p>
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No vehicle specified</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {phase === 'idle' && (
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base"
              onClick={startTracking}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Start Trip
            </Button>
          )}

          {phase === 'tracking' && (
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-base"
              onClick={stopTracking}
            >
              <Square className="w-4 h-4 mr-2 fill-white" />
              Stop Trip
            </Button>
          )}

          {phase === 'done' && (
            <>
              <Button variant="outline" className="flex-1 h-11" onClick={handleDiscard}>
                Discard
              </Button>
              <Button
                className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 h-11"
                onClick={handleSave}
              >
                Save Trip →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}