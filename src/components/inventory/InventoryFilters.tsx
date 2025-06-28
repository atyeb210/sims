'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Select, 
  Button, 
  Space, 
  Slider, 
  Switch, 
  Tooltip, 
  Divider,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ClearOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { InventoryFilters as InventoryFiltersType, ProductCategory, Brand, Location } from '@/types';

const { Search } = Input;
const { Option } = Select;

interface InventoryFiltersProps {
  filters: InventoryFiltersType;
  onFiltersChange: (filters: Partial<InventoryFiltersType>) => void;
  onClearFilters: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  showAdvanced?: boolean;
  categories?: ProductCategory[];
  brands?: Brand[];
  locations?: Location[];
  className?: string;
}

export default function InventoryFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onRefresh,
  loading = false,
  showAdvanced = true,
  categories = [],
  brands = [],
  locations = [],
  className
}: InventoryFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Stock status options
  const stockStatusOptions = [
    { label: 'In Stock', value: 'in_stock', color: 'green' },
    { label: 'Low Stock', value: 'low_stock', color: 'orange' },
    { label: 'Out of Stock', value: 'out_of_stock', color: 'red' }
  ];

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.categoryId ||
      filters.brandId ||
      filters.locationId ||
      filters.lowStock ||
      filters.outOfStock
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (filters.brandId) count++;
    if (filters.locationId) count++;
    if (filters.lowStock) count++;
    if (filters.outOfStock) count++;
    return count;
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleSelectChange = (field: keyof InventoryFiltersType, value: any) => {
    onFiltersChange({ [field]: value });
  };

  const handleSwitchChange = (field: keyof InventoryFiltersType, checked: boolean) => {
    onFiltersChange({ [field]: checked });
  };

  const handlePriceRangeChange = (value: number | number[]) => {
    const range: [number, number] = Array.isArray(value) ? [value[0], value[1]] : [0, value];
    setPriceRange(range);
    // Note: priceRange handling would need to be added to InventoryFilters type
    // For now, commenting this out to avoid type errors
    // onFiltersChange({ 
    //   priceRange: {
    //     min: range[0],
    //     max: range[1]
    //   }
    // });
  };

  const renderActiveFilters = () => {
    const activeFilters = [];

    if (filters.search) {
      activeFilters.push(
        <Tag 
          key="search" 
          closable 
          onClose={() => onFiltersChange({ search: '' })}
        >
          Search: {filters.search}
        </Tag>
      );
    }

    if (filters.categoryId) {
      const category = categories.find(c => c.id === filters.categoryId);
      activeFilters.push(
        <Tag 
          key="category" 
          closable 
          onClose={() => onFiltersChange({ categoryId: '' })}
        >
          Category: {category?.name || filters.categoryId}
        </Tag>
      );
    }

    if (filters.brandId) {
      const brand = brands.find(b => b.id === filters.brandId);
      activeFilters.push(
        <Tag 
          key="brand" 
          closable 
          onClose={() => onFiltersChange({ brandId: '' })}
        >
          Brand: {brand?.name || filters.brandId}
        </Tag>
      );
    }

    if (filters.locationId) {
      const location = locations.find(l => l.id === filters.locationId);
      activeFilters.push(
        <Tag 
          key="location" 
          closable 
          onClose={() => onFiltersChange({ locationId: '' })}
        >
          Location: {location?.name || filters.locationId}
        </Tag>
      );
    }

    if (filters.lowStock) {
      activeFilters.push(
        <Tag 
          key="lowStock" 
          color="orange" 
          closable 
          onClose={() => onFiltersChange({ lowStock: false })}
        >
          Low Stock
        </Tag>
      );
    }

    if (filters.outOfStock) {
      activeFilters.push(
        <Tag 
          key="outOfStock" 
          color="red" 
          closable 
          onClose={() => onFiltersChange({ outOfStock: false })}
        >
          Out of Stock
        </Tag>
      );
    }

    return activeFilters.length > 0 ? (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
          <Button 
            type="link" 
            size="small" 
            onClick={onClearFilters}
            className="p-0 h-auto"
          >
            Clear All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeFilters}
        </div>
      </div>
    ) : null;
  };

  return (
    <Card className={className} size="small">
      <div className="space-y-4">
        {/* Primary Filters */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Search products, SKU..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onSearch={handleSearchChange}
              loading={loading}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={6} lg={4}>
            <Select
              placeholder="Category"
              value={filters.categoryId || undefined}
              onChange={(value) => handleSelectChange('categoryId', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={6} lg={4}>
            <Select
              placeholder="Brand"
              value={filters.brandId || undefined}
              onChange={(value) => handleSelectChange('brandId', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {brands.map(brand => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={6} lg={4}>
            <Select
              placeholder="Location"
              value={filters.locationId || undefined}
              onChange={(value) => handleSelectChange('locationId', value)}
              allowClear
              style={{ width: '100%' }}
            >
              {locations.map(location => (
                <Option key={location.id} value={location.id}>
                  {location.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Space>
              <Tooltip title="Show advanced filters">
                                 <Button
                   icon={<FilterOutlined />}
                   onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                   type={showAdvancedFilters ? 'primary' : 'default'}
                 >
                  {showAdvanced && getActiveFiltersCount() > 0 && (
                    <span className="ml-1">({getActiveFiltersCount()})</span>
                  )}
                </Button>
              </Tooltip>
              
              {onRefresh && (
                <Tooltip title="Refresh data">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                  />
                </Tooltip>
              )}
            </Space>
          </Col>
        </Row>

        {/* Advanced Filters */}
        {showAdvanced && showAdvancedFilters && (
          <>
            <Divider className="my-4" />
            <div className="bg-gray-50 p-4 rounded">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={8}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <Space direction="vertical" size="small">
                      <div className="flex items-center">
                        <Switch
                          size="small"
                          checked={filters.lowStock}
                          onChange={(checked) => handleSwitchChange('lowStock', checked)}
                        />
                        <span className="ml-2 text-sm">Low Stock Items</span>
                      </div>
                      <div className="flex items-center">
                        <Switch
                          size="small"
                          checked={filters.outOfStock}
                          onChange={(checked) => handleSwitchChange('outOfStock', checked)}
                        />
                        <span className="ml-2 text-sm">Out of Stock Items</span>
                      </div>
                    </Space>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (${priceRange[0]} - ${priceRange[1]})
                    </label>
                    <Slider
                      range
                      min={0}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onChange={handlePriceRangeChange}
                      tooltip={{ formatter: (value) => `$${value}` }}
                    />
                  </div>
                </Col>

                <Col xs={24} lg={8}>
                  <div className="flex items-end h-full">
                    <Space>
                      <Button
                        icon={<ClearOutlined />}
                        onClick={onClearFilters}
                        disabled={!hasActiveFilters()}
                      >
                        Clear Filters
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        )}

        {/* Active Filters Display */}
        {renderActiveFilters()}
      </div>
    </Card>
  );
} 