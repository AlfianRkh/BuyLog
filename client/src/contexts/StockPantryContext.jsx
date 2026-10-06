import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const StockPantryContext = createContext();

export const StockPantryProvider = ({ children }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [zones, setZones] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear old local storage caches to comply with requirement "Jangan simpan di local storage"
  useEffect(() => {
    localStorage.removeItem('stockpantry_items');
    localStorage.removeItem('stockpantry_zones');
    localStorage.removeItem('stockpantry_shopping');
    localStorage.removeItem('stockpantry_logs');
  }, []);

  // Fetch initial data from Backend API
  const fetchStockPantryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.stockPantry.getDashboard();
      if (res && res.success) {
        setPantryItems(res.items || []);
        setZones(res.zones || []);
        setShoppingList(res.shoppingList || []);
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch StockPantry data from Backend API:', err);
      setError(err.message || 'Gagal memuat data StockPantry dari Backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockPantryData();
  }, [fetchStockPantryData]);

  // Actions connecting to Backend API
  const addPantryItem = async (newItem) => {
    try {
      const res = await api.stockPantry.createItem(newItem);
      if (res && res.success) {
        if (res.items) setPantryItems(res.items);
        else fetchStockPantryData();
        return res;
      }
    } catch (err) {
      console.error('Failed to add pantry item:', err);
      throw err;
    }
  };

  const updatePantryItem = async (id, updatedFields) => {
    try {
      setPantryItems(prev => prev.map(item => {
        if (item.id === id) {
          const nextItem = { ...item, ...updatedFields };
          if (nextItem.qty === 0) nextItem.status = 'empty';
          else if (nextItem.qty <= nextItem.maxQty * 0.3) nextItem.status = 'low';
          else if (nextItem.expiryDays <= 3) nextItem.status = 'expiring';
          else nextItem.status = 'safe';
          return nextItem;
        }
        return item;
      }));
      const res = await api.stockPantry.updateItem(id, updatedFields);
      if (res && res.success && res.items) {
        setPantryItems(res.items);
      }
    } catch (err) {
      console.error('Failed to update pantry item:', err);
      fetchStockPantryData();
    }
  };

  const deletePantryItem = async (id) => {
    try {
      setPantryItems(prev => prev.filter(item => item.id !== id));
      const res = await api.stockPantry.deleteItem(id);
      if (res && res.success && res.items) {
        setPantryItems(res.items);
      }
    } catch (err) {
      console.error('Failed to delete pantry item:', err);
      fetchStockPantryData();
    }
  };

  const changeQty = async (id, delta) => {
    const target = pantryItems.find(i => i.id === id);
    if (!target) return;
    const newQty = Math.max(0, parseFloat((target.qty + delta).toFixed(2)));
    await updatePantryItem(id, { qty: newQty });
  };

  const consumeItem = async (id, qtyUsed, note = '') => {
    try {
      const res = await api.stockPantry.consumeItem(id, qtyUsed, note);
      if (res && res.success) {
        if (res.items) setPantryItems(res.items);
        if (res.logs) setLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to consume item:', err);
      fetchStockPantryData();
    }
  };

  const discardItem = async (id, reason = 'Kedaluwarsa') => {
    await updatePantryItem(id, { qty: 0, status: 'expired' });
  };

  const toggleShoppingCheck = async (id) => {
    try {
      setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
      const res = await api.stockPantry.toggleShoppingCheck(id);
      if (res && res.success && res.shoppingList) {
        setShoppingList(res.shoppingList);
      }
    } catch (err) {
      console.error('Failed to toggle shopping item:', err);
      fetchStockPantryData();
    }
  };

  const addShoppingItem = async (newItem) => {
    try {
      const res = await api.stockPantry.addShoppingItem(newItem);
      if (res && res.success && res.shoppingList) {
        setShoppingList(res.shoppingList);
      }
    } catch (err) {
      console.error('Failed to add shopping item:', err);
      fetchStockPantryData();
    }
  };

  const commitRestock = async () => {
    try {
      const res = await api.stockPantry.commitRestock();
      if (res && res.success) {
        if (res.items) setPantryItems(res.items);
        if (res.shoppingList) setShoppingList(res.shoppingList);
        if (res.logs) setLogs(res.logs);
        return res.restockedCount || 0;
      }
    } catch (err) {
      console.error('Failed to commit restock:', err);
      fetchStockPantryData();
      return 0;
    }
  };

  const undoLog = (logId) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, undone: true } : l));
  };

  const addZone = async (newZone) => {
    try {
      const res = await api.stockPantry.createZone(newZone);
      if (res && res.success && res.zones) {
        setZones(res.zones);
      }
    } catch (err) {
      console.error('Failed to add zone:', err);
      fetchStockPantryData();
    }
  };

  return (
    <StockPantryContext.Provider
      value={{
        pantryItems,
        zones,
        shoppingList,
        logs,
        loading,
        error,
        refetch: fetchStockPantryData,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        changeQty,
        consumeItem,
        discardItem,
        toggleShoppingCheck,
        addShoppingItem,
        commitRestock,
        undoLog,
        addZone
      }}
    >
      {children}
    </StockPantryContext.Provider>
  );
};

export const useStockPantry = () => useContext(StockPantryContext);
