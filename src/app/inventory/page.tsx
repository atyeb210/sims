'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Tabs, 
  Row, 
  Col,
  message,
  FloatButton
} from 'antd';
import { 
  DashboardOutlined,
  SettingOutlined,
  ReloadOutlined,
  ExportOutlined,
  PlusOutlined,
  AlertOutlined
} from '@ant-design/icons';
import {
  InventoryTable,
  InventoryStats,
  InventoryFilters,
  InventorySummary,
  BulkOperations
} from '@/components/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { Product, InventoryLevel, Location, ProductCategory, Brand, InventoryFilters as IFilters } from '@/types';

const { Title, Text } = Typography;

// Mock data for apparel industry
const mockCategories: ProductCategory[] = [
  { id: '1', name: 'Clothing', description: 'Apparel items' },
  { id: '2', name: 'Accessories', description: 'Fashion accessories' },
  { id: '3', name: 'Footwear', description: 'Shoes and sandals' },
  { id: '4', name: 'Bags', description: 'Handbags and backpacks' },
];

const mockBrands: Brand[] = [
  { id: '1', name: 'Fashion Forward', description: 'Premium fashion brand' },
  { id: '2', name: 'Casual Comfort', description: 'Casual wear brand' },
  { id: '3', name: 'Sport Elite', description: 'Sports apparel brand' },
];

const mockLocations: Location[] = [
  { id: '1', name: 'Main Warehouse', type: 'warehouse', isActive: true },
  { id: '2', name: 'NYC Store', type: 'store', isActive: true },
  { id: '3', name: 'LA Store', type: 'store', isActive: true },
  { id: '4', name: 'Distribution Center', type: 'distribution_center', isActive: true },
];

export default function InventoryManagementPage() {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [filters, setFilters] = useState<IFilters>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Zustand store
  const {
    isLoading: storeLoading,
    error: storeError,
    setLoading: setStoreLoading,
    setError: setStoreError
  } = useInventoryStore();

  // Data fetching
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setStoreLoading(true);

      // Simulate API calls - replace with actual API endpoints
      const [productsRes, inventoryRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventoryLevels(inventoryData.data || []);
      }

      message.success('Inventory data refreshed successfully');
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setStoreError('Failed to fetch inventory data');
      message.error('Failed to refresh inventory data');
    } finally {
      setLoading(false);
      setStoreLoading(false);
    }
  };

  // Bulk operations handlers
  const handleBulkUpdate = async (updates: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryLevels: updates, selectedItems })
      });

      if (!response.ok) throw new Error('Bulk update failed');
      
      await fetchInventoryData();
      setSelectedItems([]);
      message.success(`Updated ${selectedItems.length} items successfully`);
    } catch (error) {
      message.error('Bulk update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await fetchInventoryData();
      setSelectedItems([]);
      message.success(`Deleted ${selectedItems.length} items successfully`);
    } catch (error) {
      message.error('Bulk delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkTransfer = async (locationId: string, notes?: string) => {
    try {
      setLoading(true);
      await fetchInventoryData();
      setSelectedItems([]);
      message.success(`Transferred ${selectedItems.length} items successfully`);
    } catch (error) {
      message.error('Bulk transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('Exporting inventory data...');
  };

  const handleImport = (file: File) => {
    message.info(`Importing data from ${file.name}...`);
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: Partial<IFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Selection handlers
  const handleSelectionChange = (selectedRowKeys: React.Key[]) => {
    setSelectedItems(selectedRowKeys as string[]);
  };

  // Initial data load
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filter inventory levels
  const filteredInventoryLevels = inventoryLevels.filter(level => {
    const product = products.find(p => p.id === level.productId);
    if (!product) return false;

    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !product.sku.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.categoryId && product.category.id !== filters.categoryId) return false;
    if (filters.brandId && product.brand.id !== filters.brandId) return false;
    if (filters.locationId && level.locationId !== filters.locationId) return false;
    if (filters.lowStock && level.availableQuantity > product.reorderLevel) return false;
    if (filters.outOfStock && level.availableQuantity > 0) return false;

    return true;
  });

  // Create inventory levels with details
  const inventoryLevelsWithDetails = filteredInventoryLevels.map(level => ({
    ...level,
    product: products.find(p => p.id === level.productId)!,
    location: mockLocations.find(l => l.id === level.locationId)!,
  })).filter(level => level.product && level.location);

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <Title level={2} className="mb-0 text-slate-800 font-bold text-3xl tracking-tight">
              Smart Inventory Management
            </Title>
            <Text className="text-slate-600 text-lg font-medium leading-relaxed">
              Comprehensive inventory management for the apparel industry
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchInventoryData} 
              loading={loading}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Refresh
            </Button>
            <Button 
              icon={<ExportOutlined />} 
              onClick={handleExport}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Export
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
              className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none rounded-xl shadow-lg font-semibold hover:shadow-xl transition-all duration-200"
            >
              Add Product
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          className="[&_.ant-tabs-tab]:px-8 [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab]:rounded-xl [&_.ant-tabs-tab]:font-semibold [&_.ant-tabs-tab-active]:bg-blue-50/80 [&_.ant-tabs-content-holder]:pt-8"
          items={[
            {
              key: 'overview',
              label: (
                <span className="flex items-center gap-2">
                  <DashboardOutlined />
                  Overview
                </span>
              )
            },
            {
              key: 'inventory',
              label: (
                <span className="flex items-center gap-2">
                  <AlertOutlined />
                  Inventory Management
                </span>
              )
            },
            {
              key: 'analytics',
              label: (
                <span className="flex items-center gap-2">
                  <SettingOutlined />
                  Analytics & Forecasting
                </span>
              )
            }
          ]}
        />
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Inventory Statistics */}
          <div className="px-2">
            <InventoryStats
              inventoryLevels={inventoryLevelsWithDetails}
            />
          </div>
          
          {/* Summary Cards */}
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <InventorySummary
                products={products}
                inventoryLevels={inventoryLevels}
                title="Warehouse Overview"
                showTopProducts={true}
                showAlerts={true}
                maxAlerts={5}
              />
            </Col>
            <Col xs={24} lg={12}>
              <InventorySummary
                products={products.filter(p => p.category?.name === 'Clothing')}
                inventoryLevels={inventoryLevels.filter(l => {
                  const product = products.find(p => p.id === l.productId);
                  return product?.category?.name === 'Clothing';
                })}
                title="Clothing Category"
                showTopProducts={false}
                showAlerts={true}
                maxAlerts={3}
              />
            </Col>
          </Row>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-10">
          {/* Filters */}
          <div className="px-2">
            <InventoryFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              onRefresh={fetchInventoryData}
              loading={loading}
              categories={mockCategories}
              brands={mockBrands}
              locations={mockLocations}
              showAdvanced={true}
            />
          </div>

          {/* Bulk Operations */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50">
            <div className="p-4">
              <BulkOperations
                selectedItems={selectedItems}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
                onBulkTransfer={handleBulkTransfer}
                onExport={handleExport}
                onImport={handleImport}
                locations={mockLocations}
                disabled={loading}
              />
            </div>
          </Card>

          {/* Main Inventory Table */}
          <Card 
            title={
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertOutlined className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold text-slate-800">{`Inventory Items (${inventoryLevelsWithDetails.length})`}</span>
              </div>
            }
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50"
          >
            <div className="p-2">
              <InventoryTable
                data={inventoryLevelsWithDetails}
                loading={loading || storeLoading}
                showActions={true}
                showSelection={true}
                selectedRowKeys={selectedItems}
                onSelectionChange={handleSelectionChange}
                onEdit={(record) => message.info(`Edit ${record.product.name}`)}
                onDelete={(record) => message.info(`Delete ${record.product.name}`)}
                onView={(record) => message.info(`View ${record.product.name}`)}
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total: number, range: [number, number]) => 
                    `${range[0]}-${range[1]} of ${total} items`,
                }}
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-10">
          <Row gutter={[32, 32]}>
            <Col span={24}>
              <Card 
                title={
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <SettingOutlined className="text-white text-lg" />
                    </div>
                    <span className="text-xl font-bold text-slate-800">Demand Forecasting & Analytics</span>
                  </div>
                }
                loading={loading}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50"
              >
                <div className="text-center py-20 px-8">
                  <Title level={3} className="mb-6 text-slate-800">Machine Learning Forecasting</Title>
                  <Text type="secondary" className="text-xl block mb-12 leading-relaxed">
                    Advanced demand forecasting with TensorFlow.js and PyTorch models for apparel industry
                  </Text>
                  <div className="flex flex-wrap justify-center gap-6">
                    <Button 
                      type="primary" 
                      size="large"
                      className="h-12 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none rounded-xl shadow-lg font-semibold"
                    >
                      Generate Forecast
                    </Button>
                    <Button 
                      size="large"
                      className="h-12 px-8 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      View Seasonal Trends
                    </Button>
                    <Button 
                      size="large"
                      className="h-12 px-8 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Size/Color Analysis
                    </Button>
                    <Button 
                      size="large"
                      className="h-12 px-8 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Export Report
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Floating Action Buttons */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<SettingOutlined />}
      >
        <FloatButton icon={<ReloadOutlined />} tooltip="Refresh Data" onClick={fetchInventoryData} />
        <FloatButton icon={<ExportOutlined />} tooltip="Export Data" onClick={handleExport} />
        <FloatButton icon={<PlusOutlined />} tooltip="Add Product" />
      </FloatButton.Group>
    </>
  );
} 