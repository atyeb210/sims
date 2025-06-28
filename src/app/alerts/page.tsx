'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Row, 
  Col,
  Statistic,
  Badge,
  Alert as AntAlert
} from 'antd';
import { 
  AlertOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Alert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY' | 'FORECAST' | 'SYSTEM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  locationId?: string;
  locationName?: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
}

export default function AlertsPage() {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Mock data - in real implementation would fetch from API
    setAlerts([
      {
        id: '1',
        type: 'LOW_STOCK',
        severity: 'HIGH',
        title: 'Low Stock Alert',
        message: 'Cotton T-Shirt (Blue) stock is below reorder level',
        productName: 'Cotton T-Shirt (Blue)',
        locationName: 'Main Warehouse',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '2',
        type: 'OUT_OF_STOCK',
        severity: 'CRITICAL',
        title: 'Out of Stock',
        message: 'Leather Jacket (Black) is completely out of stock',
        productName: 'Leather Jacket (Black)',
        locationName: 'NYC Store',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        id: '3',
        type: 'FORECAST',
        severity: 'MEDIUM',
        title: 'Demand Forecast Alert',
        message: 'Predicted high demand for Winter Coats in next 7 days',
        productName: 'Winter Coats',
        locationName: 'All Locations',
        isRead: true,
        isResolved: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      }
    ]);
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors = {
      LOW: 'blue',
      MEDIUM: 'orange',
      HIGH: 'red',
      CRITICAL: 'red'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      LOW_STOCK: <WarningOutlined />,
      OUT_OF_STOCK: <ExclamationCircleOutlined />,
      EXPIRY: <InfoCircleOutlined />,
      FORECAST: <AlertOutlined />,
      SYSTEM: <CheckCircleOutlined />
    };
    return icons[type as keyof typeof icons] || <AlertOutlined />;
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag icon={getTypeIcon(type)} color="processing">
          {type.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity}
        </Tag>
      ),
    },
    {
      title: 'Alert',
      key: 'alert',
      render: (record: Alert) => (
        <div>
          <Text strong>{record.title}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.message}
          </Text>
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => name || 'N/A',
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => dayjs(date).format('MMM D, YYYY HH:mm'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Alert) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isRead ? 'green' : 'red'}>
            {record.isRead ? 'Read' : 'Unread'}
          </Tag>
          <Tag color={record.isResolved ? 'green' : 'orange'}>
            {record.isResolved ? 'Resolved' : 'Active'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Alert) => (
        <Space>
          {!record.isRead && (
            <Button size="small">Mark Read</Button>
          )}
          {!record.isResolved && (
            <Button size="small" type="primary">Resolve</Button>
          )}
        </Space>
      ),
    },
  ];

  const alertCounts = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    critical: alerts.filter(a => a.severity === 'CRITICAL').length,
    active: alerts.filter(a => !a.isResolved).length
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-red-100/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <Title level={2} className="mb-0 text-slate-800 font-bold text-3xl tracking-tight">
              Alerts & Notifications
            </Title>
            <Text className="text-slate-600 text-lg font-medium leading-relaxed">
              Monitor system alerts and inventory notifications
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => setLoading(true)}
              loading={loading}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Refresh
            </Button>
            <Button
              size="large"
              className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-none text-white rounded-xl shadow-lg font-medium hover:shadow-xl transition-all duration-200"
            >
              Mark All Read
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <Row gutter={[32, 32]}>
        <Col xs={12} sm={6}>
          <Card className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <Statistic 
                title="Total Alerts" 
                value={alertCounts.total} 
                valueStyle={{ color: '#2563eb', fontSize: '36px', fontWeight: '700' }}
                prefix={<AlertOutlined className="text-blue-500 text-xl" />}
              />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <Statistic 
                title="Unread" 
                value={alertCounts.unread} 
                valueStyle={{ color: '#d97706', fontSize: '36px', fontWeight: '700' }}
                prefix={<Badge dot status="warning" />}
              />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <Statistic 
                title="Critical" 
                value={alertCounts.critical} 
                valueStyle={{ color: '#dc2626', fontSize: '36px', fontWeight: '700' }}
                prefix={<ExclamationCircleOutlined className="text-red-500 text-xl" />}
              />
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <Statistic 
                title="Active" 
                value={alertCounts.active} 
                valueStyle={{ color: '#16a34a', fontSize: '36px', fontWeight: '700' }}
                prefix={<CheckCircleOutlined className="text-green-500 text-xl" />}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Important Alerts */}
      {alertCounts.critical > 0 && (
        <div className="my-8">
          <AntAlert
            type="error"
            message="Critical Alerts Detected"
            description={`You have ${alertCounts.critical} critical alert(s) that require immediate attention.`}
            showIcon
            className="p-6 rounded-2xl border border-red-200/50 bg-red-50/80 shadow-lg"
            action={
              <Button 
                danger
                size="large"
                className="h-10 px-6 rounded-xl font-medium shadow-md"
              >
                View Critical
              </Button>
            }
          />
        </div>
      )}

      {/* Alerts Table */}
      <Card 
        title={
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertOutlined className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-slate-800">{`All Alerts (${alerts.length})`}</span>
          </div>
        }
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50"
      >
        <div className="p-2">
          <Table
            columns={columns}
            dataSource={alerts}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} alerts`,
            }}
            rowClassName={(record) => 
              !record.isRead ? 'bg-blue-50/50' : ''
            }
            className="[&_.ant-table-thead_th]:bg-slate-50/80 [&_.ant-table-thead_th]:font-semibold [&_.ant-table-tbody_tr:hover]:bg-red-50/50"
          />
        </div>
      </Card>
    </>
  );
} 