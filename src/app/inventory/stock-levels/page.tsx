'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col,
  message,
  Alert,
  Progress
} from 'antd';
import { 
  ReloadOutlined,
  ExportOutlined,
  AlertOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { 
  InventoryTable, 
  InventoryStats, 
  StockLevelIndicator 
} from '@/components/inventory';
import type { InventoryLevel, Product, Location } from '@/types';

const { Title, Text } = Typography;

export default function StockLevelsPage() {
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, productsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/products')
      ]);

      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json();
        setInventoryLevels(inventoryData.data || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mock locations for demo
  const mockLocations: Location[] = [
    { id: '1', name: 'Main Warehouse', type: 'warehouse', isActive: true },
    { id: '2', name: 'NYC Store', type: 'store', isActive: true },
    { id: '3', name: 'LA Store', type: 'store', isActive: true },
  ];

  // Create inventory levels with details
  const inventoryLevelsWithDetails = inventoryLevels.map(level => ({
    ...level,
    product: products.find(p => p.id === level.productId)!,
    location: mockLocations.find(l => l.id === level.locationId)!,
  })).filter(level => level.product && level.location);

  // Calculate stock alerts
  const lowStockItems = inventoryLevelsWithDetails.filter(level => 
    level.availableQuantity <= level.product.reorderLevel && level.availableQuantity > 0
  );
  
  const outOfStockItems = inventoryLevelsWithDetails.filter(level => 
    level.availableQuantity === 0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="mb-2 text-gray-900">
            Stock Levels Monitoring
          </Title>
          <Text type="secondary" className="text-base">
            Monitor and track inventory levels across all locations
          </Text>
        </div>
        
        <Space size="middle">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData} 
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<ExportOutlined />}>
            Export Report
          </Button>
        </Space>
      </div>

      {/* Alert Summary */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-4">
          {outOfStockItems.length > 0 && (
            <Alert
              type="error"
              showIcon
              icon={<AlertOutlined />}
              message={`${outOfStockItems.length} items are out of stock`}
              description="Immediate action required to replenish inventory"
              action={
                <Button size="small" danger>
                  View Items
                </Button>
              }
            />
          )}
          
          {lowStockItems.length > 0 && (
            <Alert
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              message={`${lowStockItems.length} items are running low`}
              description="Consider reordering these items soon"
              action={
                <Button size="small">
                  View Items
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* Stock Statistics */}
      <InventoryStats
        inventoryLevels={inventoryLevelsWithDetails}
      />

      {/* Stock Level Indicators */}
      <Card title="Stock Level Overview" className="shadow-sm">
        <Row gutter={[16, 16]}>
          {inventoryLevelsWithDetails.slice(0, 12).map((level) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`${level.productId}-${level.locationId}`}>
              <div className="p-4 border rounded-lg">
                <div className="mb-3">
                  <Text strong className="block">{level.product.name}</Text>
                  <Text type="secondary" className="text-sm">
                    {level.location.name}
                  </Text>
                </div>
                
                <StockLevelIndicator
                  currentStock={level.availableQuantity}
                  minStock={level.product.reorderLevel}
                  maxStock={level.product.reorderLevel * 3}
                />
                
                <div className="mt-2 flex justify-between text-sm">
                  <span>Current: {level.availableQuantity}</span>
                  <span>Reorder: {level.product.reorderLevel}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Detailed Stock Table */}
      <Card title="Detailed Stock Levels" className="shadow-sm">
        <InventoryTable
          data={inventoryLevelsWithDetails}
          loading={loading}
          showActions={false}
          showSelection={false}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => 
              `${range[0]}-${range[1]} of ${total} stock entries`,
          }}
        />
      </Card>
    </div>
  );
} 