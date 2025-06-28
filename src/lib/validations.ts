import { z } from 'zod';

// User validation schemas
export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).default('VIEWER'),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

// Category validation schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Brand validation schemas
export const brandCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  logo: z.string().url().optional(),
});

export const brandUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// Location validation schemas
export const locationCreateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['WAREHOUSE', 'STORE', 'DISTRIBUTION_CENTER', 'OUTLET']),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  manager: z.string().optional(),
});

export const locationUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['WAREHOUSE', 'STORE', 'DISTRIBUTION_CENTER', 'OUTLET']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  manager: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Product validation schemas
export const productAttributesSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  style: z.string().optional(),
  gender: z.enum(['men', 'women', 'unisex', 'kids']).optional(),
  ageGroup: z.enum(['adult', 'teen', 'child', 'infant']).optional(),
});

export const productCreateSchema = z.object({
  sku: z.string().min(1).max(100),
  parentSku: z.string().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  categoryId: z.string(),
  brandId: z.string(),
  season: z.enum(['SPRING_SUMMER', 'FALL_WINTER', 'RESORT', 'PRE_FALL', 'ALL_SEASON']).default('ALL_SEASON'),
  year: z.number().int().min(2000).max(2100),
  attributes: productAttributesSchema.default({}),
  unitCost: z.number().positive(),
  unitPrice: z.number().positive(),
  reorderLevel: z.number().int().min(0).default(10),
  maxStockLevel: z.number().int().positive().optional(),
});

export const productUpdateSchema = z.object({
  sku: z.string().min(1).max(100).optional(),
  parentSku: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  season: z.enum(['SPRING_SUMMER', 'FALL_WINTER', 'RESORT', 'PRE_FALL', 'ALL_SEASON']).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  attributes: productAttributesSchema.optional(),
  unitCost: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  reorderLevel: z.number().int().min(0).optional(),
  maxStockLevel: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// Inventory Level validation schemas
export const inventoryLevelUpdateSchema = z.object({
  productId: z.string(),
  locationId: z.string(),
  quantity: z.number().int().min(0),
  reservedQuantity: z.number().int().min(0).default(0),
});

export const inventoryBulkUpdateSchema = z.object({
  updates: z.array(inventoryLevelUpdateSchema).min(1).max(1000),
});

// Inventory Transaction validation schemas
export const inventoryTransactionCreateSchema = z.object({
  productId: z.string(),
  locationId: z.string(),
  type: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER_IN', 'TRANSFER_OUT', 'PROMOTION', 'MARKDOWN']),
  quantity: z.number().int(),
  unitCost: z.number().positive().optional(),
  totalCost: z.number().positive().optional(),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

// Sales Data validation schemas
export const salesDataCreateSchema = z.object({
  productId: z.string(),
  locationId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalAmount: z.number().positive(),
  discount: z.number().min(0).optional(),
  customerId: z.string().optional(),
  saleDate: z.string().datetime(),
  salesChannel: z.enum(['IN_STORE', 'ONLINE', 'MARKETPLACE', 'WHOLESALE', 'MOBILE_APP']),
});

export const salesDataBulkCreateSchema = z.object({
  salesData: z.array(salesDataCreateSchema).min(1).max(10000),
});

// Demand Forecast validation schemas
export const demandForecastCreateSchema = z.object({
  productId: z.string(),
  locationId: z.string().optional(),
  forecastDate: z.string().datetime(),
  forecastPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
  predictedDemand: z.number().int().min(0),
  confidenceLower: z.number().int().min(0),
  confidenceUpper: z.number().int().min(0),
  accuracy: z.number().min(0).max(1).optional(),
  modelUsed: z.string(),
  modelVersion: z.string().optional(),
});

// Alert validation schemas
export const alertCreateSchema = z.object({
  type: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'REORDER_POINT', 'EXPIRY_WARNING', 'PRICE_CHANGE', 'FORECAST_DEVIATION']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  productId: z.string().optional(),
  locationId: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export const alertUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  isResolved: z.boolean().optional(),
});

// Report validation schemas
export const reportCreateSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['INVENTORY_LEVELS', 'SALES_REPORT', 'ABC_ANALYSIS', 'DEAD_STOCK', 'FORECAST_ACCURACY', 'TURNOVER_ANALYSIS']),
  dateStart: z.string().datetime(),
  dateEnd: z.string().datetime(),
  filters: z.record(z.any()).default({}),
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  season: z.enum(['SPRING_SUMMER', 'FALL_WINTER', 'RESORT', 'PRE_FALL', 'ALL_SEASON']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  lowStock: z.coerce.boolean().optional(),
  outOfStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const inventoryFiltersSchema = z.object({
  search: z.string().optional(),
  locationId: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  outOfStock: z.coerce.boolean().optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().positive().max(10 * 1024 * 1024), // 10MB max
});

// Machine Learning model validation
export const mlModelCreateSchema = z.object({
  name: z.string().min(1).max(255),
  version: z.string().min(1).max(50),
  type: z.enum(['tensorflow', 'prophet', 'pytorch']),
  modelPath: z.string().optional(),
  accuracy: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
});

export const forecastRequestSchema = z.object({
  productIds: z.array(z.string()).min(1).max(1000),
  locationIds: z.array(z.string()).optional(),
  forecastPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
  horizonDays: z.number().int().min(1).max(365).default(30),
}); 