import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SmartFinContext = createContext();

export const formatIDR = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

export const SmartFinProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Clear old local storage caches to comply with requirement "Jangan simpan di local storage"
  useEffect(() => {
    localStorage.removeItem('smartfin_accounts');
    localStorage.removeItem('smartfin_transactions');
    localStorage.removeItem('smartfin_envelopes');
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch initial data from Backend API
  const fetchSmartFinData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.smartFin.getDashboard();
      if (res && res.success) {
        setAccounts(res.accounts || []);
        setEnvelopes(res.envelopes || []);
        setTransactions(res.recentTransactions || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch SmartFin data from Backend API:', err);
      setError(err.message || 'Gagal memuat data SmartFin dari Backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSmartFinData();
  }, [fetchSmartFinData]);

  const totalLiquidity = accounts.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  const addTransaction = async (newTrx) => {
    try {
      const res = await api.smartFin.createTransaction(newTrx);
      if (res && res.success) {
        if (res.transactions) setTransactions(res.transactions);
        fetchSmartFinData();
        triggerToast(`Transaksi "${newTrx.merchant || 'Baru'}" berhasil disimpan di Server BE!`);
        return res;
      }
    } catch (err) {
      console.error('Failed to add transaction:', err);
      triggerToast('Gagal menyimpan transaksi ke BE.');
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await api.smartFin.deleteTransaction(id);
      if (res && res.success) {
        if (res.transactions) setTransactions(res.transactions);
        fetchSmartFinData();
        triggerToast('Transaksi berhasil dihapus dari Server BE.');
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      triggerToast('Gagal menghapus transaksi dari BE.');
    }
  };

  const updateWalletBalance = async (accountName, deltaAmount) => {
    try {
      setAccounts(prev => prev.map(acc => {
        if (acc.name === accountName || acc.id === accountName) {
          return { ...acc, balance: Math.max(0, acc.balance + deltaAmount) };
        }
        return acc;
      }));
    } catch (err) {
      console.error('Failed to update wallet balance:', err);
    }
  };

  const transferAccounts = async (fromId, toId, amount) => {
    try {
      const res = await api.smartFin.transferAccounts({ fromId, toId, amount });
      if (res && res.success) {
        if (res.accounts) setAccounts(res.accounts);
        fetchSmartFinData();
        triggerToast(`Transfer Rp ${Number(amount).toLocaleString('id-ID')} berhasil dieksekusi di Backend!`);
      }
    } catch (err) {
      console.error('Failed to transfer accounts:', err);
      triggerToast(err.message || 'Gagal melakukan transfer rekening.');
    }
  };

  const addAccount = async (newAcc) => {
    try {
      const res = await api.smartFin.createAccount(newAcc);
      if (res && res.success) {
        if (res.accounts) setAccounts(res.accounts);
        fetchSmartFinData();
        triggerToast(`Rekening/Dompet "${newAcc.name}" berhasil dibuat di Database!`);
      }
    } catch (err) {
      console.error('Failed to add account:', err);
      triggerToast('Gagal membuat rekening di DB.');
    }
  };

  const setDefaultAccount = async (accountId) => {
    try {
      const res = await api.smartFin.setDefaultAccount(accountId);
      if (res && res.success) {
        if (res.accounts) setAccounts(res.accounts);
        fetchSmartFinData();
        triggerToast(res.message || 'Rekening default berhasil disimpan di Database!');
      }
    } catch (err) {
      console.error('Failed to set default account:', err);
      triggerToast('Gagal memperbarui rekening default di Database.');
    }
  };

  const defaultAccount = accounts.find(a => a.isDefault) || accounts[0] || null;

  return (
    <SmartFinContext.Provider
      value={{
        accounts,
        walletAccounts: accounts,
        defaultAccount,
        transactions,
        envelopes,
        summary,
        loading,
        error,
        totalLiquidity,
        walletBalance: totalLiquidity,
        refetch: fetchSmartFinData,
        addTransaction,
        deleteTransaction,
        updateWalletBalance,
        transferAccounts,
        addAccount,
        setDefaultAccount,
        triggerToast,
        showToast,
        toastMsg
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#4edea3',
          color: '#003824',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 700,
          fontSize: '0.875rem'
        }}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </SmartFinContext.Provider>
  );
};

export const useSmartFin = () => useContext(SmartFinContext);
