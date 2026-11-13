import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ResponderItem } from '../../types/responder.types';
import { BloodRequest } from '../../types/request.types';
import { formatDistance, formatDuration } from '../../lib/utils';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Hospital Marker Icon
const hospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `
    <div style="background-color: #B91C2C; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(185,28,44,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">
      🏥
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Custom Primary Responder Marker Icon
const primaryDonorIcon = L.divIcon({
  className: 'custom-primary-donor-marker',
  html: `
    <div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(5,150,105,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
      🚗
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Custom Backup Responder Marker Icon
const backupDonorIcon = L.divIcon({
  className: 'custom-backup-donor-marker',
  html: `
    <div style="background-color: #4F46E5; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 3px 8px rgba(79,70,229,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
      ⏳
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface EmergencyMapProps {
  request: BloodRequest;
  responderPool: ResponderItem[];
  selectedResponder?: ResponderItem | null;
}

// Controller component to invalidate size and adjust bounds
const MapController: React.FC<{
  bounds: L.LatLngBounds;
  center: [number, number];
  pointsCount: number;
}> = ({ bounds, center, pointsCount }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    if (pointsCount > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView(center, 14);
    }
  }, [map, bounds, center, pointsCount]);

  return null;
};

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  request,
  responderPool,
  selectedResponder,
}) => {
  const hasValidHospitalCoords =
    typeof request.hospitalLat === 'number' &&
    typeof request.hospitalLng === 'number' &&
    !isNaN(request.hospitalLat) &&
    !isNaN(request.hospitalLng);

  if (!hasValidHospitalCoords) {
    return (
      <div className="w-full h-64 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">Hospital Coordinates Unavailable</p>
        <p className="text-xs text-slate-400 mt-1">
          Valid latitude and longitude are required from the backend request record to plot the live map.
        </p>
      </div>
    );
  }

  const hospitalPos: [number, number] = [request.hospitalLat, request.hospitalLng];

  // Calculate coordinates array for bounds
  const points: [number, number][] = [hospitalPos];
  responderPool.forEach((r) => {
    if (r.responderLat && r.responderLng) {
      points.push([r.responderLat, r.responderLng]);
    }
  });

  const bounds = L.latLngBounds(points);

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-card">
      <MapContainer
        center={hospitalPos}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController bounds={bounds} center={hospitalPos} pointsCount={points.length} />

        {/* Hospital Marker */}
        <Marker position={hospitalPos} icon={hospitalIcon}>
          <Popup>
            <div className="p-1 space-y-1 text-xs">
              <p className="font-bold text-[#17212B] text-sm">{request.hospitalName}</p>
              <p className="text-slate-500">{request.hospitalAddress}</p>
              <div className="pt-1 flex items-center gap-1.5 font-semibold text-blood-700">
                <span>Emergency Blood Need: {request.bloodGroup}</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Responder Markers */}
        {responderPool.map((item) => {
          if (!item.responderLat || !item.responderLng) return null;
          const pos: [number, number] = [item.responderLat, item.responderLng];
          const isPrimary = ['CONFIRMED_PRIMARY', 'EN_ROUTE', 'ARRIVED'].includes(item.status);
          const icon = isPrimary ? primaryDonorIcon : backupDonorIcon;

          return (
            <React.Fragment key={item._id}>
              <Marker position={pos} icon={icon}>
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#17212B]">
                        {item.responderId?.fullName || 'Volunteer Donor'}
                      </span>
                      <span className="font-bold px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800">
                        {item.responderId?.bloodGroup}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">Status: {item.status.replace('_', ' ')}</p>
                    <p className="text-slate-500">
                      ETA: {formatDuration(item.etaSeconds)} ({formatDistance(item.distanceMeters)})
                    </p>
                    {item.responderId?.phone && (
                      <p className="text-slate-500 font-mono text-[11px]">📞 {item.responderId.phone}</p>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Route line to hospital */}
              <Polyline
                positions={[pos, hospitalPos]}
                pathOptions={{
                  color: isPrimary ? '#059669' : '#6366F1',
                  weight: isPrimary ? 3 : 2,
                  dashArray: isPrimary ? undefined : '5, 10',
                  opacity: 0.8,
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-slate-200/90 text-xs space-y-2 pointer-events-auto">
        <p className="font-bold text-slate-700 tracking-wide uppercase text-[10px]">Map Legend</p>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blood-700 border-2 border-white shadow-sm inline-block" />
          <span className="text-slate-700 font-medium">Hospital ({request.hospitalName})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm inline-block" />
          <span className="text-slate-700 font-medium">Primary Donor (En route / Arrived)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm inline-block" />
          <span className="text-slate-700 font-medium">Backup Responder</span>
        </div>
      </div>
    </div>
  );
};
