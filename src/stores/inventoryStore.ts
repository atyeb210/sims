import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Product, 
  InventoryLevel, 
  InventoryFilters, 
  SortConfig, 
  ViewMode,
  Alert 
} from '@/types';

interface InventoryState {
  // Products
  products: Product[];
  selectedProducts: string[];
  productFilters: InventoryFilters;
  productSortConfig: SortConfig;
  
  // Inventory levels
  inventoryLevels: InventoryLevel[];
  selectedInventoryItems: string[];
  
  // UI State
  viewMode: ViewMode;
  isLoading: boolean;
  error: string | null;
  
  // Alerts
  alerts: Alert[];
  unreadAlertsCount: number;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  
  setSelectedProducts: (ids: string[]) => void;
  toggleProductSelection: (id: string) => void;
  clearProductSelection: () => void;
  
  setProductFilters: (filters: Partial<InventoryFilters>) => void;
  clearProductFilters: () => void;
  
  setProductSortConfig: (config: SortConfig) => void;
  
  setInventoryLevels: (levels: InventoryLevel[]) => void;
  updateInventoryLevel: (id: string, updates: Partial<InventoryLevel>) => void;
  
  setSelectedInventoryItems: (ids: string[]) => void;
  toggleInventoryItemSelection: (id: string) => void;
  clearInventorySelection: () => void;
  
  setViewMode: (mode: ViewMode) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;
  markAlertAsResolved: (id: string) => void;
  removeAlert: (id: string) => void;
  
  // Computed values
  getFilteredProducts: () => Product[];
  getLowStockItems: () => InventoryLevel[];
  getOutOfStockItems: () => InventoryLevel[];
  getTotalInventoryValue: () => number;
}

const initialFilters: InventoryFilters = {
  search: '',
  locationId: '',
  lowStock: false,
  outOfStock: false,
  categoryId: '',
  brandId: '',
};

const initialSortConfig: SortConfig = {
  field: 'name',
  order: 'asc',
};

export const useInventoryStore = create<InventoryState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: [],
        selectedProducts: [],
        productFilters: initialFilters,
        productSortConfig: initialSortConfig,
        
        inventoryLevels: [],
        selectedInventoryItems: [],
        
        viewMode: 'list',
        isLoading: false,
        error: null,
        
        alerts: [],
        unreadAlertsCount: 0,
        
        // Actions
        setProducts: (products) => set({ products }),
        
        addProduct: (product) => 
          set((state) => ({ 
            products: [...state.products, product] 
          })),
        
        updateProduct: (id, updates) =>
          set((state) => ({
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...updates } : product
            ),
          })),
        
        removeProduct: (id) =>
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            selectedProducts: state.selectedProducts.filter((pid) => pid !== id),
          })),
        
        setSelectedProducts: (ids) => set({ selectedProducts: ids }),
        
        toggleProductSelection: (id) =>
          set((state) => ({
            selectedProducts: state.selectedProducts.includes(id)
              ? state.selectedProducts.filter((pid) => pid !== id)
              : [...state.selectedProducts, id],
          })),
        
        clearProductSelection: () => set({ selectedProducts: [] }),
        
        setProductFilters: (filters) =>
          set((state) => ({
            productFilters: { ...state.productFilters, ...filters },
          })),
        
        clearProductFilters: () => set({ productFilters: initialFilters }),
        
        setProductSortConfig: (config) => set({ productSortConfig: config }),
        
        setInventoryLevels: (levels) => set({ inventoryLevels: levels }),
        
        updateInventoryLevel: (id, updates) =>
          set((state) => ({
            inventoryLevels: state.inventoryLevels.map((level) =>
              level.id === id ? { ...level, ...updates } : level
            ),
          })),
        
        setSelectedInventoryItems: (ids) => set({ selectedInventoryItems: ids }),
        
        toggleInventoryItemSelection: (id) =>
          set((state) => ({
            selectedInventoryItems: state.selectedInventoryItems.includes(id)
              ? state.selectedInventoryItems.filter((iid) => iid !== id)
              : [...state.selectedInventoryItems, id],
          })),
        
        clearInventorySelection: () => set({ selectedInventoryItems: [] }),
        
        setViewMode: (mode) => set({ viewMode: mode }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        
        setAlerts: (alerts) => 
          set({ 
            alerts, 
            unreadAlertsCount: alerts.filter(alert => !alert.isRead).length 
          }),
        
        addAlert: (alert) =>
          set((state) => ({
            alerts: [alert, ...state.alerts],
            unreadAlertsCount: alert.isRead ? state.unreadAlertsCount : state.unreadAlertsCount + 1,
          })),
        
        markAlertAsRead: (id) =>
          set((state) => ({
            alerts: state.alerts.map((alert) =>
              alert.id === id ? { ...alert, isRead: true } : alert
            ),
            unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1),
          })),
        
        markAlertAsResolved: (id) =>
          set((state) => ({
            alerts: state.alerts.map((alert) =>
              alert.id === id 
                ? { ...alert, isResolved: true, resolvedAt: new Date() } 
                : alert
            ),
          })),
        
        removeAlert: (id) =>
          set((state) => {
            const alertToRemove = state.alerts.find(alert => alert.id === id);
            const wasUnread = alertToRemove && !alertToRemove.isRead;
            
            return {
              alerts: state.alerts.filter((alert) => alert.id !== id),
              unreadAlertsCount: wasUnread 
                ? Math.max(0, state.unreadAlertsCount - 1)
                : state.unreadAlertsCount,
            };
          }),
        
        // Computed values
        getFilteredProducts: () => {
          const state = get();
          let filtered = [...state.products];
          
          const { search, categoryId, brandId, lowStock, outOfStock } = state.productFilters;
          
          if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
              (product) =>
                product.name.toLowerCase().includes(searchLower) ||
                product.sku.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower)
            );
          }
          
          if (categoryId) {
            filtered = filtered.filter((product) => product.category.id === categoryId);
          }
          
          if (brandId) {
            filtered = filtered.filter((product) => product.brand.id === brandId);
          }
          
          if (lowStock || outOfStock) {
            const inventoryMap = new Map(
              state.inventoryLevels.map((level) => [level.productId, level])
            );
            
            filtered = filtered.filter((product) => {
              const inventory = inventoryMap.get(product.id);
              if (!inventory) return false;
              
              if (outOfStock && inventory.availableQuantity <= 0) return true;
              if (lowStock && inventory.availableQuantity <= product.reorderLevel) return true;
              
              return false;
            });
          }
          
          // Apply sorting
          const { field, order } = state.productSortConfig;
          filtered.sort((a, b) => {
            let aValue = a[field as keyof Product];
            let bValue = b[field as keyof Product];
            
            // Handle nested properties
            if (field === 'category.name') {
              aValue = a.category.name;
              bValue = b.category.name;
            } else if (field === 'brand.name') {
              aValue = a.brand.name;
              bValue = b.brand.name;
            }
            
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
          });
          
          return filtered;
        },
        
        getLowStockItems: () => {
          const state = get();
          const productMap = new Map(state.products.map((product) => [product.id, product]));
          
          return state.inventoryLevels.filter((level) => {
            const product = productMap.get(level.productId);
            return product && level.availableQuantity <= product.reorderLevel && level.availableQuantity > 0;
          });
        },
        
        getOutOfStockItems: () => {
          const state = get();
          return state.inventoryLevels.filter((level) => level.availableQuantity <= 0);
        },
        
        getTotalInventoryValue: () => {
          const state = get();
          const productMap = new Map(state.products.map((product) => [product.id, product]));
          
          return state.inventoryLevels.reduce((total, level) => {
            const product = productMap.get(level.productId);
            return total + (product ? product.unitCost * level.availableQuantity : 0);
          }, 0);
        },
      }),
      {
        name: 'inventory-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          productFilters: state.productFilters,
          productSortConfig: state.productSortConfig,
        }),
      }
    ),
    { name: 'inventory-store' }
  )
); 