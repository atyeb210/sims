'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  List,
  Badge,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Dropdown,
  Tooltip,
  Avatar,
  Empty
} from 'antd';
import {
  BellOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  DeleteOutlined,
  MoreOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Alert, AlertType, AlertSeverity, Product, Location } from '@/types';
import { formatDate } from '@/utils/formatters';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AlertsPanelProps {
  alerts: Alert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAsResolved: (alertId: string, resolution: string) => void;
  onDeleteAlert: (alertId: string) => void;
  loading?: boolean;
  showFilter?: boolean;
  maxHeight?: number;
}

export default function AlertsPanel({
  alerts,
  onMarkAsRead,
  onMarkAsResolved,
  onDeleteAlert,
  loading = false,
  showFilter = true,
  maxHeight = 400
}: AlertsPanelProps) {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    type: undefined as AlertType | undefined,
    severity: undefined as AlertSeverity | undefined,
    status: 'unresolved' as 'all' | 'read' | 'unread' | 'resolved' | 'unresolved'
  });

  useEffect(() => {
    let filtered = [...alerts];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    // Filter by severity
    if (filters.severity) {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    // Filter by status
    switch (filters.status) {
      case 'read':
        filtered = filtered.filter(alert => alert.isRead && !alert.isResolved);
        break;
      case 'unread':
        filtered = filtered.filter(alert => !alert.isRead && !alert.isResolved);
        break;
      case 'resolved':
        filtered = filtered.filter(alert => alert.isResolved);
        break;
      case 'unresolved':
        filtered = filtered.filter(alert => !alert.isResolved);
        break;
      default:
        // all - no additional filtering
        break;
    }

    // Sort by severity and creation date
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAlerts(filtered);
  }, [alerts, filters]);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'high':
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
      case 'medium':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'low':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return '#ff4d4f';
      case 'high': return '#fa8c16';
      case 'medium': return '#1890ff';
      case 'low': return '#52c41a';
    }
  };

  const getTypeText = (type: AlertType) => {
    switch (type) {
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'overstock': return 'Overstock';
      case 'reorder_point': return 'Reorder Point';
      case 'expiry_warning': return 'Expiry Warning';
      case 'price_change': return 'Price Change';
      case 'forecast_deviation': return 'Forecast Deviation';
      default: return type.replace('_', ' ');
    }
  };

  const handleResolveAlert = async (values: any) => {
    if (!selectedAlert) return;

    try {
      await onMarkAsResolved(selectedAlert.id, values.resolution);
      message.success('Alert resolved successfully');
      setResolveModalVisible(false);
      setSelectedAlert(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to resolve alert');
    }
  };

  const renderAlert = (alert: Alert) => {
    const actions = [
      <Tooltip title="Mark as read" key="read">
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onMarkAsRead(alert.id)}
          disabled={alert.isRead}
        />
      </Tooltip>,
      <Tooltip title="Resolve" key="resolve">
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => {
            setSelectedAlert(alert);
            setResolveModalVisible(true);
          }}
          disabled={alert.isResolved}
        />
      </Tooltip>,
      <Dropdown
        key="more"
        menu={{
          items: [
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Delete',
              danger: true,
              onClick: () => {
                Modal.confirm({
                  title: 'Delete Alert',
                  content: 'Are you sure you want to delete this alert?',
                  onOk: () => onDeleteAlert(alert.id),
                });
              },
            },
          ],
        }}
        trigger={['click']}
      >
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </Dropdown>,
    ];

    return (
      <List.Item
        key={alert.id}
        actions={actions}
        className={`${!alert.isRead ? 'bg-blue-50' : ''} ${alert.isResolved ? 'opacity-60' : ''}`}
      >
        <List.Item.Meta
          avatar={
            <Badge dot={!alert.isRead} offset={[-2, 2]}>
              <Avatar
                icon={getSeverityIcon(alert.severity)}
                style={{
                  backgroundColor: getSeverityColor(alert.severity),
                  color: 'white'
                }}
              />
            </Badge>
          }
          title={
            <div className="flex items-center space-x-2">
              <span className={alert.isRead ? 'text-gray-700' : 'font-semibold'}>
                {alert.title}
              </span>
              <Tag color={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Tag>
              <Tag>{getTypeText(alert.type)}</Tag>
              {alert.isResolved && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Resolved
                </Tag>
              )}
            </div>
          }
          description={
            <div className="space-y-1">
              <Text type="secondary">{alert.message}</Text>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatDate(alert.createdAt)}</span>
                {alert.productId && (
                  <span>Product ID: {alert.productId}</span>
                )}
                {alert.locationId && (
                  <span>Location ID: {alert.locationId}</span>
                )}
              </div>
              {alert.isResolved && alert.resolvedAt && (
                <Text type="success" className="text-xs">
                  Resolved on {formatDate(alert.resolvedAt)}
                  {alert.resolvedBy && ` by ${alert.resolvedBy}`}
                </Text>
              )}
            </div>
          }
        />
      </List.Item>
    );
  };

  const unreadCount = alerts.filter(alert => !alert.isRead && !alert.isResolved).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.isResolved).length;

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BellOutlined />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: '#52c41a' }} />
            )}
            {criticalCount > 0 && (
              <Tag color="red">
                {criticalCount} Critical
              </Tag>
            )}
          </div>
        </div>
      }
      extra={
        showFilter && (
          <Space>
            <Select
              placeholder="Type"
              style={{ width: 120 }}
              allowClear
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <Option value="low_stock">Low Stock</Option>
              <Option value="out_of_stock">Out of Stock</Option>
              <Option value="overstock">Overstock</Option>
              <Option value="reorder_point">Reorder Point</Option>
              <Option value="expiry_warning">Expiry Warning</Option>
              <Option value="price_change">Price Change</Option>
              <Option value="forecast_deviation">Forecast Deviation</Option>
            </Select>
            
            <Select
              placeholder="Severity"
              style={{ width: 100 }}
              allowClear
              value={filters.severity}
              onChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
            >
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>

            <Select
              placeholder="Status"
              style={{ width: 120 }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="all">All</Option>
              <Option value="unread">Unread</Option>
              <Option value="read">Read</Option>
              <Option value="unresolved">Unresolved</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          </Space>
        )
      }
      className="shadow-sm"
    >
      <div style={{ maxHeight, overflowY: 'auto' }}>
        {filteredAlerts.length > 0 ? (
          <List
            dataSource={filteredAlerts}
            renderItem={renderAlert}
            loading={loading}
            size="small"
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No alerts match your filters"
          />
        )}
      </div>

      {/* Resolve Alert Modal */}
      <Modal
        title="Resolve Alert"
        open={resolveModalVisible}
        onCancel={() => {
          setResolveModalVisible(false);
          setSelectedAlert(null);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setResolveModalVisible(false);
            setSelectedAlert(null);
            form.resetFields();
          }}>
            Cancel
          </Button>,
          <Button
            key="resolve"
            type="primary"
            onClick={() => form.submit()}
          >
            Resolve Alert
          </Button>,
        ]}
      >
        {selectedAlert && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleResolveAlert}
          >
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <Text strong>{selectedAlert.title}</Text>
              <br />
              <Text type="secondary">{selectedAlert.message}</Text>
            </div>

            <Form.Item
              label="Resolution Notes"
              name="resolution"
              rules={[
                { required: true, message: 'Please provide resolution details' },
                { min: 10, message: 'Resolution must be at least 10 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe how this alert was resolved..."
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
}
