'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Space, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Input, 
  Select, 
  Tag,
  message,
  Dropdown,
  Modal,
  TableProps
} from 'antd';
import { 
  PlusOutlined, 
  ExportOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { ProductForm } from '@/components/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';
import { Product, ProductCategory, Brand, ApiResponse } from '@/types';
import { formatCurrency } from '@/utils/formatters';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    productFilters,
    setProductFilters,
    productSortConfig,
    setProductSortConfig,
  } = useInventoryStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBrands()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data: ApiResponse<Product[]> = await response.json();
      
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data: ApiResponse<ProductCategory[]> = await response.json();
      
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data: ApiResponse<Brand[]> = await response.json();
      
      if (data.success && data.data) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data: ApiResponse<Product> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      if (data.success && data.data) {
        setProducts(prev => [...prev, data.data!]);
        message.success('Product created successfully');
        setShowProductForm(false);
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  };

  const handleEditProduct = async (productData: any) => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data: ApiResponse<Product> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      if (data.success && data.data) {
        setProducts(prev => 
          prev.map(p => p.id === editingProduct.id ? data.data! : p)
        );
        message.success('Product updated successfully');
        setShowProductForm(false);
        setEditingProduct(null);
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
          });

          const data: ApiResponse = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to delete product');
          }

          setProducts(prev => prev.filter(p => p.id !== productId));
          message.success('Product deleted successfully');
        } catch (error: any) {
          console.error('Error deleting product:', error);
          message.error(error.message || 'Failed to delete product');
        }
      },
    });
  };

  const columns: TableProps<Product>['columns'] = [
    {
      title: 'Product',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-lg font-medium text-gray-600">
              {record.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">SKU: {record.sku}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Tag>{record.category.name}</Tag>
              <Tag color="blue">{record.brand.name}</Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Season',
      dataIndex: 'season',
      key: 'season',
      width: 120,
      render: (season) => (
        <Tag color="green">
          {season.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      width: 80,
    },
    {
      title: 'Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 100,
      render: (cost) => formatCurrency(cost),
    },
    {
      title: 'Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Margin',
      key: 'margin',
      width: 100,
      render: (_, record) => {
        const margin = ((record.unitPrice - record.unitCost) / record.unitPrice * 100).toFixed(1);
        return <Tag color={parseFloat(margin) > 50 ? 'green' : 'orange'}>{margin}%</Tag>;
      },
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorderLevel',
      key: 'reorderLevel',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => {
                  setEditingProduct(record);
                  setShowProductForm(true);
                },
              },
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteProduct(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      suffix: 'items',
    },
    {
      title: 'Active Products',
      value: products.filter(p => p.isActive).length,
      suffix: 'items',
    },
    {
      title: 'Total Value',
      value: formatCurrency(
        products.reduce((sum, p) => sum + p.unitCost, 0)
      ),
    },
    {
      title: 'Avg. Margin',
      value: products.length > 0 
        ? (products.reduce((sum, p) => sum + ((p.unitPrice - p.unitCost) / p.unitPrice * 100), 0) / products.length).toFixed(1)
        : '0',
      suffix: '%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="mb-2 text-gray-900">
            Product Management
          </Title>
          <Text type="secondary" className="text-base">
            Manage your product catalog and variants
          </Text>
        </div>
        
        <Space size="middle">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchProducts} 
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<ExportOutlined />}>
            Export
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
          >
            Add Product
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={16}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters and Search */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Search
              placeholder="Search products..."
              style={{ width: 300 }}
              onSearch={(value) => setProductFilters({ search: value })}
              allowClear
            />
            <Select
              placeholder="Filter by category"
              style={{ width: 200 }}
              allowClear
              onSelect={(value) => setProductFilters({ categoryId: value })}
              onClear={() => setProductFilters({ categoryId: undefined })}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by brand"
              style={{ width: 200 }}
              allowClear
              onSelect={(value) => setProductFilters({ brandId: value })}
              onClear={() => setProductFilters({ brandId: undefined })}
            >
              {brands.map(brand => (
                <Option key={brand.id} value={brand.id}>{brand.name}</Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Products Table */}
        <Table<Product>
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            total: products.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Product Form Modal */}
      <ProductForm
        visible={showProductForm}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onSubmit={editingProduct ? handleEditProduct : handleCreateProduct}
        onCancel={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
        mode={editingProduct ? 'edit' : 'create'}
      />
    </div>
  );
} 