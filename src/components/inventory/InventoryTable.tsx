'use client';

import { useState } from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Tooltip, 
  Progress, 
  Dropdown,
  Typography,
  Avatar
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  MoreOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { InventoryLevelWithDetails, Product } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const { Text } = Typography;

interface InventoryTableProps {
  data: InventoryLevelWithDetails[];
  loading?: boolean;
  showActions?: boolean;
  showSelection?: boolean;
  onEdit?: (record: InventoryLevelWithDetails) => void;
  onDelete?: (record: InventoryLevelWithDetails) => void;
  onView?: (record: InventoryLevelWithDetails) => void;
  onBulkAction?: (action: string, selectedRows: InventoryLevelWithDetails[]) => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: InventoryLevelWithDetails[]) => void;
  pagination?: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
}

export default function InventoryTable({
  data,
  loading = false,
  showActions = true,
  showSelection = false,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  selectedRowKeys = [],
  onSelectionChange,
  pagination,
  onChange
}: InventoryTableProps) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const getStockStatus = (level: InventoryLevelWithDetails) => {
    const { availableQuantity, product } = level;
    if (availableQuantity === 0) return { status: 'out_of_stock', color: 'red', text: 'Out of Stock' };
    if (availableQuantity <= product.reorderLevel) return { status: 'low_stock', color: 'orange', text: 'Low Stock' };
    return { status: 'in_stock', color: 'green', text: 'In Stock' };
  };

  const getStockPercentage = (level: InventoryLevelWithDetails) => {
    const { availableQuantity, product } = level;
    if (!product.maxStockLevel) return 0;
    return Math.min(100, (availableQuantity / product.maxStockLevel) * 100);
  };

  const actionItems = (record: InventoryLevelWithDetails) => [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
      onClick: () => onView?.(record),
    },
    {
      key: 'edit',
      label: 'Edit Stock',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(record),
    },
    {
      key: 'delete',
      label: 'Remove',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete?.(record),
    },
  ];

  const columns = [
    {
      title: 'Product',
      key: 'product',
      width: 300,
      render: (record: InventoryLevel) => {
        const product = record.product as Product;
        const stockStatus = getStockStatus(record);
        
        return (
          <div className="flex items-center space-x-3">
            <Avatar 
              shape="square" 
              size={48}
              src={product.attributes?.imageUrl}
              style={{ backgroundColor: '#f0f0f0' }}
            >
              {product.name?.charAt(0)}
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Tag size="small" color={stockStatus.color}>
                  {stockStatus.text}
                </Tag>
                {product.category && (
                  <Tag size="small">{product.category.name}</Tag>
                )}
              </div>
            </div>
          </div>
        );
      },
      sorter: (a: InventoryLevelWithDetails, b: InventoryLevelWithDetails) => 
        a.product.name.localeCompare(b.product.name),
    },
    {
      title: 'Location',
      dataIndex: ['location', 'name'],
      key: 'location',
      width: 150,
      render: (text: string, record: InventoryLevelWithDetails) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.location.type}</div>
        </div>
      ),
      sorter: (a: InventoryLevelWithDetails, b: InventoryLevelWithDetails) => 
        a.location.name.localeCompare(b.location.name),
    },
    {
      title: 'Stock Level',
      key: 'stockLevel',
      width: 200,
      render: (record: InventoryLevel) => {
        const percentage = getStockPercentage(record);
        const stockStatus = getStockStatus(record);
        
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text strong>{record.availableQuantity}</Text>
                             <Text type="secondary" className="text-xs">
                 / {record.product.maxStockLevel || '∞'}
               </Text>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              status={stockStatus.status === 'out_of_stock' ? 'exception' : 
                     stockStatus.status === 'low_stock' ? 'active' : 'success'}
              showInfo={false}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Reserved: {record.reservedQuantity}</span>
              <span>Total: {record.quantity}</span>
            </div>
          </div>
        );
      },
      sorter: (a: InventoryLevelWithDetails, b: InventoryLevelWithDetails) => 
        a.availableQuantity - b.availableQuantity,
    },
    {
      title: 'Reorder Level',
      key: 'reorderLevel',
      width: 120,
      render: (record: InventoryLevel) => {
        const product = record.product as Product;
        const needsReorder = record.availableQuantity <= product.reorderLevel;
        
        return (
          <div className="text-center">
            <div className={`font-medium ${needsReorder ? 'text-red-600' : 'text-gray-900'}`}>
              {product.reorderLevel}
            </div>
            {needsReorder && (
              <div className="flex items-center justify-center mt-1">
                <WarningOutlined className="text-red-500 text-xs mr-1" />
                <Text type="danger" className="text-xs">Reorder</Text>
              </div>
            )}
          </div>
        );
      },
      sorter: (a: InventoryLevelWithDetails, b: InventoryLevelWithDetails) => 
        a.product.reorderLevel - b.product.reorderLevel,
    },
    {
      title: 'Value',
      key: 'value',
      width: 120,
      render: (record: InventoryLevel) => {
        const product = record.product as Product;
        const totalValue = record.availableQuantity * product.unitCost;
        
        return (
          <div className="text-right">
            <div className="font-medium">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-gray-500">
              @{formatCurrency(product.unitCost)}
            </div>
          </div>
        );
      },
      sorter: (a: InventoryLevel, b: InventoryLevel) => {
        const aValue = a.availableQuantity * (a.product as Product).unitCost;
        const bValue = b.availableQuantity * (b.product as Product).unitCost;
        return aValue - bValue;
      },
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (date: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(new Date(date))}
        </div>
      ),
      sorter: (a: InventoryLevel, b: InventoryLevel) => 
        new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
    },
  ];

  if (showActions) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (record: InventoryLevel) => (
        <Dropdown
          menu={{ 
            items: actionItems(record).map(item => ({
              ...item,
              onClick: () => item.onClick()
            }))
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    });
  }

  const rowSelection = showSelection ? {
    selectedRowKeys,
    onChange: onSelectionChange,
    getCheckboxProps: (record: InventoryLevel) => ({
      disabled: false,
      name: record.id,
    }),
  } : undefined;

  const expandedRowRender = (record: InventoryLevel) => {
    const product = record.product as Product;
    
    return (
      <div className="bg-gray-50 p-4 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium mb-2">Product Details</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Brand:</span> {product.brand?.name || 'N/A'}</div>
              <div><span className="text-gray-500">Season:</span> {product.season}</div>
              <div><span className="text-gray-500">Year:</span> {product.year}</div>
              {product.attributes?.color && (
                <div><span className="text-gray-500">Color:</span> {product.attributes.color}</div>
              )}
              {product.attributes?.size && (
                <div><span className="text-gray-500">Size:</span> {product.attributes.size}</div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Pricing</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Cost:</span> {formatCurrency(product.unitCost)}</div>
              <div><span className="text-gray-500">Price:</span> {formatCurrency(product.unitPrice)}</div>
              <div><span className="text-gray-500">Margin:</span> {((product.unitPrice - product.unitCost) / product.unitPrice * 100).toFixed(1)}%</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Stock Info</h4>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Min Level:</span> {product.reorderLevel}</div>
              <div><span className="text-gray-500">Max Level:</span> {product.maxStockLevel || 'N/A'}</div>
              <div><span className="text-gray-500">Days of Stock:</span> {
                record.availableQuantity > 0 && product.reorderLevel > 0 
                  ? Math.floor(record.availableQuantity / (product.reorderLevel / 30))
                  : 'N/A'
              } days</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={pagination}
      onChange={onChange}
      expandable={{
        expandedRowRender,
        expandedRowKeys,
        onExpandedRowsChange: setExpandedRowKeys,
        expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <Button
              type="link"
              size="small"
              onClick={e => onExpand(record, e)}
              className="p-0 h-auto"
            >
              Less
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={e => onExpand(record, e)}
              className="p-0 h-auto"
            >
              More
            </Button>
          ),
      }}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
} 