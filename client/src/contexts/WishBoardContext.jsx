import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const WishBoardContext = createContext();

const DEFAULT_WEIGHTS = {
  urgency: 35,
  want: 30,
  budget: 35
};

export const WishBoardProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [skippedItems, setSkippedItems] = useState([]);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from Backend API
  const fetchWishBoardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.wishboard.getDashboard();
      if (res && res.success) {
        setItems(res.items || []);
        setSkippedItems(res.skippedItems || []);
        if (res.weights) {
          setWeights(res.weights);
        }
      }
    } catch (err) {
      console.error('Failed to fetch WishBoard data from Backend API:', err);
      setError(err.message || 'Gagal memuat data WishBoard dari Backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishBoardData();
  }, [fetchWishBoardData]);

  // Priority Score Algorithm Calculation Function
  const calculatePriorityScore = (item, w = weights) => {
    const urgencyScore = ((item.urgency || 3) / 5) * 100;
    const wantScore = ((item.want || 4) / 5) * 100;
    const budgetRatio = Math.min(1, (item.price || 0) > 0 ? (item.saved || 0) / item.price : 0);
    const budgetScore = budgetRatio * 100;

    const weightedScore =
      (urgencyScore * ((w?.urgency || 35) / 100)) +
      (wantScore * ((w?.want || 30) / 100)) +
      (budgetScore * ((w?.budget || 35) / 100));

    return Math.round(weightedScore);
  };

  // Decision Score Calculation (Pros vs Cons Ratio)
  const calculateDecisionScore = (item) => {
    const prosCount = item.pros ? item.pros.length : 0;
    const consCount = item.cons ? item.cons.length : 0;
    const total = prosCount + consCount;
    if (total === 0) return 50;
    return Math.round((prosCount / total) * 100);
  };

  // Helper to enrich item with calculated metrics
  const enrichItem = (item) => {
    const score = item.score !== undefined ? item.score : calculatePriorityScore(item);
    const decisionRatio = item.decisionRatio !== undefined ? item.decisionRatio : calculateDecisionScore(item);
    const readiness = item.readiness !== undefined ? item.readiness : Math.min(100, Math.round((item.price || 0) > 0 ? ((item.saved || 0) / item.price) * 100 : 0));

    let scoreLevel = item.scoreLevel || 'low';
    let scoreBadge = item.scoreBadge || '🔵 Rendah';
    if (!item.scoreLevel) {
      if (score >= 80) {
        scoreLevel = 'urgent';
        scoreBadge = '🔴 Urgent';
      } else if (score >= 60) {
        scoreLevel = 'high';
        scoreBadge = '🟠 High';
      } else if (score >= 40) {
        scoreLevel = 'medium';
        scoreBadge = '🟡 Menengah';
      }
    }

    return {
      ...item,
      score,
      decisionRatio,
      readiness,
      scoreLevel,
      scoreBadge
    };
  };

  // Enriched Items sorted/ranked
  const enrichedItems = items.map(enrichItem).sort((a, b) => b.score - a.score);

  // Top 3 Recommendations
  const topRecommendations = enrichedItems
    .filter(i => i.status === 'want' || i.status === 'saving' || i.status === 'ready')
    .slice(0, 3);

  // Actions connecting to Backend API
  const addItem = async (newItemData) => {
    try {
      const res = await api.wishboard.createItem(newItemData);
      if (res && res.success) {
        if (res.items) setItems(res.items);
        else fetchWishBoardData();
        return res;
      }
    } catch (err) {
      console.error('Failed to create wish item:', err);
      throw err;
    }
  };

  const updateItemStatus = async (id, newStatus) => {
    try {
      // Optimistic local update
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      const res = await api.wishboard.updateItemStatus(id, newStatus);
      if (res && res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to update item status:', err);
      fetchWishBoardData();
    }
  };

  const addDeposit = async (itemId, amount, note = 'Setoran tabungan') => {
    try {
      // Optimistic local update
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const newSaved = (item.saved || 0) + Number(amount);
          return { ...item, saved: newSaved };
        }
        return item;
      }));
      const res = await api.wishboard.addDeposit(itemId, amount, note);
      if (res && res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to add deposit:', err);
      fetchWishBoardData();
    }
  };

  const addPro = async (itemId, text) => {
    if (!text || !text.trim()) return;
    try {
      // Optimistic local update
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, pros: [...(item.pros || []), text.trim()] };
        }
        return item;
      }));
      const res = await api.wishboard.addPro(itemId, text);
      if (res && res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to add pro rationale:', err);
      fetchWishBoardData();
    }
  };

  const addCon = async (itemId, text) => {
    if (!text || !text.trim()) return;
    try {
      // Optimistic local update
      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, cons: [...(item.cons || []), text.trim()] };
        }
        return item;
      }));
      const res = await api.wishboard.addCon(itemId, text);
      if (res && res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to add con rationale:', err);
      fetchWishBoardData();
    }
  };

  const updateWeights = async (newWeights) => {
    try {
      setWeights(newWeights);
      const res = await api.wishboard.updateSettings(newWeights);
      if (res && res.success) {
        if (res.weights) setWeights(res.weights);
        if (res.items) setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to update weights settings:', err);
      fetchWishBoardData();
    }
  };

  const skipItem = async (itemId, reason) => {
    try {
      const res = await api.wishboard.skipItem(itemId, reason);
      if (res && res.success) {
        if (res.items) setItems(res.items);
        if (res.skippedItems) setSkippedItems(res.skippedItems);
      }
    } catch (err) {
      console.error('Failed to skip item:', err);
      fetchWishBoardData();
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const res = await api.wishboard.deleteItem(itemId);
      if (res && res.success && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      fetchWishBoardData();
    }
  };

  return (
    <WishBoardContext.Provider value={{
      items: enrichedItems,
      skippedItems,
      weights,
      loading,
      error,
      topRecommendations,
      refetch: fetchWishBoardData,
      addItem,
      updateItemStatus,
      addDeposit,
      addPro,
      addCon,
      updateWeights,
      skipItem,
      deleteItem,
      calculatePriorityScore
    }}>
      {children}
    </WishBoardContext.Provider>
  );
};

export const useWishBoard = () => useContext(WishBoardContext);
