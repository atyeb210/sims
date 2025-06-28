'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col,
  Progress,
  Tag,
  Table,
  Statistic,
  Alert,
  Tooltip,
  Select,
  Switch
} from 'antd';
import { 
  RobotOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface ModelPerformance {
  modelType: string;
  name: string;
  description: string;
  mape: number;
  rmse: number;
  mae: number;
  accuracy: number;
  speed: number; // predictions per second
  memoryUsage: number; // MB
  trainingTime: number; // hours
  lastUpdated: Date;
  trainingData: number;
  isActive: boolean;
  icon: React.ReactNode;
  color: string;
}

interface ModelComparisonProps {
  className?: string;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'speed' | 'memory'>('accuracy');
  const [showInactive, setShowInactive] = useState(false);
  const [models, setModels] = useState<ModelPerformance[]>([]);

  useEffect(() => {
    // Mock data - in real implementation would fetch from API
    setModels([
      {
        modelType: 'tensorflow_lstm_attention',
        name: 'TensorFlow.js LSTM',
        description: 'Deep learning with LSTM networks and attention mechanism for time series forecasting',
        mape: 0.13,
        rmse: 15.2,
        mae: 8.9,
        accuracy: 0.87,
        speed: 145,
        memoryUsage: 512,
        trainingTime: 4.5,
        lastUpdated: new Date(),
        trainingData: 10000,
        isActive: true,
        icon: <ThunderboltOutlined />,
        color: '#ff6b35'
      },
      {
        modelType: 'pytorch_temporal_fusion_transformer',
        name: 'PyTorch TFT',
        description: 'State-of-the-art Temporal Fusion Transformer with 36-69% better accuracy than Amazon DeepAR',
        mape: 0.08,
        rmse: 11.4,
        mae: 6.2,
        accuracy: 0.94,
        speed: 89,
        memoryUsage: 1024,
        trainingTime: 8.2,
        lastUpdated: new Date(),
        trainingData: 15000,
        isActive: true,
        icon: <RobotOutlined />,
        color: '#ee4035'
      },
      {
        modelType: 'facebook_prophet',
        name: 'Facebook Prophet',
        description: 'Automatic seasonality detection for fashion cycles with business-friendly interpretation',
        mape: 0.18,
        rmse: 18.7,
        mae: 12.1,
        accuracy: 0.82,
        speed: 234,
        memoryUsage: 256,
        trainingTime: 1.2,
        lastUpdated: new Date(),
        trainingData: 8000,
        isActive: true,
        icon: <BulbOutlined />,
        color: '#7bc043'
      },
      {
        modelType: 'ensemble_model',
        name: 'Ensemble Model',
        description: 'Combines TensorFlow, PyTorch, and Prophet for improved reliability and accuracy',
        mape: 0.09,
        rmse: 12.8,
        mae: 7.1,
        accuracy: 0.91,
        speed: 67,
        memoryUsage: 1792,
        trainingTime: 12.0,
        lastUpdated: new Date(),
        trainingData: 33000,
        isActive: true,
        icon: <ExperimentOutlined />,
        color: '#0392cf'
      },
      {
        modelType: 'simple_moving_average',
        name: 'Moving Average',
        description: 'Traditional statistical baseline model for comparison',
        mape: 0.35,
        rmse: 28.4,
        mae: 18.9,
        accuracy: 0.65,
        speed: 1250,
        memoryUsage: 32,
        trainingTime: 0.1,
        lastUpdated: new Date(),
        trainingData: 5000,
        isActive: false,
        icon: <LineChartOutlined />,
        color: '#999999'
      }
    ]);
  }, []);

  const filteredModels = showInactive ? models : models.filter(m => m.isActive);

  const columns = [
    {
      title: 'Model',
      key: 'model',
      render: (record: ModelPerformance) => (
        <div className="flex items-center gap-3">
          <div style={{ color: record.color, fontSize: '20px' }}>
            {record.icon}
          </div>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.modelType}
            </Text>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy: number) => (
        <div className="flex items-center gap-2">
          <Progress 
            type="circle" 
            percent={Math.round(accuracy * 100)} 
            size={40}
            strokeColor={accuracy > 0.9 ? '#52c41a' : accuracy > 0.8 ? '#faad14' : '#ff4d4f'}
          />
          <Text strong>{(accuracy * 100).toFixed(1)}%</Text>
        </div>
      ),
      sorter: (a: ModelPerformance, b: ModelPerformance) => a.accuracy - b.accuracy,
    },
    {
      title: 'MAPE',
      dataIndex: 'mape',
      key: 'mape',
      render: (mape: number) => (
        <div>
          <Text>{(mape * 100).toFixed(1)}%</Text>
          <br />
          <Progress 
            percent={100 - (mape * 100)} 
            size="small"
            strokeColor="#52c41a"
            showInfo={false}
          />
        </div>
      ),
      sorter: (a: ModelPerformance, b: ModelPerformance) => a.mape - b.mape,
    },
    {
      title: 'Speed',
      dataIndex: 'speed',
      key: 'speed',
      render: (speed: number) => (
        <div>
          <Text strong>{speed}</Text>
          <br />
          <Text type="secondary" className="text-xs">pred/sec</Text>
        </div>
      ),
      sorter: (a: ModelPerformance, b: ModelPerformance) => a.speed - b.speed,
    },
    {
      title: 'Memory',
      dataIndex: 'memoryUsage',
      key: 'memoryUsage',
      render: (memory: number) => (
        <div>
          <Text>{memory} MB</Text>
          <br />
          <Progress 
            percent={Math.min(100, (memory / 2048) * 100)} 
            size="small"
            strokeColor={memory < 500 ? '#52c41a' : memory < 1000 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
      sorter: (a: ModelPerformance, b: ModelPerformance) => a.memoryUsage - b.memoryUsage,
    },
    {
      title: 'Training',
      key: 'training',
      render: (record: ModelPerformance) => (
        <div>
          <Text>{record.trainingTime.toFixed(1)}h</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {(record.trainingData / 1000).toFixed(0)}K samples
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: ModelPerformance) => (
        <div>
          <Tag color={isActive ? 'success' : 'default'}>
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
          {isActive && record.accuracy === Math.max(...models.map(m => m.accuracy)) && (
            <div className="mt-1">
              <Tag color="gold" icon={<TrophyOutlined />}>
                Best
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: ModelPerformance) => (
        <Space direction="vertical" size="small">
          <Button size="small" icon={<PlayCircleOutlined />}>
            Test
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            Config
          </Button>
        </Space>
      ),
    },
  ];

  const getBestModel = (metric: string) => {
    switch (metric) {
      case 'accuracy':
        return models.reduce((max, model) => model.accuracy > max.accuracy ? model : max);
      case 'speed':
        return models.reduce((max, model) => model.speed > max.speed ? model : max);
      case 'memory':
        return models.reduce((min, model) => model.memoryUsage < min.memoryUsage ? model : min);
      default:
        return models[0];
    }
  };

  const bestModel = getBestModel(selectedMetric);

  const averageMetrics = {
    accuracy: models.reduce((sum, m) => sum + m.accuracy, 0) / models.length,
    speed: models.reduce((sum, m) => sum + m.speed, 0) / models.length,
    memory: models.reduce((sum, m) => sum + m.memoryUsage, 0) / models.length,
    mape: models.reduce((sum, m) => sum + m.mape, 0) / models.length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="mb-2">
            Model Performance Comparison
          </Title>
          <Text type="secondary">
            Compare accuracy, speed, and resource usage across different ML models
          </Text>
        </div>
        
        <Space>
          <Button icon={<PlayCircleOutlined />}>
            Run Benchmark
          </Button>
          <Button type="primary" icon={<SettingOutlined />}>
            Model Settings
          </Button>
        </Space>
      </div>

      {/* Performance Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Best Accuracy" 
              value={Math.max(...models.map(m => m.accuracy)) * 100} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
            <Text type="secondary" className="block mt-2">
              {bestModel.name}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Avg MAPE" 
              value={averageMetrics.mape * 100} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Avg Speed" 
              value={averageMetrics.speed} 
              precision={0}
              suffix="pred/s"
              valueStyle={{ color: '#722ed1' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Total Memory" 
              value={averageMetrics.memory} 
              precision={0}
              suffix="MB"
              valueStyle={{ color: '#eb2f96' }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Model Insights */}
      <Alert
        type="info"
        message="Model Performance Insights"
        description={
          <div>
            <p><strong>Best Overall:</strong> {bestModel.name} with {(bestModel.accuracy * 100).toFixed(1)}% accuracy</p>
            <p><strong>Fastest:</strong> {getBestModel('speed').name} at {getBestModel('speed').speed} predictions/second</p>
            <p><strong>Most Efficient:</strong> {getBestModel('memory').name} using only {getBestModel('memory').memoryUsage}MB memory</p>
            <p><strong>Recommendation:</strong> Use ensemble model for production to balance accuracy and reliability</p>
          </div>
        }
        showIcon
        icon={<InfoCircleOutlined />}
      />

      {/* Controls */}
      <Card className="shadow-sm">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Sort by Metric</Text>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                style={{ width: '100%' }}
              >
                <Option value="accuracy">Accuracy</Option>
                <Option value="speed">Speed</Option>
                <Option value="memory">Memory Usage</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Show Inactive Models</Text>
              <Switch
                checked={showInactive}
                onChange={setShowInactive}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Actions</Text>
              <Space>
                <Button icon={<PlayCircleOutlined />}>
                  Retrain All
                </Button>
                <Tooltip title="Export performance data">
                  <Button icon={<LineChartOutlined />}>
                    Export
                  </Button>
                </Tooltip>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Models Table */}
      <Card 
        title={
          <Space>
            <RobotOutlined />
            <span>Model Performance Matrix</span>
            <Tooltip title="Detailed comparison of all available forecasting models">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={filteredModels}
          loading={loading}
          rowKey="modelType"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Model Architecture Comparison */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Model Architectures" className="shadow-sm">
            <div className="space-y-4">
              {filteredModels.slice(0, 3).map(model => (
                <div key={model.modelType} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div style={{ color: model.color, fontSize: '18px' }}>
                      {model.icon}
                    </div>
                    <div>
                      <Text strong>{model.name}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {model.description.slice(0, 50)}...
                      </Text>
                    </div>
                  </div>
                  <Progress 
                    type="circle" 
                    percent={Math.round(model.accuracy * 100)} 
                    size={50}
                    strokeColor={model.color}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Performance Trends" className="shadow-sm">
            <div className="text-center py-8">
              <LineChartOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={5} className="text-gray-600">
                Model Performance Over Time
              </Title>
              <Text type="secondary">
                Historical accuracy and performance metrics
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 