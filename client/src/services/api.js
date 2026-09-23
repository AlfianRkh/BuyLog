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
  }
};
