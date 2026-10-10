const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('buylog_token');
  const headers = {
    ...(!options.isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && !options.isFormData && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('buylog_token');
      localStorage.removeItem('buylog_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    const error = new Error(data.message || 'Terjadi kesalahan pada permintaan data.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(url, { method: 'GET' });
  },

  post: (endpoint, body) => {
    return request(endpoint, { method: 'POST', body });
  },

  put: (endpoint, body) => {
    return request(endpoint, { method: 'PUT', body });
  },

  delete: (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  },

  upload: (endpoint, formData) => {
    return request(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  // DebtTracker API Methods
  debtTracker: {
    getContacts: (search = '') => api.get('/debt-tracker/contacts', { search }),
    createContact: (data) => api.post('/debt-tracker/contacts', data),
    getContactWASummary: (id) => api.get(`/debt-tracker/contacts/${id}/summary-text`),
    getDebtSummary: () => api.get('/debt-tracker/debts/summary'),
    getDebts: (params = {}) => api.get('/debt-tracker/debts', params),
    getDebtDetail: (id) => api.get(`/debt-tracker/debts/${id}`),
    createDebt: (data) => api.post('/debt-tracker/debts', data),
    recordPayment: (id, data) => api.post(`/debt-tracker/debts/${id}/payments`, data),
    cancelDebt: (id, reason) => api.put(`/debt-tracker/debts/${id}/cancel`, { reason }),
    deleteDebt: (id) => api.delete(`/debt-tracker/debts/${id}`),
    getMonthlyReport: () => api.get('/debt-tracker/reports/monthly'),
    getDebtMonthlyReport: () => api.get('/debt-tracker/reports/monthly'),
    getSettings: () => api.get('/debt-tracker/settings'),
    updateSettings: (data) => api.put('/debt-tracker/settings', data)
  },

  // Category API Methods (Unified Categories Table by Feature)
  categories: {
    getAll: (feature) => api.get('/categories', { feature }),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`)
  },

  // PriceRadar API Methods
  priceRadar: {
    getDashboard: () => api.get('/priceradar/dashboard'),
    getWatchlist: (params = {}) => api.get('/priceradar/watchlist', params),
    createWatchlist: (data) => api.post('/priceradar/watchlist', data),
    getProductDetail: (idOrSlug) => api.get(`/priceradar/watchlist/${idOrSlug}`),
    updateWatchlist: (id, data) => api.put(`/priceradar/watchlist/${id}`, data),
    deleteWatchlist: (id) => api.delete(`/priceradar/watchlist/${id}`),
    recordLog: (data) => api.post('/priceradar/logs', data),
    getSources: (params = {}) => api.get('/priceradar/sources', params),
    createSource: (data) => api.post('/priceradar/sources', data),
    updateSource: (id, data) => api.put(`/priceradar/sources/${id}`, data),
    getStats: (params = {}) => api.get('/priceradar/stats', params),
    getCategories: () => api.get('/priceradar/categories'),
    createCategory: (data) => api.post('/priceradar/categories', data)
  },

  // SmartFin API Methods
  smartFin: {
    getSplitBill: () => api.get('/smartfin/split-bill'),
    toggleMemberPaid: (memberId) => api.put(`/smartfin/split-bill/members/${memberId}/toggle-paid`),
    addMember: (data) => api.post('/smartfin/split-bill/members', data),
    getAccounts: () => api.get('/smartfin/accounts'),
    getMutations: (accountId) => api.get(`/smartfin/accounts/${accountId}/mutations`),
    createAccount: (data) => api.post('/smartfin/accounts', data),
    transferAccounts: (data) => api.post('/smartfin/accounts/transfer', data),
    setDefaultAccount: (id) => api.put(`/smartfin/accounts/${id}/set-default`),
    deleteAccount: (id) => api.delete(`/smartfin/accounts/${id}`),
    getBudgets: () => api.get('/smartfin/budgets'),
    createBudget: (data) => api.post('/smartfin/budgets', data),
    applyRule503020: (salary) => api.post('/smartfin/budgets/apply-503020', { salary }),
    deleteBudget: (id) => api.delete(`/smartfin/budgets/${id}`),
    getDashboard: () => api.get('/smartfin/dashboard'),
    scanReceipt: (data) => api.post('/smartfin/scan-receipt', data),
    getTransactions: (params = {}) => api.get('/smartfin/transactions', params),
    createTransaction: (data) => api.post('/smartfin/transactions', data),
    deleteTransaction: (id) => api.delete(`/smartfin/transactions/${id}`),
    getReports: () => api.get('/smartfin/reports'),
    getSettings: () => api.get('/smartfin/settings'),
    updateSettings: (data) => api.put('/smartfin/settings', data),
    getCategories: () => api.get('/smartfin/categories'),
    createCategory: (data) => api.post('/smartfin/categories', data),
    deleteCategory: (id) => api.delete(`/smartfin/categories/${id}`)
  },

  // WishBoard API Methods
  wishboard: {
    getDashboard: () => api.get('/wishboard/dashboard'),
    getItems: () => api.get('/wishboard/items'),
    createItem: (data) => api.post('/wishboard/items', data),
    updateItemStatus: (id, status) => api.put(`/wishboard/items/${id}/status`, { status }),
    addDeposit: (id, amount, note) => api.post(`/wishboard/items/${id}/deposit`, { amount, note }),
    addPro: (id, text) => api.post(`/wishboard/items/${id}/pros`, { text }),
    addCon: (id, text) => api.post(`/wishboard/items/${id}/cons`, { text }),
    skipItem: (id, reason) => api.post(`/wishboard/items/${id}/skip`, { reason }),
    deleteItem: (id) => api.delete(`/wishboard/items/${id}`),
    getSettings: () => api.get('/wishboard/settings'),
    updateSettings: (data) => api.put('/wishboard/settings', data)
  },

  // StockPantry API Methods
  stockPantry: {
    getDashboard: () => api.get('/stockpantry/dashboard'),
    getItems: () => api.get('/stockpantry/items'),
    createItem: (data) => api.post('/stockpantry/items', data),
    updateItem: (id, data) => api.put(`/stockpantry/items/${id}`, data),
    deleteItem: (id) => api.delete(`/stockpantry/items/${id}`),
    consumeItem: (id, qtyUsed, note) => api.post(`/stockpantry/items/${id}/consume`, { qtyUsed, note }),
    addShoppingItem: (data) => api.post('/stockpantry/shopping', data),
    toggleShoppingCheck: (id) => api.put(`/stockpantry/shopping/${id}/toggle`),
    commitRestock: () => api.post('/stockpantry/shopping/commit-restock'),
    createZone: (data) => api.post('/stockpantry/zones', data)
  }
};

export default api;



