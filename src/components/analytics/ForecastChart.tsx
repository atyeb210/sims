'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  Button, 
  Space, 
  Tooltip, 
  Tag,
  Typography,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  LineChartOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  FullscreenOutlined
} from '@ant-design/icons';
import type { DemandForecast, Product } from '@/types';

const { Text, Title } = Typography;
const { Option } = Select;

interface ForecastChartProps {
  forecasts: DemandForecast[];
  products: Product[];
  loading?: boolean;
  className?: string;
}

interface ChartDataPoint {
  date: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
  confidence: number;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecasts,
  products,
  loading = false,
  className
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [showConfidence, setShowConfidence] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Process forecast data for chart
  useEffect(() => {
    if (!forecasts.length || !selectedProduct) return;

    const productForecasts = forecasts.filter(f => f.productId === selectedProduct);
    const processedData: ChartDataPoint[] = productForecasts.map(forecast => ({
      date: new Date(forecast.forecastDate).toISOString().split('T')[0],
      predicted: forecast.predictedDemand,
      upperBound: forecast.confidenceInterval?.upper || forecast.predictedDemand * 1.2,
      lowerBound: forecast.confidenceInterval?.lower || forecast.predictedDemand * 0.8,
      confidence: forecast.accuracy || 0.85
    }));

    setChartData(processedData);
  }, [forecasts, selectedProduct]);

  // Calculate metrics
  const metrics = {
    avgPrediction: chartData.reduce((sum, d) => sum + d.predicted, 0) / (chartData.length || 1),
    avgConfidence: chartData.reduce((sum, d) => sum + d.confidence, 0) / (chartData.length || 1),
    volatility: calculateVolatility(chartData.map(d => d.predicted)),
    trend: calculateTrend(chartData.map(d => d.predicted))
  };

  function calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }

  const exportChart = () => {
    // Implementation for chart export
    console.log('Exporting chart data:', chartData);
  };

  return (
    <Card 
      className={`shadow-sm ${className}`}
      title={
        <div className="flex items-center justify-between">
          <Space>
            <LineChartOutlined />
            <span>Demand Forecast Chart</span>
            <Tooltip title="Interactive forecasting chart with confidence intervals and seasonal patterns">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
          
          <Space>
            <Button icon={<DownloadOutlined />} onClick={exportChart}>
              Export
            </Button>
            <Button icon={<FullscreenOutlined />}>
              Fullscreen
            </Button>
          </Space>
        </div>
      }
      loading={loading}
    >
      {/* Controls */}
      <div className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong className="block mb-2">Product</Text>
              <Select
                placeholder="Select a product"
                value={selectedProduct}
                onChange={setSelectedProduct}
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {products.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong className="block mb-2">Chart Type</Text>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: '100%' }}
              >
                <Option value="line">Line Chart</Option>
                <Option value="area">Area Chart</Option>
                <Option value="bar">Bar Chart</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong className="block mb-2">Options</Text>
              <Space>
                <Button 
                  type={showConfidence ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setShowConfidence(!showConfidence)}
                >
                  Confidence Bands
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      {/* Metrics Row */}
      {selectedProduct && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Statistic 
              title="Avg Prediction" 
              value={metrics.avgPrediction} 
              precision={0}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="Confidence" 
              value={metrics.avgConfidence * 100} 
              precision={1}
              suffix="%"
              valueStyle={{ 
                fontSize: '16px',
                color: metrics.avgConfidence > 0.8 ? '#52c41a' : metrics.avgConfidence > 0.6 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="Volatility" 
              value={metrics.volatility} 
              precision={1}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <div>
              <Text className="text-gray-500 text-sm block">Trend</Text>
              <Tag 
                color={
                  metrics.trend === 'up' ? 'green' : 
                  metrics.trend === 'down' ? 'red' : 'blue'
                }
                className="mt-1"
              >
                {metrics.trend.toUpperCase()}
              </Tag>
            </div>
          </Col>
        </Row>
      )}

      {/* Chart Placeholder */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        {selectedProduct ? (
          <div>
            <LineChartOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={4} className="text-gray-600 mb-2">
              Interactive Forecast Chart
            </Title>
            <Text type="secondary" className="block mb-4">
              Showing {chartData.length} forecast points for selected product
            </Text>
            <div className="space-y-2">
              <Text className="block">
                <strong>Chart Features:</strong>
              </Text>
              <ul className="text-left inline-block text-sm text-gray-600">
                <li>• Demand prediction with confidence intervals</li>
                <li>• Seasonal pattern visualization</li>
                <li>• Historical vs. predicted comparison</li>
                <li>• Interactive zoom and pan</li>
                <li>• Trend analysis and annotations</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <LineChartOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={5} className="text-gray-500">
              Select a product to view forecast chart
            </Title>
            <Text type="secondary">
              Choose from {products.length} available products to see demand predictions
            </Text>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      {selectedProduct && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <Text strong className="block mb-2">Legend:</Text>
          <Space wrap>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <Text className="text-sm">Predicted Demand</Text>
            </div>
            {showConfidence && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <Text className="text-sm">Confidence Interval</Text>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <Text className="text-sm">Seasonal Peaks</Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <Text className="text-sm">Trend Changes</Text>
            </div>
          </Space>
        </div>
      )}
    </Card>
  );
}; 