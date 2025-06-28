'use client';

import { useState } from 'react';
import { 
  Button, 
  Dropdown, 
  Modal, 
  Form, 
  InputNumber, 
  Select, 
  Input, 
  message,
  Divider,
  Space,
  Typography
} from 'antd';
import { 
  DownOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExportOutlined,
  ImportOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { Product, Location } from '@/types';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface BulkOperationsProps {
  selectedItems: string[];
  onBulkUpdate?: (updates: any) => void;
  onBulkDelete?: () => void;
  onBulkTransfer?: (locationId: string, notes?: string) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  locations?: Location[];
  disabled?: boolean;
}

export default function BulkOperations({
  selectedItems,
  onBulkUpdate,
  onBulkDelete,
  onBulkTransfer,
  onExport,
  onImport,
  locations = [],
  disabled = false
}: BulkOperationsProps) {
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();

  const hasSelection = selectedItems.length > 0;

  const handleBulkUpdate = async (values: any) => {
    try {
      await onBulkUpdate?.(values);
      message.success(`Updated ${selectedItems.length} items successfully`);
      setUpdateModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update items');
    }
  };

  const handleBulkTransfer = async (values: any) => {
    try {
      await onBulkTransfer?.(values.locationId, values.notes);
      message.success(`Transferred ${selectedItems.length} items successfully`);
      setTransferModalVisible(false);
      transferForm.resetFields();
    } catch (error) {
      message.error('Failed to transfer items');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await onBulkDelete?.();
      message.success(`Deleted ${selectedItems.length} items successfully`);
      setDeleteModalVisible(false);
    } catch (error) {
      message.error('Failed to delete items');
    }
  };

  const menuItems = [
    {
      key: 'update',
      label: 'Bulk Update Stock',
      icon: <EditOutlined />,
      onClick: () => setUpdateModalVisible(true),
      disabled: !hasSelection || !onBulkUpdate,
    },
    {
      key: 'transfer',
      label: 'Transfer to Location',
      icon: <SwapOutlined />,
      onClick: () => setTransferModalVisible(true),
      disabled: !hasSelection || !onBulkTransfer,
    },
    {
      type: 'divider',
    },
    {
      key: 'export',
      label: 'Export Selected',
      icon: <ExportOutlined />,
      onClick: onExport,
      disabled: !hasSelection || !onExport,
    },
    {
      key: 'import',
      label: 'Import Data',
      icon: <ImportOutlined />,
      onClick: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file && onImport) {
            onImport(file);
          }
        };
        input.click();
      },
      disabled: !onImport,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete Selected',
      icon: <DeleteOutlined />,
      onClick: () => setDeleteModalVisible(true),
      disabled: !hasSelection || !onBulkDelete,
      danger: true,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Text type="secondary">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </Text>
          {hasSelection && (
            <Button size="small" onClick={() => {}}>
              Clear Selection
            </Button>
          )}
        </div>

        <Space>
          <Dropdown
            menu={{ items: menuItems }}
            disabled={disabled}
            trigger={['click']}
          >
            <Button>
              Bulk Actions <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Bulk Update Modal */}
      <Modal
        title="Bulk Update Stock Levels"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBulkUpdate}
        >
          <div className="mb-4">
            <Text type="secondary">
              Updating {selectedItems.length} selected items
            </Text>
          </div>

          <Form.Item
            label="Update Type"
            name="updateType"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select update type">
              <Option value="set">Set to specific value</Option>
              <Option value="add">Add to current stock</Option>
              <Option value="subtract">Subtract from current stock</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, min: 0 }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="Enter quantity"
            />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
          >
            <TextArea
              rows={3}
              placeholder="Enter reason for stock update..."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setUpdateModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Stock
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        title="Transfer to Location"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleBulkTransfer}
        >
          <div className="mb-4">
            <Text type="secondary">
              Transferring {selectedItems.length} selected items
            </Text>
          </div>

          <Form.Item
            label="Destination Location"
            name="locationId"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select destination location">
              {locations.map(location => (
                <Option key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Transfer Notes"
            name="notes"
          >
            <TextArea
              rows={3}
              placeholder="Enter transfer notes..."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setTransferModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Transfer Items
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleBulkDelete}
        okText="Delete"
        okType="danger"
      >
        <p>
          Are you sure you want to delete {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}?
        </p>
        <p className="text-red-600 text-sm">
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
} 