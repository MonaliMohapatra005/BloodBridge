import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Hospital Marker Icon
const hospitalMarkerIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `
    <div style="background-color: #B91C2C; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(185,28,44,0.45); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
      🏥
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Custom Donor Marker Icon
const donorMarkerIcon = L.divIcon({
  className: 'custom-donor-marker',
  html: `
    <div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(5,150,105,0.45); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">
      📍
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  markerType?: 'hospital' | 'donor';
  height?: string;
  helperText?: string;
}

// Controller to pan map when coordinates change externally
const PanToPosition: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [map, position]);
  return null;
};

// Event handler for map clicks
const MapClickDetector: React.FC<{
  onSelect: (lat: number, lng: number) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
};

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onChange,
  markerType = 'hospital',
  height = '240px',
  helperText,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
  const currentPos: [number, number] | null = hasCoords ? [lat, lng] : null;

  // Default view center (Bangalore center or coordinates if provided)
  const defaultCenter: [number, number] = currentPos || [12.9716, 77.5946];

  const markerRef = useRef<L.Marker | null>(null);

  const icon = markerType === 'hospital' ? hospitalMarkerIcon : donorMarkerIcon;

  const handleGetDeviceGPS = () => {
    if (!navigator.geolocation) {
      setLocatingError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocatingError(null);

    // Try high accuracy first, then fallback to standard
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = parseFloat(pos.coords.latitude.toFixed(6));
        const detectedLng = parseFloat(pos.coords.longitude.toFixed(6));
        onChange(detectedLat, detectedLng);
        setIsLocating(false);
      },
      () => {
        // Fallback with lower accuracy for desktop WiFi positioning
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const detectedLat = parseFloat(pos.coords.latitude.toFixed(6));
            const detectedLng = parseFloat(pos.coords.longitude.toFixed(6));
            onChange(detectedLat, detectedLng);
            setIsLocating(false);
          },
          (err) => {
            setIsLocating(false);
            setLocatingError(err.message || 'Could not detect GPS. Please click the map.');
          },
          { enableHighAccuracy: false, timeout: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blood-700" />
          <span>Click map to place pin, or drag marker</span>
        </span>
        <button
          type="button"
          onClick={handleGetDeviceGPS}
          disabled={isLocating}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blood-700 hover:text-blood-800 disabled:opacity-50 transition-colors bg-red-50 hover:bg-red-100/70 px-2.5 py-1 rounded-lg border border-red-200"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting...' : 'Detect My GPS'}</span>
        </button>
      </div>

      <div
        className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={hasCoords ? 14 : 12}
          scrollWheelZoom={true}
          className="w-full h-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <PanToPosition position={currentPos} />
          <MapClickDetector onSelect={onChange} />

          {currentPos && (
            <Marker
              ref={markerRef}
              position={currentPos}
              icon={icon}
              draggable={true}
              eventHandlers={{
                dragend: () => {
                  const marker = markerRef.current;
                  if (marker) {
                    const pos = marker.getLatLng();
                    onChange(
                      parseFloat(pos.lat.toFixed(6)),
                      parseFloat(pos.lng.toFixed(6))
                    );
                  }
                },
              }}
            />
          )}
        </MapContainer>

        {/* Selected Coordinates Overlay Badge */}
        {hasCoords && (
          <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-1.5 pointer-events-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {locatingError && (
        <p className="text-[11px] text-amber-600">{locatingError}</p>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
};

