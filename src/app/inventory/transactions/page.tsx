'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Table, 
  Tag, 
  DatePicker, 
  Select,
  Row,
  Col,
  Statistic,
  message
} from 'antd';
import { 
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Transaction {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  productName: string;
  sku: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    type: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'IN',
      productName: 'Cotton T-Shirt',
      sku: 'TSH-001',
      quantity: 100,
      toLocation: 'Main Warehouse',
      reason: 'Purchase Order #1234',
      createdBy: 'John Doe',
      createdAt: '2024-01-15T10:30:00Z',
      notes: 'Regular shipment from supplier'
    },
    {
      id: '2',
      type: 'OUT',
      productName: 'Denim Jeans',
      sku: 'JNS-002',
      quantity: -25,
      fromLocation: 'Main Warehouse',
      reason: 'Sale Order #5678',
      createdBy: 'Jane Smith',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      type: 'TRANSFER',
      productName: 'Sneakers',
      sku: 'SNK-003',
      quantity: 10,
      fromLocation: 'Main Warehouse',
      toLocation: 'NYC Store',
      reason: 'Store Replenishment',
      createdBy: 'Mike Johnson',
      createdAt: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      type: 'ADJUSTMENT',
      productName: 'Leather Jacket',
      sku: 'JKT-004',
      quantity: -2,
      fromLocation: 'LA Store',
      reason: 'Damaged Goods',
      createdBy: 'Sarah Wilson',
      createdAt: '2024-01-12T16:45:00Z',
      notes: 'Water damage during storage'
    }
  ];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(t => {
        const transactionDate = dayjs(t.createdAt);
        return transactionDate.isAfter(start) && transactionDate.isBefore(end);
      });
    }

    setFilteredTransactions(filtered);
  }, [filters, transactions]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'green';
      case 'OUT': return 'red';
      case 'TRANSFER': return 'blue';
      case 'ADJUSTMENT': return 'orange';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDownOutlined />;
      case 'OUT': return <ArrowUpOutlined />;
      case 'TRANSFER': return <ArrowUpOutlined />;
      case 'ADJUSTMENT': return <FilterOutlined />;
      default: return null;
    }
  };

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
      sorter: (a: Transaction, b: Transaction) => 
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
          {type}
        </Tag>
      ),
      filters: [
        { text: 'Stock In', value: 'IN' },
        { text: 'Stock Out', value: 'OUT' },
        { text: 'Transfer', value: 'TRANSFER' },
        { text: 'Adjustment', value: 'ADJUSTMENT' },
      ],
      onFilter: (value: any, record: Transaction) => record.type === value,
    },
    {
      title: 'Product',
      key: 'product',
      render: (record: Transaction) => (
        <div>
          <div className="font-medium">{record.productName}</div>
          <div className="text-gray-500 text-sm">SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <span className={quantity > 0 ? 'text-green-600' : 'text-red-600'}>
          {quantity > 0 ? '+' : ''}{quantity}
        </span>
      ),
      sorter: (a: Transaction, b: Transaction) => a.quantity - b.quantity,
    },
    {
      title: 'Location',
      key: 'location',
      render: (record: Transaction) => (
        <div>
          {record.type === 'TRANSFER' ? (
            <div>
              <div className="text-sm">From: {record.fromLocation}</div>
              <div className="text-sm">To: {record.toLocation}</div>
            </div>
          ) : (
            <span>{record.fromLocation || record.toLocation}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-',
    },
  ];

  // Calculate statistics
  const totalIn = filteredTransactions
    .filter(t => t.type === 'IN')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const totalOut = filteredTransactions
    .filter(t => t.type === 'OUT')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

  const totalTransfers = filteredTransactions.filter(t => t.type === 'TRANSFER').length;
  const totalAdjustments = filteredTransactions.filter(t => t.type === 'ADJUSTMENT').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="mb-2 text-gray-900">
            Inventory Transactions
          </Title>
          <Text type="secondary" className="text-base">
            Track all inventory movements and adjustments
          </Text>
        </div>
        
        <Space size="middle">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchTransactions} 
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<ExportOutlined />}>
            Export
          </Button>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            New Transaction
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="Total In" 
              value={totalIn} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="Total Out" 
              value={totalOut} 
              valueStyle={{ color: '#f5222d' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="Transfers" 
              value={totalTransfers} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="Adjustments" 
              value={totalAdjustments} 
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <Space>
            <Text strong>Filters:</Text>
            <Select
              placeholder="Transaction Type"
              style={{ width: 150 }}
              allowClear
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <Option value="IN">Stock In</Option>
              <Option value="OUT">Stock Out</Option>
              <Option value="TRANSFER">Transfer</Option>
              <Option value="ADJUSTMENT">Adjustment</Option>
            </Select>
            
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ 
                ...prev, 
                dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | undefined 
              }))}
            />

            <Button
              onClick={() => setFilters({ type: undefined, dateRange: undefined })}
            >
              Clear Filters
            </Button>
          </Space>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
                         showTotal: (total: number, range: [number, number]) => 
               `${range[0]}-${range[1]} of ${total} transactions`,
          }}
        />
      </Card>
    </div>
  );
} 