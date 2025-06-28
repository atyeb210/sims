'use client';

import { Progress, Tag, Tooltip, Typography } from 'antd';
import { WarningOutlined, AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StockLevelIndicatorProps {
  currentStock: number;
  minStock: number;
  maxStock?: number;
  reservedStock?: number;
  showDetails?: boolean;
  size?: 'small' | 'default' | 'large';
}

export default function StockLevelIndicator({
  currentStock,
  minStock,
  maxStock,
  reservedStock = 0,
  showDetails = false,
  size = 'default'
}: StockLevelIndicatorProps) {
  const availableStock = Math.max(0, currentStock - reservedStock);
  
  const getStockStatus = () => {
    if (availableStock === 0) {
      return {
        status: 'critical',
        color: 'red',
        text: 'Out of Stock',
        icon: <AlertOutlined />,
        percent: 0
      };
    }
    
    if (availableStock <= minStock) {
      return {
        status: 'warning',
        color: 'orange',
        text: 'Low Stock',
        icon: <WarningOutlined />,
        percent: maxStock ? (availableStock / maxStock) * 100 : 30
      };
    }
    
    return {
      status: 'normal',
      color: 'green',
      text: 'In Stock',
      icon: <CheckCircleOutlined />,
      percent: maxStock ? Math.min(100, (availableStock / maxStock) * 100) : 80
    };
  };

  const stockStatus = getStockStatus();

  const renderBasicIndicator = () => (
    <div className="flex items-center space-x-2">
      <Tag color={stockStatus.color} icon={stockStatus.icon}>
        {stockStatus.text}
      </Tag>
      <Text strong>{availableStock}</Text>
    </div>
  );

  const renderDetailedIndicator = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`text-${stockStatus.color}-600`}>
            {stockStatus.icon}
          </span>
          <Text strong>{availableStock}</Text>
          {maxStock && (
            <Text type="secondary" className="text-sm">
              / {maxStock}
            </Text>
          )}
        </div>
                 <Tag color={stockStatus.color}>
           {stockStatus.text}
         </Tag>
      </div>
      
             {maxStock && (
         <Progress
           percent={stockStatus.percent}
           size={size === 'large' ? 'default' : size}
           status={stockStatus.status === 'critical' ? 'exception' : 
                  stockStatus.status === 'warning' ? 'active' : 'success'}
           format={() => `${stockStatus.percent.toFixed(0)}%`}
         />
       )}
      
      {showDetails && (
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
          <div>
            <div>Total: {currentStock}</div>
          </div>
          <div>
            <div>Reserved: {reservedStock}</div>
          </div>
          <div>
            <div>Min Level: {minStock}</div>
          </div>
        </div>
      )}
      
      {availableStock <= minStock && (
        <div className="bg-orange-50 p-2 rounded text-orange-700 text-sm flex items-center">
          <WarningOutlined className="mr-1" />
          {availableStock === 0 ? 'Urgent restock needed' : 'Reorder recommended'}
        </div>
      )}
    </div>
  );

  if (!showDetails) {
    return (
      <Tooltip title={`Available: ${availableStock}, Reserved: ${reservedStock}, Min: ${minStock}`}>
        {renderBasicIndicator()}
      </Tooltip>
    );
  }

  return renderDetailedIndicator();
} 