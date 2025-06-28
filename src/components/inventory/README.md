# Inventory Module

A comprehensive inventory management module built with React, TypeScript, and Ant Design components. This module provides a complete set of reusable components for managing inventory in your smart inventory system.

## Components Overview

### Core Components

#### 1. InventoryTable
A comprehensive table component for displaying inventory levels with filtering, sorting, and actions.

```tsx
import { InventoryTable } from '@/components/inventory';

<InventoryTable
  data={inventoryLevelsWithDetails}
  loading={loading}
  showActions={true}
  showSelection={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
  selectedRowKeys={selectedKeys}
  onSelectionChange={handleSelectionChange}
  pagination={paginationConfig}
/>
```

#### 2. InventoryStats
Displays key inventory statistics and metrics in a dashboard format.

```tsx
import { InventoryStats } from '@/components/inventory';

<InventoryStats
  inventoryLevels={inventoryLevels}
  className="mb-6"
/>
```

#### 3. InventoryFilters
Advanced filtering component with search, category, brand, location, and stock status filters.

```tsx
import { InventoryFilters } from '@/components/inventory';

<InventoryFilters
  filters={currentFilters}
  onFiltersChange={handleFiltersChange}
  onClearFilters={handleClearFilters}
  onRefresh={handleRefresh}
  categories={categories}
  brands={brands}
  locations={locations}
  showAdvanced={true}
/>
```

#### 4. InventorySummary
A compact summary component perfect for dashboards and overview pages.

```tsx
import { InventorySummary } from '@/components/inventory';

<InventorySummary
  products={products}
  inventoryLevels={inventoryLevels}
  title="Inventory Overview"
  showTopProducts={true}
  showAlerts={true}
  maxAlerts={5}
/>
```

### Product Components

#### 1. ProductCard
Card-based display for individual products with stock information.

```tsx
import { ProductCard } from '@/components/inventory';

<ProductCard
  product={product}
  inventoryLevel={inventoryLevel}
  onClick={handleProductClick}
  className="mb-4"
/>
```

### Stock Components

#### 1. StockLevelIndicator
Visual indicator for stock levels with progress bars and status colors.

```tsx
import { StockLevelIndicator } from '@/components/inventory';

<StockLevelIndicator
  currentStock={100}
  minStock={20}
  maxStock={500}
  reservedStock={10}
  showDetails={true}
  size="default"
/>
```

### Operations

#### 1. BulkOperations
Comprehensive bulk operations component for managing multiple inventory items.

```tsx
import { BulkOperations } from '@/components/inventory';

<BulkOperations
  selectedItems={selectedItemIds}
  onBulkUpdate={handleBulkUpdate}
  onBulkDelete={handleBulkDelete}
  onBulkTransfer={handleBulkTransfer}
  onExport={handleExport}
  onImport={handleImport}
  locations={availableLocations}
/>
```

## Usage Examples

### Complete Inventory Management Page

```tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  InventoryTable, 
  InventoryStats, 
  InventoryFilters, 
  BulkOperations 
} from '@/components/inventory';
import { Card, Space } from 'antd';

export default function InventoryManagementPage() {
  const [inventoryData, setInventoryData] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <InventoryStats 
        inventoryLevels={inventoryData}
      />

      {/* Filters and Bulk Operations */}
      <Card>
        <Space direction="vertical" size="large" className="w-full">
          <InventoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters({})}
            onRefresh={fetchData}
            categories={categories}
            brands={brands}
            locations={locations}
          />
          
          <BulkOperations
            selectedItems={selectedItems}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            onBulkTransfer={handleBulkTransfer}
            locations={locations}
          />
        </Space>
      </Card>

      {/* Main Inventory Table */}
      <Card>
        <InventoryTable
          data={inventoryData}
          loading={loading}
          showActions={true}
          showSelection={true}
          selectedRowKeys={selectedItems}
          onSelectionChange={(keys) => setSelectedItems(keys)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>
    </div>
  );
}
```

### Dashboard Summary

```tsx
import { InventorySummary } from '@/components/inventory';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InventorySummary
        products={products}
        inventoryLevels={inventoryLevels}
        title="Warehouse A"
        showTopProducts={true}
        showAlerts={true}
      />
      
      <InventorySummary
        products={storeProducts}
        inventoryLevels={storeInventory}
        title="Store NYC"
        showTopProducts={false}
        showAlerts={true}
        maxAlerts={3}
      />
    </div>
  );
}
```

## Type Definitions

The module uses extended types for better UI integration:

```typescript
interface InventoryLevelWithDetails extends InventoryLevel {
  product: Product;
  location: Location;
}

interface ProductWithInventory extends Product {
  inventoryLevels?: InventoryLevel[];
  totalStock?: number;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}
```

## Features

- **Responsive Design**: All components are mobile-friendly
- **Type Safety**: Full TypeScript support with proper type definitions
- **Customizable**: Extensive props for customization
- **Accessibility**: Built with accessibility best practices
- **Performance**: Optimized for large datasets
- **Integration**: Seamless integration with existing APIs

## API Integration

The components work with your existing API structure:

- `GET /api/inventory` - Fetch inventory levels
- `POST /api/inventory` - Update inventory levels
- `PUT /api/inventory` - Bulk update operations
- `GET /api/products` - Fetch products
- `GET /api/categories` - Fetch categories
- `GET /api/brands` - Fetch brands

## Styling

Components use Tailwind CSS classes and Ant Design theme. Customize appearance by:

1. Passing custom `className` props
2. Modifying Ant Design theme variables
3. Using CSS-in-JS for component-specific styles

## Best Practices

1. **Data Fetching**: Use the components' loading states while fetching data
2. **Error Handling**: Implement proper error boundaries around components
3. **Performance**: Use pagination and virtual scrolling for large datasets
4. **User Experience**: Provide clear feedback for all user actions
5. **Accessibility**: Ensure proper keyboard navigation and screen reader support 