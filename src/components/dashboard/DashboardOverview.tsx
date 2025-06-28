'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, List, Avatar, Tabs, Table } from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  AlertOutlined, 
  RiseOutlined,
  WarningOutlined,
  StockOutlined
} from '@ant-design/icons';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { MetricCard } from '@/components/ui/MetricCard';
import { useInventoryStore } from '@/stores/inventoryStore';
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data - replace with actual API calls
const mockMetrics = {
  totalProducts: 1247,
  totalInventoryValue: 284750,
  lowStockItems: 23,
  outOfStockItems: 7,
};

const mockSalesData = [
  { date: '2024-01-01', sales: 45000 },
  { date: '2024-01-02', sales: 52000 },
  { date: '2024-01-03', sales: 48000 },
  { date: '2024-01-04', sales: 61000 },
  { date: '2024-01-05', sales: 55000 },
  { date: '2024-01-06', sales: 67000 },
  { date: '2024-01-07', sales: 58000 },
];

const mockInventoryTrend = [
  { month: 'Jan', value: 280000, items: 1200 },
  { month: 'Feb', value: 295000, items: 1180 },
  { month: 'Mar', value: 310000, items: 1220 },
  { month: 'Apr', value: 285000, items: 1190 },
  { month: 'May', value: 320000, items: 1250 },
  { month: 'Jun', value: 305000, items: 1230 },
];

const mockTopProducts = [
  { name: 'Denim Jacket', category: 'Outerwear', sold: 234, revenue: 28080, change: 12.5 },
  { name: 'Cotton T-Shirt', category: 'Basics', sold: 189, revenue: 18900, change: 8.3 },
  { name: 'Skinny Jeans', category: 'Bottoms', sold: 156, revenue: 23400, change: -2.1 },
  { name: 'Hoodie', category: 'Outerwear', sold: 143, revenue: 21450, change: 15.7 },
  { name: 'Sneakers', category: 'Footwear', sold: 127, revenue: 19050, change: 6.2 },
];

const mockCategoryData = [
  { name: 'Outerwear', value: 35, color: '#3b82f6' },
  { name: 'Bottoms', value: 25, color: '#10b981' },
  { name: 'Tops', value: 20, color: '#f59e0b' },
  { name: 'Footwear', value: 15, color: '#ef4444' },
  { name: 'Accessories', value: 5, color: '#8b5cf6' },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'stock_update',
    message: 'Stock updated for Denim Jacket (SKU: DJ001)',
    user: 'John Smith',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    icon: <StockOutlined className="text-blue-500" />,
  },
  {
    id: '2',
    type: 'low_stock',
    message: 'Low stock alert for Cotton T-Shirt (SKU: CT002)',
    user: 'System',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    icon: <WarningOutlined className="text-amber-500" />,
  },
  {
    id: '3',
    type: 'reorder',
    message: 'Reorder point reached for Hoodie (SKU: HD003)',
    user: 'System',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    icon: <AlertOutlined className="text-red-500" />,
  },
  {
    id: '4',
    type: 'forecast',
    message: 'Demand forecast updated for Summer Collection',
    user: 'ML System',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    icon: <RiseOutlined className="text-green-500" />,
  },
];

export const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  const { alerts } = useInventoryStore();

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const topProductsColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">{record.category}</Text>
        </div>
      ),
    },
    {
      title: 'Units Sold',
      dataIndex: 'sold',
      key: 'sold',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (value: number) => (
        <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
          {value >= 0 ? '+' : ''}{value.toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-2">Dashboard Overview</Title>
          <Text type="secondary">
            Welcome back! Here's what's happening with your inventory today.
          </Text>
        </div>
      </div>

      {/* Key Metrics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Total Products"
            value={mockMetrics.totalProducts}
            format="number"
            prefix={<ShoppingOutlined />}
            change={{ value: 5.2, type: 'increase', period: 'vs last month' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Inventory Value"
            value={mockMetrics.totalInventoryValue}
            format="currency"
            prefix={<DollarOutlined />}
            change={{ value: 8.4, type: 'increase', period: 'vs last month' }}
            color="success"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Low Stock Items"
            value={mockMetrics.lowStockItems}
            format="number"
            prefix={<WarningOutlined />}
            change={{ value: 2, type: 'decrease', period: 'vs yesterday' }}
            color="warning"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard
            title="Out of Stock"
            value={mockMetrics.outOfStockItems}
            format="number"
            prefix={<AlertOutlined />}
            change={{ value: 1, type: 'increase', period: 'vs yesterday' }}
            color="danger"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Sales & Inventory Trends" 
            loading={loading}
            className="h-96"
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab} className="h-full">
              <TabPane tab="Sales Trend" key="sales">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={mockSalesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabPane>
              <TabPane tab="Inventory Value" key="inventory">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={mockInventoryTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title="Inventory by Category" 
            loading={loading}
            className="h-96"
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {mockCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card 
            title="Top Selling Products" 
            loading={loading}
          >
            <Table
              dataSource={mockTopProducts}
              columns={topProductsColumns}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card 
            title="Recent Activity" 
            loading={loading}
            className="h-full"
          >
            <List
              dataSource={mockRecentActivity}
              renderItem={(item) => (
                <List.Item className="border-none px-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={item.icon} 
                        size="small" 
                        className="bg-transparent border-none"
                      />
                    }
                    title={
                      <Text className="text-sm font-medium">
                        {item.message}
                      </Text>
                    }
                    description={
                      <div className="flex items-center space-x-2 text-xs">
                        <Text type="secondary">{item.user}</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">
                          {formatRelativeTime(item.timestamp)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
