import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Number formatting
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Compact number formatting (1.2K, 1.5M, etc.)
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

// Date formatting utilities
export const formatDate = (
  date: Date | string,
  pattern: string = 'MMM dd, yyyy'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
};

export const formatDateTime = (
  date: Date | string,
  pattern: string = 'MMM dd, yyyy HH:mm'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// SKU formatting
export const formatSKU = (sku: string): string => {
  return sku.toUpperCase().replace(/[^A-Z0-9-]/g, '');
};

// Stock status utilities
export const getStockStatus = (
  currentStock: number,
  reorderLevel: number,
  maxLevel?: number
): 'out_of_stock' | 'low_stock' | 'in_stock' | 'overstock' => {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= reorderLevel) return 'low_stock';
  if (maxLevel && currentStock > maxLevel) return 'overstock';
  return 'in_stock';
};

export const getStockStatusColor = (status: string): string => {
  switch (status) {
    case 'out_of_stock':
      return 'text-red-600 bg-red-50';
    case 'low_stock':
      return 'text-amber-600 bg-amber-50';
    case 'overstock':
      return 'text-purple-600 bg-purple-50';
    case 'in_stock':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getStockStatusText = (status: string): string => {
  switch (status) {
    case 'out_of_stock':
      return 'Out of Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'overstock':
      return 'Overstock';
    case 'in_stock':
      return 'In Stock';
    default:
      return 'Unknown';
  }
};

// Alert severity utilities
export const getAlertSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Product attribute formatting
export const formatProductAttributes = (attributes: Record<string, any>): string => {
  const formatters: Record<string, (value: any) => string> = {
    color: (value) => value,
    size: (value) => value.toString().toUpperCase(),
    material: (value) => value,
    gender: (value) => value.charAt(0).toUpperCase() + value.slice(1),
    ageGroup: (value) => value.charAt(0).toUpperCase() + value.slice(1),
  };

  return Object.entries(attributes)
    .filter(([_, value]) => value != null && value !== '')
    .map(([key, value]) => {
      const formatter = formatters[key] || ((v) => v.toString());
      return formatter(value);
    })
    .join(' • ');
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Inventory turnover calculation
export const calculateTurnoverRate = (
  costOfGoodsSold: number,
  averageInventory: number
): number => {
  if (averageInventory === 0) return 0;
  return costOfGoodsSold / averageInventory;
};

// Days of inventory calculation
export const calculateDaysOfInventory = (
  currentInventory: number,
  averageDailySales: number
): number => {
  if (averageDailySales === 0) return Infinity;
  return currentInventory / averageDailySales;
};

// Forecast accuracy calculation
export const calculateForecastAccuracy = (
  actual: number[],
  forecast: number[]
): number => {
  if (actual.length !== forecast.length || actual.length === 0) return 0;
  
  const mape = actual.reduce((sum, actualValue, index) => {
    const forecastValue = forecast[index];
    if (actualValue === 0) return sum;
    return sum + Math.abs((actualValue - forecastValue) / actualValue);
  }, 0) / actual.length;
  
  return Math.max(0, 1 - mape);
};

// Generate random colors for charts
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
  ];
  
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

// Truncate text utility
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Search highlight utility
export const highlightSearchText = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}; 