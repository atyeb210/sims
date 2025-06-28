'use client';

import { Card, Row, Col, Statistic, Progress, Typography, Tooltip } from 'antd';
import { 
  ShoppingOutlined, 
  StockOutlined, 
  WarningOutlined, 
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { InventoryLevelWithDetails, Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

interface InventoryStatsProps {
  inventoryLevels: InventoryLevelWithDetails[];
  className?: string;
}

interface StatsData {
  totalProducts: number;
  totalValue: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  averageStockLevel: number;
  turnoverRate: number;
  stockDistribution: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    overstock: number;
  };
}

export default function InventoryStats({ inventoryLevels, className }: InventoryStatsProps) {
  const calculateStats = (): StatsData => {
    if (!inventoryLevels.length) {
      return {
        totalProducts: 0,
        totalValue: 0,
        inStockItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        overstockItems: 0,
        averageStockLevel: 0,
        turnoverRate: 0,
        stockDistribution: {
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          overstock: 0,
        },
      };
    }

    const stats = inventoryLevels.reduce((acc, level) => {
      const product = level.product as Product;
      const value = level.availableQuantity * product.unitCost;
      
      acc.totalValue += value;
      acc.totalStockQuantity += level.availableQuantity;
      
      // Categorize stock status
      if (level.availableQuantity === 0) {
        acc.outOfStockItems++;
      } else if (level.availableQuantity <= product.reorderLevel) {
        acc.lowStockItems++;
      } else if (product.maxStockLevel && level.availableQuantity > product.maxStockLevel) {
        acc.overstockItems++;
      } else {
        acc.inStockItems++;
      }
      
      return acc;
    }, {
      totalValue: 0,
      totalStockQuantity: 0,
      inStockItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      overstockItems: 0,
    });

    const totalProducts = inventoryLevels.length;
    const averageStockLevel = totalProducts > 0 ? stats.totalStockQuantity / totalProducts : 0;
    
    // Mock turnover rate calculation (would need sales data in real implementation)
    const turnoverRate = 2.5; // Average turnover per year
    
    const stockDistribution = {
      inStock: totalProducts > 0 ? (stats.inStockItems / totalProducts) * 100 : 0,
      lowStock: totalProducts > 0 ? (stats.lowStockItems / totalProducts) * 100 : 0,
      outOfStock: totalProducts > 0 ? (stats.outOfStockItems / totalProducts) * 100 : 0,
      overstock: totalProducts > 0 ? (stats.overstockItems / totalProducts) * 100 : 0,
    };

    return {
      totalProducts,
      totalValue: stats.totalValue,
      inStockItems: stats.inStockItems,
      lowStockItems: stats.lowStockItems,
      outOfStockItems: stats.outOfStockItems,
      overstockItems: stats.overstockItems,
      averageStockLevel,
      turnoverRate,
      stockDistribution,
    };
  };

  const stats = calculateStats();

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'inStock': return '#52c41a';
      case 'lowStock': return '#faad14';
      case 'outOfStock': return '#f5222d';
      case 'overstock': return '#722ed1';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (count: number, isGood: boolean = true) => {
    if (count === 0) return null;
    return isGood ? 
      <ArrowUpOutlined className="text-green-500 ml-1" /> : 
      <ArrowDownOutlined className="text-red-500 ml-1" />;
  };

  return (
    <div className={className}>
      <Row gutter={[16, 16]}>
        {/* Total Inventory Value */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={stats.totalValue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined className="text-green-600" />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2">
              <Text type="secondary" className="text-xs">
                {stats.totalProducts} products across all locations
              </Text>
            </div>
          </Card>
        </Col>

        {/* In Stock Items */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Stock Items"
              value={stats.inStockItems}
              prefix={<StockOutlined className="text-blue-600" />}
              suffix={getStatusIcon(stats.inStockItems, true)}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2">
              <Progress 
                percent={stats.stockDistribution.inStock} 
                size="small" 
                strokeColor="#52c41a"
                format={() => `${stats.stockDistribution.inStock.toFixed(1)}%`}
              />
            </div>
          </Card>
        </Col>

        {/* Low Stock Items */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Alerts"
              value={stats.lowStockItems}
              prefix={<WarningOutlined className="text-orange-600" />}
              suffix={getStatusIcon(stats.lowStockItems, false)}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div className="mt-2">
              <Progress 
                percent={stats.stockDistribution.lowStock} 
                size="small" 
                strokeColor="#faad14"
                format={() => `${stats.stockDistribution.lowStock.toFixed(1)}%`}
              />
            </div>
          </Card>
        </Col>

        {/* Out of Stock Items */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={stats.outOfStockItems}
              prefix={<AlertOutlined className="text-red-600" />}
              suffix={getStatusIcon(stats.outOfStockItems, false)}
              valueStyle={{ color: '#f5222d' }}
            />
            <div className="mt-2">
              <Progress 
                percent={stats.stockDistribution.outOfStock} 
                size="small" 
                strokeColor="#f5222d"
                format={() => `${stats.stockDistribution.outOfStock.toFixed(1)}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        {/* Stock Distribution */}
        <Col xs={24} lg={12}>
          <Card title="Stock Status Distribution" size="small">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2" 
                    style={{ backgroundColor: getStatusColor('inStock') }}
                  />
                  <Text>In Stock</Text>
                </div>
                <div className="text-right">
                  <div className="font-medium">{stats.inStockItems}</div>
                  <Text type="secondary" className="text-xs">
                    {stats.stockDistribution.inStock.toFixed(1)}%
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2" 
                    style={{ backgroundColor: getStatusColor('lowStock') }}
                  />
                  <Text>Low Stock</Text>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-600">{stats.lowStockItems}</div>
                  <Text type="secondary" className="text-xs">
                    {stats.stockDistribution.lowStock.toFixed(1)}%
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2" 
                    style={{ backgroundColor: getStatusColor('outOfStock') }}
                  />
                  <Text>Out of Stock</Text>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">{stats.outOfStockItems}</div>
                  <Text type="secondary" className="text-xs">
                    {stats.stockDistribution.outOfStock.toFixed(1)}%
                  </Text>
                </div>
              </div>

              {stats.overstockItems > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded mr-2" 
                      style={{ backgroundColor: getStatusColor('overstock') }}
                    />
                    <Text>Overstock</Text>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-purple-600">{stats.overstockItems}</div>
                    <Text type="secondary" className="text-xs">
                      {stats.stockDistribution.overstock.toFixed(1)}%
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Key Metrics */}
        <Col xs={24} lg={12}>
          <Card title="Key Metrics" size="small">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">Average Stock Level</Text>
                <Text strong>{stats.averageStockLevel.toFixed(0)} units</Text>
              </div>
              
              <div className="flex justify-between items-center">
                <Tooltip title="Average number of times inventory is sold per year">
                  <Text type="secondary">Inventory Turnover</Text>
                </Tooltip>
                <Text strong>{stats.turnoverRate.toFixed(1)}x/year</Text>
              </div>
              
              <div className="flex justify-between items-center">
                <Text type="secondary">Stock Health Score</Text>
                <div className="flex items-center">
                  <Progress 
                    type="circle" 
                    size={30}
                    percent={Math.round(stats.stockDistribution.inStock + (stats.stockDistribution.lowStock * 0.5))}
                    format={() => ''}
                    strokeColor={{
                      '0%': '#f5222d',
                      '50%': '#faad14',
                      '100%': '#52c41a',
                    }}
                  />
                  <Text strong className="ml-2">
                    {Math.round(stats.stockDistribution.inStock + (stats.stockDistribution.lowStock * 0.5))}%
                  </Text>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Text type="secondary">Reorder Alerts</Text>
                <Text strong className={stats.lowStockItems > 0 ? 'text-orange-600' : 'text-green-600'}>
                  {stats.lowStockItems + stats.outOfStockItems} items
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 