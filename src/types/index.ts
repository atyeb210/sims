// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Product and Inventory Types
export interface Product {
  id: string;
  sku: string;
  parentSku?: string; // For variants like different sizes/colors
  name: string;
  description?: string;
  category: ProductCategory;
  brand: Brand;
  season: Season;
  year: number;
  attributes: ProductAttributes;
  unitCost: number;
  unitPrice: number;
  reorderLevel: number;
  maxStockLevel?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttributes {
  color?: string;
  size?: string;
  material?: string;
  style?: string;
  gender?: 'men' | 'women' | 'unisex' | 'kids';
  ageGroup?: 'adult' | 'teen' | 'child' | 'infant';
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

export type Season = 'Spring/Summer' | 'Fall/Winter' | 'Resort' | 'Pre-Fall' | 'All Season';

// Inventory Management Types
export interface InventoryLevel {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: Date;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address?: string;
  contactInfo?: ContactInfo;
  isActive: boolean;
}

export type LocationType = 'warehouse' | 'store' | 'distribution_center' | 'outlet';

export interface ContactInfo {
  phone?: string;
  email?: string;
  manager?: string;
}

// Inventory Transactions
export interface InventoryTransaction {
  id: string;
  productId: string;
  locationId: string;
  type: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  referenceId?: string; // PO number, invoice number, etc.
  performedBy: string;
  timestamp: Date;
  notes?: string;
}

export type TransactionType = 
  | 'purchase' 
  | 'sale' 
  | 'adjustment' 
  | 'return' 
  | 'damage' 
  | 'transfer_in' 
  | 'transfer_out'
  | 'promotion'
  | 'markdown';

// Analytics and Forecasting Types
export interface DemandForecast {
  id: string;
  productId: string;
  locationId?: string;
  forecastDate: Date;
  forecastPeriod: ForecastPeriod;
  predictedDemand: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  accuracy?: number;
  modelUsed: string;
  createdAt: Date;
}

export type ForecastPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface SalesData {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount?: number;
  customerId?: string;
  saleDate: Date;
  salesChannel: SalesChannel;
}

export type SalesChannel = 'in_store' | 'online' | 'marketplace' | 'wholesale' | 'mobile_app';

// Alerts and Notifications
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  productId?: string;
  locationId?: string;
  data?: Record<string, any>;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export type AlertType = 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'overstock' 
  | 'reorder_point' 
  | 'expiry_warning'
  | 'price_change'
  | 'forecast_deviation';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Dashboard and Analytics Types
export interface DashboardMetrics {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topSellingProducts: TopProduct[];
  inventoryTurnover: number;
  forecastAccuracy: number;
  alertsCount: {
    total: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<AlertSeverity, number>;
  };
}

export interface TopProduct {
  product: Product;
  totalSold: number;
  revenue: number;
  growthRate: number;
}

export interface InventoryReport {
  id: string;
  name: string;
  type: ReportType;
  dateRange: DateRange;
  filters: ReportFilters;
  data: any[];
  generatedAt: Date;
  generatedBy: string;
}

export type ReportType = 
  | 'inventory_levels' 
  | 'sales_report' 
  | 'abc_analysis' 
  | 'dead_stock' 
  | 'forecast_accuracy'
  | 'turnover_analysis';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportFilters {
  categories?: string[];
  brands?: string[];
  locations?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  stockStatus?: ('in_stock' | 'low_stock' | 'out_of_stock')[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form and Filter Types
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  season?: Season;
  priceRange?: {
    min: number;
    max: number;
  };
  stockStatus?: ('in_stock' | 'low_stock' | 'out_of_stock')[];
  isActive?: boolean;
}

export interface InventoryFilters {
  search?: string;
  locationId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  categoryId?: string;
  brandId?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

// Extended types for UI components with related data
export interface InventoryLevelWithDetails extends InventoryLevel {
  product: Product;
  location: Location;
}

export interface ProductWithInventory extends Product {
  inventoryLevels?: InventoryLevel[];
  totalStock?: number;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// Component Props Types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

// Utility Types
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export type ViewMode = 'grid' | 'list' | 'card';

export type ThemeMode = 'light' | 'dark';

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// File Upload Types
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  multiple: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Export all types
export type * from './index'; 