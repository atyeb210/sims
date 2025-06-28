'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Space,
  Typography,
  message,
  Card,
  Tag,
  Tooltip,
  Upload,
  Switch
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Product, ProductCategory, Brand, Season } from '@/types';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface ProductFormProps {
  visible: boolean;
  product?: Product | null;
  categories: ProductCategory[];
  brands: Brand[];
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export default function ProductForm({
  visible,
  product,
  categories,
  brands,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}: ProductFormProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && product) {
        form.setFieldsValue({
          sku: product.sku,
          parentSku: product.parentSku,
          name: product.name,
          description: product.description,
          categoryId: product.category?.id,
          brandId: product.brand?.id,
          season: product.season,
          year: product.year,
          unitCost: product.unitCost,
          unitPrice: product.unitPrice,
          reorderLevel: product.reorderLevel,
          maxStockLevel: product.maxStockLevel,
          isActive: product.isActive,
          // Attributes
          color: product.attributes?.color,
          size: product.attributes?.size,
          material: product.attributes?.material,
          style: product.attributes?.style,
          gender: product.attributes?.gender,
          ageGroup: product.attributes?.ageGroup,
        });
      } else {
        form.resetFields();
        // Set default values for new product
        form.setFieldsValue({
          season: 'ALL_SEASON',
          year: new Date().getFullYear(),
          reorderLevel: 10,
          isActive: true,
        });
      }
    }
  }, [visible, product, mode, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      // Prepare the product data
      const productData = {
        sku: values.sku,
        parentSku: values.parentSku,
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        brandId: values.brandId,
        season: values.season,
        year: values.year,
        unitCost: values.unitCost,
        unitPrice: values.unitPrice,
        reorderLevel: values.reorderLevel,
        maxStockLevel: values.maxStockLevel,
        isActive: values.isActive,
        attributes: {
          color: values.color,
          size: values.size,
          material: values.material,
          style: values.style,
          gender: values.gender,
          ageGroup: values.ageGroup,
        },
      };

      await onSubmit(productData);
      
      message.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
      form.resetFields();
      onCancel();
    } catch (error: any) {
      message.error(error.message || `Failed to ${mode} product`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const generateSKU = () => {
    const category = categories.find(c => c.id === form.getFieldValue('categoryId'));
    const brand = brands.find(b => b.id === form.getFieldValue('brandId'));
    const year = form.getFieldValue('year') || new Date().getFullYear();
    
    if (category && brand) {
      const categoryCode = category.name.substring(0, 3).toUpperCase();
      const brandCode = brand.name.substring(0, 3).toUpperCase();
      const yearCode = year.toString().slice(-2);
      const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
      
      const generatedSKU = `${brandCode}-${categoryCode}-${yearCode}-${randomCode}`;
      form.setFieldValue('sku', generatedSKU);
    }
  };

  const calculateMargin = () => {
    const unitCost = form.getFieldValue('unitCost');
    const unitPrice = form.getFieldValue('unitPrice');
    
    if (unitCost && unitPrice && unitPrice > 0) {
      const margin = ((unitPrice - unitCost) / unitPrice * 100).toFixed(1);
      return `${margin}%`;
    }
    return '0%';
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <Title level={4} className="mb-0">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </Title>
          {product && (
            <Tag color="blue">{product.sku}</Tag>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting || loading}
          onClick={() => form.submit()}
        >
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        scrollToFirstError
      >
        {/* Basic Information */}
        <Card title="Basic Information" size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter product name' },
                  { min: 1, max: 255, message: 'Name must be between 1-255 characters' }
                ]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <div className="flex items-center space-x-1">
                    <span>SKU</span>
                    <Tooltip title="Click generate to auto-create SKU">
                      <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={generateSKU}
                      >
                        Generate
                      </Button>
                    </Tooltip>
                  </div>
                }
                name="sku"
                rules={[
                  { required: true, message: 'Please enter SKU' },
                  { min: 1, max: 100, message: 'SKU must be between 1-100 characters' }
                ]}
              >
                <Input placeholder="Enter SKU" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="categoryId"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category" showSearch optionFilterProp="children">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Brand"
                name="brandId"
                rules={[{ required: true, message: 'Please select brand' }]}
              >
                <Select placeholder="Select brand" showSearch optionFilterProp="children">
                  {brands.map(brand => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item
            label="Parent SKU"
            name="parentSku"
            help="For product variants (size/color variations of the same base product)"
          >
            <Input placeholder="Enter parent SKU for variants" />
          </Form.Item>
        </Card>

        {/* Apparel Attributes */}
        <Card title="Apparel Attributes" size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Color" name="color">
                <Select placeholder="Select color" allowClear>
                  <Option value="Black">Black</Option>
                  <Option value="White">White</Option>
                  <Option value="Red">Red</Option>
                  <Option value="Blue">Blue</Option>
                  <Option value="Green">Green</Option>
                  <Option value="Yellow">Yellow</Option>
                  <Option value="Purple">Purple</Option>
                  <Option value="Pink">Pink</Option>
                  <Option value="Orange">Orange</Option>
                  <Option value="Brown">Brown</Option>
                  <Option value="Gray">Gray</Option>
                  <Option value="Navy">Navy</Option>
                  <Option value="Beige">Beige</Option>
                  <Option value="Multicolor">Multicolor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Size" name="size">
                <Select placeholder="Select size" allowClear>
                  <Option value="XS">XS</Option>
                  <Option value="S">S</Option>
                  <Option value="M">M</Option>
                  <Option value="L">L</Option>
                  <Option value="XL">XL</Option>
                  <Option value="XXL">XXL</Option>
                  <Option value="XXXL">XXXL</Option>
                  <Option value="One Size">One Size</Option>
                  <Option value="6">6</Option>
                  <Option value="7">7</Option>
                  <Option value="8">8</Option>
                  <Option value="9">9</Option>
                  <Option value="10">10</Option>
                  <Option value="11">11</Option>
                  <Option value="12">12</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Material" name="material">
                <Select placeholder="Select material" allowClear>
                  <Option value="Cotton">Cotton</Option>
                  <Option value="Polyester">Polyester</Option>
                  <Option value="Wool">Wool</Option>
                  <Option value="Silk">Silk</Option>
                  <Option value="Linen">Linen</Option>
                  <Option value="Denim">Denim</Option>
                  <Option value="Leather">Leather</Option>
                  <Option value="Synthetic">Synthetic</Option>
                  <Option value="Blend">Blend</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Style" name="style">
                <Input placeholder="e.g., Casual, Formal, Sport" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select target gender" allowClear>
                  <Option value="men">Men</Option>
                  <Option value="women">Women</Option>
                  <Option value="unisex">Unisex</Option>
                  <Option value="kids">Kids</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Age Group" name="ageGroup">
                <Select placeholder="Select age group" allowClear>
                  <Option value="adult">Adult</Option>
                  <Option value="teen">Teen</Option>
                  <Option value="child">Child</Option>
                  <Option value="infant">Infant</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Season and Year */}
        <Card title="Collection Information" size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Season"
                name="season"
                rules={[{ required: true, message: 'Please select season' }]}
              >
                <Select placeholder="Select season">
                  <Option value="SPRING_SUMMER">Spring/Summer</Option>
                  <Option value="FALL_WINTER">Fall/Winter</Option>
                  <Option value="RESORT">Resort</Option>
                  <Option value="PRE_FALL">Pre-Fall</Option>
                  <Option value="ALL_SEASON">All Season</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Year"
                name="year"
                rules={[
                  { required: true, message: 'Please enter year' },
                  { type: 'number', min: 2000, max: 2100, message: 'Year must be between 2000-2100' }
                ]}
              >
                <InputNumber
                  min={2000}
                  max={2100}
                  style={{ width: '100%' }}
                  placeholder="Enter collection year"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Pricing Information */}
        <Card title="Pricing & Inventory" size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Unit Cost"
                name="unitCost"
                rules={[
                  { required: true, message: 'Please enter unit cost' },
                  { type: 'number', min: 0.01, message: 'Cost must be greater than 0' }
                ]}
              >
                <InputNumber
                  min={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Unit Price"
                name="unitPrice"
                rules={[
                  { required: true, message: 'Please enter unit price' },
                  { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
                ]}
              >
                <InputNumber
                  min={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <div className="flex items-center space-x-2 pt-8">
                <Text strong>Margin:</Text>
                <Tag color="green">{calculateMargin()}</Tag>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <div className="flex items-center space-x-1">
                    <span>Reorder Level</span>
                    <Tooltip title="Minimum stock level before reordering">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                }
                name="reorderLevel"
                rules={[
                  { required: true, message: 'Please enter reorder level' },
                  { type: 'number', min: 0, message: 'Reorder level must be 0 or greater' }
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Enter reorder level"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <div className="flex items-center space-x-1">
                    <span>Max Stock Level</span>
                    <Tooltip title="Maximum recommended stock level">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </div>
                }
                name="maxStockLevel"
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Enter max stock level (optional)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Active"
            name="isActive"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
}
