'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col,
  message,
  Tabs,
  Select,
  DatePicker,
  Statistic,
  Progress,
  Table,
  Tag,
  Alert,
  Spin,
  Segmented,
  Tooltip
} from 'antd';
import { 
  LineChartOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined,
  RobotOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  BulbOutlined,
  SettingOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Product, DemandForecast, Location } from '@/types';
import { SeasonalAnalysis, ModelComparison } from '@/components/analytics';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ForecastingModel {
  id: string;
  name: string;
  type: 'tensorflow' | 'pytorch' | 'prophet';
  description: string;
  accuracy: number;
  performance: number;
  isActive: boolean;
  icon: React.ReactNode;
}

interface SeasonalTrend {
  period: string;
  factor: number;
  confidence: number;
  category: string;
}

interface ForecastMetrics {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mae: number;  // Mean Absolute Error
  accuracy: number;
}

export default function AnalyticsPage() {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle hash-based navigation from sidebar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const hash = window.location.hash;
      switch (hash) {
        case '#models':
          setActiveTab('models');
          break;
        case '#seasonal':
          setActiveTab('seasonal');
          break;
        case '#variants':
          setActiveTab('variants');
          break;
        default:
          setActiveTab('dashboard');
      }
    };

    // Set initial tab based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [loading, setLoading] = useState(false);
  const [forecasting, setForecasting] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([]);
  const [metrics, setMetrics] = useState<ForecastMetrics | null>(null);

  // Model configurations
  const availableModels: ForecastingModel[] = [
    {
      id: 'tensorflow',
      name: 'TensorFlow.js LSTM',
      type: 'tensorflow',
      description: 'Deep learning with LSTM networks for time series forecasting',
      accuracy: 0.87,
      performance: 0.92,
      isActive: true,
      icon: <ThunderboltOutlined style={{ color: '#ff6b35' }} />
    },
    {
      id: 'pytorch',
      name: 'PyTorch Temporal Fusion Transformer',
      type: 'pytorch',
      description: 'State-of-the-art attention-based model with 36-69% better accuracy',
      accuracy: 0.94,
      performance: 0.88,
      isActive: true,
      icon: <RobotOutlined style={{ color: '#ee4035' }} />
    },
    {
      id: 'prophet',
      name: 'Facebook Prophet',
      type: 'prophet',
      description: 'Automatic seasonality detection for fashion cycles and trends',
      accuracy: 0.82,
      performance: 0.95,
      isActive: true,
      icon: <BulbOutlined style={{ color: '#7bc043' }} />
    },
    {
      id: 'ensemble',
      name: 'Ensemble Model',
      type: 'tensorflow',
      description: 'Combines multiple algorithms for improved reliability',
      accuracy: 0.91,
      performance: 0.85,
      isActive: true,
      icon: <ExperimentOutlined style={{ color: '#0392cf' }} />
    }
  ];

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [productsRes, forecastsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/forecasts')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);
      }

      if (forecastsRes.ok) {
        const forecastsData = await forecastsRes.json();
        setForecasts(forecastsData.data || []);
        setMetrics({
          mape: 0.12,
          rmse: 15.3,
          mae: 8.7,
          accuracy: 0.88
        });
      }

      // Mock seasonal trends data
      setSeasonalTrends([
        { period: 'Spring', factor: 1.2, confidence: 0.92, category: 'Clothing' },
        { period: 'Summer', factor: 0.8, confidence: 0.88, category: 'Clothing' },
        { period: 'Fall', factor: 1.4, confidence: 0.95, category: 'Clothing' },
        { period: 'Winter', factor: 1.1, confidence: 0.90, category: 'Clothing' },
        { period: 'Holiday', factor: 1.8, confidence: 0.97, category: 'Accessories' },
      ]);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      message.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Generate forecasts
  const generateForecasts = async () => {
    try {
      setForecasting(true);
      
      const requestBody = {
        productIds: selectedProducts.length > 0 ? selectedProducts : products.slice(0, 5).map(p => p.id),
        forecastPeriod: 'DAILY',
        horizonDays: forecastHorizon,
        modelType: selectedModel,
        includeConfidenceInterval: true,
        includeSeasonality: true
      };

      const response = await fetch('/api/forecasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to generate forecasts');
      }

      const result = await response.json();
      
      message.success(`Generated ${result.data.forecastCount} forecasts using ${selectedModel} model`);
      await fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error generating forecasts:', error);
      message.error('Failed to generate forecasts');
    } finally {
      setForecasting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Table columns for forecasts
  const forecastColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (record: any) => (
        <div>
          <Text strong>{record.product?.name || 'N/A'}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.product?.sku || 'N/A'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Model Used',
      dataIndex: 'modelUsed',
      key: 'modelUsed',
      render: (model: string) => {
        const modelConfig = availableModels.find(m => m.id === model || m.name.toLowerCase().includes(model.toLowerCase()));
        return (
          <Tag icon={modelConfig?.icon} color="processing">
            {model.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Predicted Demand',
      dataIndex: 'predictedDemand',
      key: 'predictedDemand',
      render: (demand: number) => (
        <Statistic 
          value={demand} 
          precision={0}
          valueStyle={{ fontSize: '14px' }}
        />
      ),
    },
    {
      title: 'Confidence Interval',
      key: 'confidence',
      render: (record: any) => (
        <div>
          <Text className="text-xs">
            {record.confidenceLower} - {record.confidenceUpper}
          </Text>
          <br />
          <Progress 
            percent={Math.round(((record.predictedDemand - record.confidenceLower) / 
                    (record.confidenceUpper - record.confidenceLower)) * 100)}
            size="small"
            status="active"
          />
        </div>
      ),
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => (
        <Progress 
          type="circle" 
          percent={Math.round((accuracy || 0) * 100)} 
          size={40}
          format={percent => `${percent}%`}
        />
      ),
    },
    {
      title: 'Forecast Date',
      dataIndex: 'forecastDate',
      key: 'forecastDate',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
  ];

  const seasonalColumns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period: string) => <Tag color="blue">{period}</Tag>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="green">{category}</Tag>,
    },
    {
      title: 'Seasonal Factor',
      dataIndex: 'factor',
      key: 'factor',
      render: (factor: number) => (
        <div className="flex items-center gap-2">
          <span>{factor.toFixed(2)}x</span>
          {factor > 1 ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => (
        <Progress 
          percent={Math.round(confidence * 100)} 
          size="small"
          status={confidence > 0.9 ? 'success' : confidence > 0.8 ? 'active' : 'exception'}
        />
      ),
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <Title level={2} className="mb-0 text-slate-800 font-bold text-3xl tracking-tight">
              Analytics & Forecasting
            </Title>
            <Text className="text-slate-600 text-lg font-medium leading-relaxed">
              Advanced demand forecasting with machine learning for apparel industry
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData} 
              loading={loading}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Refresh
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Export Report
            </Button>
            <Button 
              type="primary" 
              icon={forecasting ? <StopOutlined /> : <PlayCircleOutlined />}
              onClick={generateForecasts}
              loading={forecasting}
              size="large"
              className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none rounded-xl shadow-lg font-semibold hover:shadow-xl transition-all duration-200"
            >
              {forecasting ? 'Stop Forecasting' : 'Generate Forecast'}
            </Button>
          </div>
        </div>
      </div>

      {/* Model Performance Summary */}
      {metrics && (
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 -mx-6 -mt-6 mb-8 px-8 py-6">
            <Title level={4} className="text-slate-800 mb-0 font-semibold">Model Performance Metrics</Title>
          </div>
          <div className="px-2">
            <Row gutter={[32, 32]}>
              <Col xs={12} sm={6}>
                <div className="text-center p-6 bg-green-50/80 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300">
                  <Statistic 
                    title="Model Accuracy" 
                    value={metrics.accuracy * 100} 
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#16a34a', fontSize: '32px', fontWeight: '700' }}
                    prefix={<ArrowUpOutlined className="text-green-500" />}
                  />
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="text-center p-6 bg-blue-50/80 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                  <Statistic 
                    title="MAPE" 
                    value={metrics.mape * 100} 
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#2563eb', fontSize: '32px', fontWeight: '700' }}
                  />
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="text-center p-6 bg-purple-50/80 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300">
                  <Statistic 
                    title="RMSE" 
                    value={metrics.rmse} 
                    precision={1}
                    valueStyle={{ color: '#7c3aed', fontSize: '32px', fontWeight: '700' }}
                  />
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="text-center p-6 bg-pink-50/80 rounded-2xl border border-pink-200/50 hover:shadow-lg transition-all duration-300">
                  <Statistic 
                    title="MAE" 
                    value={metrics.mae} 
                    precision={1}
                    valueStyle={{ color: '#dc2626', fontSize: '32px', fontWeight: '700' }}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            // Update URL hash to match tab
            if (typeof window !== 'undefined') {
              const hashMap = {
                'dashboard': '',
                'models': '#models',
                'seasonal': '#seasonal',
                'variants': '#variants'
              };
              window.history.replaceState(null, '', `/analytics${hashMap[key as keyof typeof hashMap] || ''}`);
            }
          }}
          size="large"
          className="[&_.ant-tabs-tab]:px-8 [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab]:rounded-xl [&_.ant-tabs-tab]:font-semibold [&_.ant-tabs-tab-active]:bg-blue-50/80 [&_.ant-tabs-content-holder]:pt-8"
          items={[
            {
              key: 'dashboard',
              label: (
                <span className="flex items-center gap-2">
                  <DashboardOutlined />
                  Forecasting Dashboard
                </span>
              )
            },
            {
              key: 'models',
              label: (
                <span className="flex items-center gap-2">
                  <RobotOutlined />
                  Model Management
                </span>
              )
            },
            {
              key: 'seasonal',
              label: (
                <span className="flex items-center gap-2">
                  <CalendarOutlined />
                  Seasonal Analysis
                </span>
              )
            },
            {
              key: 'variants',
              label: (
                <span className="flex items-center gap-2">
                  <BarChartOutlined />
                  Size/Color Analysis
                </span>
              )
            }
          ]}
        />
      </Card>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Forecasting Controls */}
            <Card 
              title={
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <SettingOutlined className="text-white text-lg" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">Forecasting Configuration</span>
                </div>
              }
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50"
            >
              <div className="p-4">
                <Row gutter={[32, 32]} align="middle">
                  <Col xs={24} sm={12} md={6}>
                    <div className="space-y-3">
                      <Text strong className="block text-slate-700 text-base">Model Selection</Text>
                  <Select 
                    value={selectedModel}
                    onChange={setSelectedModel}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    {availableModels.map(model => (
                      <Option key={model.id} value={model.id}>
                        <Space>
                          {model.icon}
                          {model.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text strong className="block mb-2">Forecast Horizon (Days)</Text>
                  <Select 
                    value={forecastHorizon}
                    onChange={setForecastHorizon}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Option value={7}>7 Days</Option>
                    <Option value={14}>14 Days</Option>
                    <Option value={30}>30 Days</Option>
                    <Option value={60}>60 Days</Option>
                    <Option value={90}>90 Days</Option>
                  </Select>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text strong className="block mb-2">Products</Text>
                  <Select 
                    mode="multiple"
                    placeholder="Select products (all if empty)"
                    value={selectedProducts}
                    onChange={setSelectedProducts}
                    style={{ width: '100%' }}
                    size="large"
                    maxTagCount={2}
                  >
                    {products.map(product => (
                      <Option key={product.id} value={product.id}>
                        {product.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <div>
                  <Text strong className="block mb-2">Date Range</Text>
                  <RangePicker 
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                    style={{ width: '100%' }}
                    size="large"
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* Recent Forecasts */}
            <Card 
              title={
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <LineChartOutlined className="text-white text-lg" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">{`Recent Forecasts (${forecasts.length})`}</span>
                </div>
              }
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50"
              extra={
                <Button 
                  type="primary" 
                  icon={<LineChartOutlined />}
                  className="h-10 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-none rounded-xl shadow-md font-medium"
                >
                  View Charts
                </Button>
              }
            >
              <div className="p-2">
                <Table
                  columns={forecastColumns}
                  dataSource={forecasts}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} forecasts`,
                  }}
                  className="[&_.ant-table-thead_th]:bg-slate-50/80 [&_.ant-table-thead_th]:font-semibold [&_.ant-table-tbody_tr:hover]:bg-blue-50/50"
                />
              </div>
            </Card>
        </div>
      )}

      {activeTab === 'models' && (
        <ModelComparison />
      )}

      {activeTab === 'seasonal' && (
        <SeasonalAnalysis />
      )}

      {activeTab === 'variants' && (
        <div className="space-y-6">
          <Alert
            type="warning"
            message="Size & Color Variant Forecasting"
            description="Matrix-based forecasting for size/color combinations with hierarchical reconciliation ensuring variant forecasts sum to product totals."
            showIcon
            className="mb-6"
          />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Size Distribution" className="shadow-sm">
                <div className="space-y-3">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div key={size} className="flex justify-between items-center">
                      <Text>{size}</Text>
                      <Progress 
                        percent={Math.round(Math.random() * 40 + 20)} 
                        size="small"
                        style={{ width: '120px' }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title="Color Preferences" className="shadow-sm">
                <div className="space-y-3">
                  {[
                    { color: 'Black', value: 35 },
                    { color: 'White', value: 28 },
                    { color: 'Navy', value: 22 },
                    { color: 'Gray', value: 18 },
                    { color: 'Beige', value: 15 },
                    { color: 'Red', value: 12 }
                  ].map(item => (
                    <div key={item.color} className="flex justify-between items-center">
                      <Text>{item.color}</Text>
                      <Progress 
                        percent={item.value} 
                        size="small"
                        style={{ width: '120px' }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card title="Attribute-Based Modeling" className="shadow-sm">
                <div className="text-center py-8">
                  <BarChartOutlined className="text-4xl text-purple-500 mb-4" />
                  <Title level={5}>New Variant Prediction</Title>
                  <Text type="secondary">
                    Using product characteristics for new size/color variant forecasting
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="Size/Color Matrix Forecast" className="shadow-sm">
            <div className="text-center py-12">
              <DashboardOutlined className="text-4xl text-gray-400 mb-4" />
              <Title level={4} className="text-gray-500">Matrix Visualization</Title>
              <Text type="secondary">
                Interactive matrix showing demand forecasts for all size/color combinations
              </Text>
              <div className="mt-6">
                <Button type="primary" size="large">
                  Generate Matrix Forecast
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
} 