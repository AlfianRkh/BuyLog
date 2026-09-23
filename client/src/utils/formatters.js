/**
 * Format number to Indonesian Rupiah currency
 * Example: 250000 -> "Rp 250.000"
 */
export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format ISO date string to Indonesian formatted date
 * Example: "2026-09-23" -> "23 Sep 2026"
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(date);
};

/**
 * Format full date with day name
 * Example: "2026-09-23" -> "Rabu, 23 September 2026"
 */
export const formatFullDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

/**
 * Format percentage change
 * Example: 8.5 -> "+8.5%" or -5.2 -> "-5.2%"
 */
export const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
};
