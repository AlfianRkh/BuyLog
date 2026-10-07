import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AppLayout.css';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Clear application local storage keys to ensure 100% Backend API Database storage
  useEffect(() => {
    const keysToRemove = [
      'smartfin_accounts',
      'smartfin_envelopes',
      'smartfin_transactions',
      'stockpantry_items',
      'stockpantry_logs',
      'stockpantry_shopping',
      'stockpantry_zones',
      'wishboard_items',
      'wishboard_skipped',
      'wishboard_weights',
      'priceradar_items',
      'priceradar_watchlist',
      'priceradar_sources',
      'priceradar_logs'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Outlet context={{ toggleSidebar: () => setSidebarOpen(!sidebarOpen) }} />
      </div>
    </div>
  );
};

export default AppLayout;
