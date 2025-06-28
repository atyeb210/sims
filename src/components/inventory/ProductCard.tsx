'use client';

import { Card, Tag, Typography, Progress, Tooltip } from 'antd';
import { WarningOutlined, AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Product, InventoryLevel } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { Text, Title } = Typography;

interface ProductCardProps {
  product: Product;
  inventoryLevel?: InventoryLevel;
  onClick?: () => void;
  className?: string;
}

export default function ProductCard({ 
  product, 
  inventoryLevel, 
  onClick, 
  className 
}: ProductCardProps) {
  const getStockStatus = () => {
    if (!inventoryLevel) return { status: 'unknown', color: 'gray', icon: null };
    
    const { availableQuantity } = inventoryLevel;
    if (availableQuantity === 0) {
      return { 
        status: 'out_of_stock', 
        color: 'red', 
        icon: <AlertOutlined className="text-red-500" /> 
      };
    }
    if (availableQuantity <= product.reorderLevel) {
      return { 
        status: 'low_stock', 
        color: 'orange', 
        icon: <WarningOutlined className="text-orange-500" /> 
      };
    }
    return { 
      status: 'in_stock', 
      color: 'green', 
      icon: <CheckCircleOutlined className="text-green-500" /> 
    };
  };

  const stockStatus = getStockStatus();
  const stockPercentage = inventoryLevel && product.maxStockLevel 
    ? Math.min(100, (inventoryLevel.availableQuantity / product.maxStockLevel) * 100)
    : 0;

  return (
    <Card
      hoverable
      onClick={onClick}
      className={`w-full ${className}`}
      cover={
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-6xl text-gray-400">
            {product.name.charAt(0).toUpperCase()}
          </div>
        </div>
      }
      actions={[
        <div key="stock" className="text-center">
          <div className="text-sm text-gray-500">Stock</div>
          <Text strong>{inventoryLevel?.availableQuantity || 0}</Text>
        </div>,
        <div key="value" className="text-center">
          <div className="text-sm text-gray-500">Value</div>
          <Text strong>
            {formatCurrency((inventoryLevel?.availableQuantity || 0) * product.unitCost)}
          </Text>
        </div>,
        <div key="status" className="text-center">
          <div className="text-sm text-gray-500">Status</div>
          <div className="flex items-center justify-center">
            {stockStatus.icon}
          </div>
        </div>,
      ]}
    >
      <div className="p-2">
        <div className="flex justify-between items-start mb-2">
          <Title level={5} className="mb-0 flex-1">
            {product.name}
          </Title>
          <Tag color={stockStatus.color}>
            {stockStatus.status.replace('_', ' ').toUpperCase()}
          </Tag>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            SKU: {product.sku}
          </div>
          
          {product.category && (
            <Tag size="small">{product.category.name}</Tag>
          )}
          
          {product.brand && (
            <Tag size="small" color="blue">{product.brand.name}</Tag>
          )}
          
          <div className="flex justify-between text-sm">
            <span>Cost: {formatCurrency(product.unitCost)}</span>
            <span>Price: {formatCurrency(product.unitPrice)}</span>
          </div>
          
          {inventoryLevel && product.maxStockLevel && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Stock Level</span>
                <span>{stockPercentage.toFixed(0)}%</span>
              </div>
              <Progress 
                percent={stockPercentage} 
                size="small" 
                status={stockStatus.status === 'out_of_stock' ? 'exception' : 
                       stockStatus.status === 'low_stock' ? 'active' : 'success'}
              />
            </div>
          )}
          
          {inventoryLevel && inventoryLevel.availableQuantity <= product.reorderLevel && (
            <div className="bg-orange-50 p-2 rounded flex items-center text-orange-700 text-sm">
              <WarningOutlined className="mr-1" />
              Reorder needed
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 