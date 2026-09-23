import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import LocationMap from '../../components/maps/LocationMap';
import { api } from '../../services/api';
import {
  MapPin,
  Store,
  Globe,
  ShoppingBag,
  Filter,
  Search
} from 'lucide-react';
import './LokasiPage.css';

const LokasiPage = () => {
  const { toggleSidebar } = useOutletContext();
  const [locations, setLocations] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'fisik', 'marketplace', 'online'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/purchases/locations-map');
      if (res.success) {
        setLocations(res.data);
      }
    } catch (err) {
      console.error('Failed to load locations map:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (filterType !== 'all' && loc.store_type !== filterType) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        (loc.store_name && loc.store_name.toLowerCase().includes(q)) ||
        (loc.city && loc.city.toLowerCase().includes(q)) ||
        (loc.sample_product_name && loc.sample_product_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate location rankings
  const locationCounts = {};
  locations.forEach((loc) => {
    const key = loc.city || loc.store_name || 'Lainnya';
    locationCounts[key] = (locationCounts[key] || 0) + 1;
  });

  const locationRanking = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <Header
        title="Lokasi Pembelian"
        subtitle="Lihat peta lokasi tempat Anda berbelanja"
        onToggleSidebar={toggleSidebar}
      />

      <div className="page-container">
        {/* Filter controls matching mockup */}
        <div className="card toolbar-card">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Cari lokasi, toko, atau barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="location-type-pills">
            <button
              className={`loc-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Semua ({locations.length})
            </button>
            <button
              className={`loc-pill ${filterType === 'fisik' ? 'active' : ''}`}
              onClick={() => setFilterType('fisik')}
            >
              <span className="dot dot-orange"></span> Toko Fisik
            </button>
            <button
              className={`loc-pill ${filterType === 'marketplace' ? 'active' : ''}`}
              onClick={() => setFilterType('marketplace')}
            >
              <span className="dot dot-green"></span> Marketplace
            </button>
            <button
              className={`loc-pill ${filterType === 'online' ? 'active' : ''}`}
              onClick={() => setFilterType('online')}
            >
              <span className="dot dot-blue"></span> Online
            </button>
          </div>
        </div>

        {/* Big Leaflet Map */}
        <div className="card map-card-wrapper mt-4">
          {loading ? (
            <div className="text-center py-16">Memuat peta lokasi...</div>
          ) : (
            <LocationMap locations={filteredLocations} height="480px" />
          )}
        </div>

        {/* Lokasi Terbanyak Summary Card matching mockup */}
        <div className="card mt-4">
          <div className="card-header">
            <h2 className="card-title flex-align">
              <MapPin size={18} color="#3B82F6" />
              <span>Lokasi Terbanyak</span>
            </h2>
          </div>

          <div className="location-rankings-list">
            {locationRanking.map(([name, count], index) => (
              <div key={index} className="location-rank-item">
                <div className="location-rank-left">
                  <div className="loc-pin-icon">
                    <MapPin size={16} color="#3B82F6" />
                  </div>
                  <span className="location-name">{name}</span>
                </div>
                <span className="location-tx-badge">{count} transaksi</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LokasiPage;
