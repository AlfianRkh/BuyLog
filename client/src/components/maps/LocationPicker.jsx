import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Fix Leaflet's default icon path issue
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically animate / pan map center to new coordinates
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [center, zoom, map]);

  return null;
}

// Click handler on map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const LocationPicker = ({
  latitude = -7.2575,
  longitude = 112.7521,
  onChange,
  height = '240px'
}) => {
  const [position, setPosition] = useState([latitude || -7.2575, longitude || 112.7521]);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (latitude && longitude && (latitude !== position[0] || longitude !== position[1])) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleSelect = (lat, lng) => {
    setPosition([lat, lng]);
    setZoomLevel(15);
    if (onChange) {
      onChange(lat, lng);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setZoomLevel(16); // zoom in close for precision
        if (onChange) onChange(lat, lng);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocating(false);
        alert('Gagal mendeteksi lokasi otomatis. Pastikan izin akses lokasi telah diaktifkan.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <MapContainer
        center={position}
        zoom={zoomLevel}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={defaultIcon} />
        <MapClickHandler onLocationSelect={handleSelect} />
        <MapController center={position} zoom={zoomLevel} />
      </MapContainer>

      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={locating}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          padding: '7px 14px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          cursor: locating ? 'wait' : 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {locating ? (
          <>
            <Loader2 size={14} className="animate-spin" color="#2563EB" />
            <span>Mencari Lokasi...</span>
          </>
        ) : (
          <>
            <Navigation size={14} color="#2563EB" />
            <span>Lokasi Saya</span>
          </>
        )}
      </button>

      <div style={{
        padding: '8px 12px',
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        fontSize: '0.75rem',
        color: '#64748B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} color="#3B82F6" />
          <span>Koordinat: <strong>{position[0].toFixed(5)}, {position[1].toFixed(5)}</strong></span>
        </div>
        <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>(Klik peta untuk pindah titik manual)</span>
      </div>
    </div>
  );
};

export default LocationPicker;
