import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { Store, Calendar, ShoppingBag } from 'lucide-react';

const createCustomIcon = (type) => {
  let color = '#3B82F6'; // default blue
  if (type === 'online' || type === 'marketplace') color = '#10B981'; // green
  if (type === 'fisik') color = '#F59E0B'; // orange

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const LocationMap = ({ locations = [], height = '500px' }) => {
  const defaultCenter = locations.length > 0 && locations[0].latitude
    ? [locations[0].latitude, locations[0].longitude]
    : [-7.2575, 112.7521];

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((loc, idx) => {
          const lat = loc.latitude || -7.2575 + (idx * 0.005);
          const lng = loc.longitude || 112.7521 + (idx * 0.005);
          const icon = createCustomIcon(loc.store_type);

          return (
            <Marker key={idx} position={[lat, lng]} icon={icon}>
              <Popup>
                <div style={{ padding: '4px', minWidth: '180px' }}>
                  {loc.sample_product_photo && (
                    <img
                      src={loc.sample_product_photo}
                      alt={loc.sample_product_name || 'Produk'}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                    />
                  )}
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: '4px' }}>
                    {loc.sample_product_name || 'Pembelian'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563EB', marginBottom: '6px' }}>
                    {formatRupiah(loc.total_amount)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B', marginBottom: '3px' }}>
                    <Store size={12} />
                    <span>{loc.store_name} ({loc.city || 'Surabaya'})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B' }}>
                    <Calendar size={12} />
                    <span>{formatDate(loc.purchase_date)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LocationMap;
