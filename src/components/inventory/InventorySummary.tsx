'use client';

import { Card, Row, Col, Statistic, Avatar, List, Tag, Typography, Tooltip } from 'antd';
import { 
  WarningOutlined, 
  AlertOutlined, 
  ShoppingOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import { Product, InventoryLevel } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

interface InventorySummaryProps {
  products: Product[];
  inventoryLevels: InventoryLevel[];
  title?: string;
  showTopProducts?: boolean;
  showAlerts?: boolean;
  maxAlerts?: number;
  className?: string;
}

export default function InventorySummary({
  products = [],
  inventoryLevels = [],
  title = "Inventory Summary",
  showTopProducts = true,
  showAlerts = true,
  maxAlerts = 5,
  className
}: InventorySummaryProps) {
  // Calculate summary statistics
  const totalProducts = products.length;
  const totalValue = inventoryLevels.reduce((sum, level) => {
    const product = products.find(p => p.id === level.productId);
    return sum + (level.availableQuantity * (product?.unitCost || 0));
  }, 0);

  const stockAlerts = inventoryLevels.filter(level => {
    const product = products.find(p => p.id === level.productId);
    return product && level.availableQuantity <= product.reorderLevel;
  });

  const outOfStockItems = inventoryLevels.filter(level => level.availableQuantity === 0);
  const lowStockItems = stockAlerts.filter(level => level.availableQuantity > 0);

  // Get top products by value
  const topProducts = inventoryLevels
    .map(level => {
      const product = products.find(p => p.id === level.productId);
      if (!product) return null;
      return {
        product,
        level,
        value: level.availableQuantity * product.unitCost
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.value || 0) - (a?.value || 0))
    .slice(0, 5);

  const alertItems = stockAlerts.slice(0, maxAlerts).map(level => {
    const product = products.find(p => p.id === level.productId);
    if (!product) return null;
    
    const isOutOfStock = level.availableQuantity === 0;
    return {
      id: level.id,
      title: product.name,
      description: `SKU: ${product.sku} | Stock: ${level.availableQuantity}`,
      type: isOutOfStock ? 'critical' : 'warning',
      icon: isOutOfStock ? <AlertOutlined /> : <WarningOutlined />,
      color: isOutOfStock ? 'red' : 'orange'
    };
  }).filter(Boolean);

  return (
    <div className={className}>
      <Card title={title} size="small">
        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={6}>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ fontSize: '18px' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total Value"
              value={totalValue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
              valueStyle={{ fontSize: '18px', color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Low Stock"
              value={lowStockItems.length}
              prefix={<WarningOutlined />}
              valueStyle={{ 
                fontSize: '18px', 
                color: lowStockItems.length > 0 ? '#fa8c16' : '#52c41a' 
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Out of Stock"
              value={outOfStockItems.length}
              prefix={<AlertOutlined />}
              valueStyle={{ 
                fontSize: '18px', 
                color: outOfStockItems.length > 0 ? '#f5222d' : '#52c41a' 
              }}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Top Products by Value */}
          {showTopProducts && (
            <Col span={12}>
              <Card title="Top Products by Value" size="small" type="inner">
                <List
                  size="small"
                  dataSource={topProducts}
                  renderItem={(item: any) => (
                    <List.Item className="px-0">
                      <List.Item.Meta
                        avatar={
                          <Avatar size="small" style={{ backgroundColor: '#f0f0f0', color: '#999' }}>
                            {item.product.name.charAt(0)}
                          </Avatar>
                        }
                        title={
                          <div className="flex justify-between items-center">
                            <Text className="text-sm">{item.product.name}</Text>
                            <Text strong className="text-sm">{formatCurrency(item.value)}</Text>
                          </div>
                        }
                        description={
                          <div className="flex justify-between text-xs">
                            <span>Stock: {item.level.availableQuantity}</span>
                            <span>{item.product.sku}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          )}

          {/* Stock Alerts */}
          {showAlerts && (
            <Col span={showTopProducts ? 12 : 24}>
              <Card 
                title={
                  <div className="flex justify-between items-center">
                    <span>Stock Alerts</span>
                    {stockAlerts.length > maxAlerts && (
                      <Text type="secondary" className="text-xs">
                        +{stockAlerts.length - maxAlerts} more
                      </Text>
                    )}
                  </div>
                } 
                size="small" 
                type="inner"
              >
                {alertItems.length > 0 ? (
                  <List
                    size="small"
                    dataSource={alertItems}
                    renderItem={(item: any) => (
                      <List.Item className="px-0">
                        <List.Item.Meta
                          avatar={
                            <div className={`text-${item.color}-500`}>
                              {item.icon}
                            </div>
                          }
                          title={
                            <div className="flex justify-between items-center">
                              <Text className="text-sm">{item.title}</Text>
                                                             <Tag color={item.color}>
                                 {item.type === 'critical' ? 'OUT' : 'LOW'}
                               </Tag>
                            </div>
                          }
                          description={
                            <Text type="secondary" className="text-xs">
                              {item.description}
                            </Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-4">
                    <Text type="secondary">No stock alerts</Text>
                  </div>
                )}
              </Card>
            </Col>
          )}
        </Row>

        {/* Quick Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <div className="text-center">
                <div className="text-sm text-gray-500">Stock Health</div>
                <div className="font-medium">
                  {totalProducts > 0 
                    ? `${(((totalProducts - stockAlerts.length) / totalProducts) * 100).toFixed(0)}%`
                    : '0%'
                  }
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-sm text-gray-500">Avg. Stock Value</div>
                <div className="font-medium">
                  {totalProducts > 0 
                    ? formatCurrency(totalValue / totalProducts)
                    : formatCurrency(0)
                  }
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-sm text-gray-500">Items Tracked</div>
                <div className="font-medium">{inventoryLevels.length}</div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
} 