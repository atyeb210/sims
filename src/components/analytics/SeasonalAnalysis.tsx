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
  DatePicker
} from 'antd';
import { 
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  BulbOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface SeasonalPattern {
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amplitude: number;
  confidence: number;
  peakTime: string;
  description: string;
}

interface HolidayEffect {
  name: string;
  date: Date;
  impact: number;
  duration: number;
  category: string;
  description: string;
}

interface SeasonalAnalysisProps {
  productId?: string;
  className?: string;
}

export const SeasonalAnalysis: React.FC<SeasonalAnalysisProps> = ({
  productId,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [holidayEffects, setHolidayEffects] = useState<HolidayEffect[]>([]);

  // Mock data - in real implementation would fetch from API
  useEffect(() => {
    setSeasonalPatterns([
      {
        period: 'weekly',
        amplitude: 0.15,
        confidence: 0.85,
        peakTime: 'Friday-Saturday',
        description: 'Weekend shopping peaks for apparel purchases'
      },
      {
        period: 'monthly',
        amplitude: 0.35,
        confidence: 0.92,
        peakTime: 'Mid-month',
        description: 'Paycheck cycle drives mid-month purchasing spikes'
      },
      {
        period: 'quarterly',
        amplitude: 0.55,
        confidence: 0.94,
        peakTime: 'Q2, Q4',
        description: 'Spring collections (Q2) and holiday shopping (Q4)'
      },
      {
        period: 'yearly',
        amplitude: 0.75,
        confidence: 0.97,
        peakTime: 'November-December',
        description: 'Annual holiday shopping season peak'
      }
    ]);

    setHolidayEffects([
      {
        name: 'Black Friday',
        date: new Date('2024-11-29'),
        impact: 2.5,
        duration: 4,
        category: 'promotional',
        description: 'Major promotional event with highest apparel sales impact'
      },
      {
        name: 'Christmas Season',
        date: new Date('2024-12-25'),
        impact: 1.8,
        duration: 21,
        category: 'holiday',
        description: 'Extended holiday shopping period for gifts and personal purchases'
      },
      {
        name: 'Back to School',
        date: new Date('2024-08-15'),
        impact: 1.6,
        duration: 14,
        category: 'seasonal',
        description: 'Student and parent apparel purchases for new school year'
      },
      {
        name: 'New Year Sales',
        date: new Date('2024-01-01'),
        impact: 0.3,
        duration: 14,
        category: 'post_holiday',
        description: 'Post-holiday clearance period with reduced demand'
      },
      {
        name: 'Valentine\'s Day',
        date: new Date('2024-02-14'),
        impact: 1.4,
        duration: 7,
        category: 'seasonal',
        description: 'Gift-giving occasion with moderate apparel impact'
      },
      {
        name: 'Fashion Week',
        date: new Date('2024-09-15'),
        impact: 1.3,
        duration: 7,
        category: 'industry',
        description: 'Fashion industry event driving trend-conscious purchases'
      }
    ]);
  }, [productId]);

  const seasonalColumns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period: string) => (
        <Tag color="blue" icon={<CalendarOutlined />}>
          {period.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Peak Time',
      dataIndex: 'peakTime',
      key: 'peakTime',
      render: (time: string) => (
        <Text strong>{time}</Text>
      )
    },
    {
      title: 'Amplitude',
      dataIndex: 'amplitude',
      key: 'amplitude',
      render: (amplitude: number) => (
        <div className="flex items-center gap-2">
          <Progress 
            percent={Math.round(amplitude * 100)} 
            size="small" 
            style={{ width: '80px' }}
            strokeColor="#52c41a"
          />
          <Text>{(amplitude * 100).toFixed(1)}%</Text>
        </div>
      )
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => (
        <div className="flex items-center gap-2">
          <Progress 
            type="circle" 
            percent={Math.round(confidence * 100)} 
            size={40}
            strokeColor={confidence > 0.9 ? '#52c41a' : confidence > 0.8 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text type="secondary" className="text-sm">
          {description}
        </Text>
      )
    }
  ];

  const holidayColumns = [
    {
      title: 'Holiday/Event',
      key: 'holiday',
      render: (record: HolidayEffect) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {dayjs(record.date).format('MMM D, YYYY')}
          </Text>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryColors = {
          promotional: 'red',
          holiday: 'green',
          seasonal: 'blue',
          post_holiday: 'orange',
          industry: 'purple'
        };
        return (
          <Tag color={categoryColors[category as keyof typeof categoryColors] || 'default'}>
            {category.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      render: (impact: number) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{impact.toFixed(1)}x</span>
          {impact > 1 ? (
            <ArrowUpOutlined style={{ color: '#52c41a' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
          )}
        </div>
      )
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (
        <Text>{duration} day{duration > 1 ? 's' : ''}</Text>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text type="secondary" className="text-sm">
          {description}
        </Text>
      )
    }
  ];

  const getSeasonalMetrics = () => {
    const avgAmplitude = seasonalPatterns.reduce((sum, p) => sum + p.amplitude, 0) / seasonalPatterns.length;
    const avgConfidence = seasonalPatterns.reduce((sum, p) => sum + p.confidence, 0) / seasonalPatterns.length;
    const strongestPattern = seasonalPatterns.reduce((max, p) => p.amplitude > max.amplitude ? p : max, seasonalPatterns[0]);
    
    return { avgAmplitude, avgConfidence, strongestPattern };
  };

  const getHolidayMetrics = () => {
    const avgImpact = holidayEffects.reduce((sum, h) => sum + h.impact, 0) / holidayEffects.length;
    const maxImpact = Math.max(...holidayEffects.map(h => h.impact));
    const totalDuration = holidayEffects.reduce((sum, h) => sum + h.duration, 0);
    
    return { avgImpact, maxImpact, totalDuration };
  };

  const metrics = getSeasonalMetrics();
  const holidayMetrics = getHolidayMetrics();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="mb-2">
            Seasonal Pattern Analysis
          </Title>
          <Text type="secondary">
            Automatic detection of fashion cycles and seasonal trends for apparel industry
          </Text>
        </div>
        
        <Space>
          <Button icon={<DownloadOutlined />}>
            Export Analysis
          </Button>
          <Button type="primary" icon={<LineChartOutlined />}>
            View Charts
          </Button>
        </Space>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Avg Seasonality" 
              value={metrics.avgAmplitude * 100} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Pattern Confidence" 
              value={metrics.avgConfidence * 100} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Holiday Impact" 
              value={holidayMetrics.maxImpact} 
              precision={1}
              suffix="x"
              valueStyle={{ color: '#eb2f96' }}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="text-center shadow-sm">
            <Statistic 
              title="Effect Days/Year" 
              value={holidayMetrics.totalDuration} 
              valueStyle={{ color: '#722ed1' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Insights Alert */}
      <Alert
        type="info"
        message="Key Seasonal Insights"
        description={
          <div>
            <p><strong>Strongest Pattern:</strong> {metrics.strongestPattern?.description}</p>
            <p><strong>Peak Period:</strong> {metrics.strongestPattern?.peakTime} with {(metrics.strongestPattern?.amplitude * 100).toFixed(1)}% variation</p>
            <p><strong>Holiday Impact:</strong> Up to {holidayMetrics.maxImpact}x normal demand during peak promotional periods</p>
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
              <Text strong className="block mb-2">Analysis Period</Text>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: '100%' }}
              >
                <Option value="all">All Patterns</Option>
                <Option value="weekly">Weekly Patterns</Option>
                <Option value="monthly">Monthly Patterns</Option>
                <Option value="quarterly">Quarterly Patterns</Option>
                <Option value="yearly">Yearly Patterns</Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Event Category</Text>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
              >
                <Option value="all">All Categories</Option>
                <Option value="promotional">Promotional</Option>
                <Option value="holiday">Holiday</Option>
                <Option value="seasonal">Seasonal</Option>
                <Option value="industry">Industry Events</Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={8}>
            <div>
              <Text strong className="block mb-2">Actions</Text>
              <Space>
                <Button icon={<CalendarOutlined />}>
                  Forecast Calendar
                </Button>
                <Tooltip title="Detect new patterns">
                  <Button icon={<BulbOutlined />} type="primary">
                    Re-analyze
                  </Button>
                </Tooltip>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Seasonal Patterns Table */}
      <Card 
        title={
          <Space>
            <BarChartOutlined />
            <span>Seasonal Patterns</span>
            <Tooltip title="Detected seasonal patterns with confidence intervals">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          columns={seasonalColumns}
          dataSource={seasonalPatterns.filter(p => selectedPeriod === 'all' || p.period === selectedPeriod)}
          loading={loading}
          rowKey="period"
          pagination={false}
        />
      </Card>

      {/* Holiday Effects Table */}
      <Card 
        title={
          <Space>
            <GiftOutlined />
            <span>Holiday & Event Effects</span>
            <Tooltip title="Impact of holidays and promotional events on demand">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          </Space>
        }
        className="shadow-sm"
      >
        <Table
          columns={holidayColumns}
          dataSource={holidayEffects.filter(h => selectedCategory === 'all' || h.category === selectedCategory)}
          loading={loading}
          rowKey="name"
          pagination={{
            pageSize: 5,
            showSizeChanger: false
          }}
        />
      </Card>

      {/* Pattern Visualization Placeholder */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Seasonal Amplitude Chart" className="shadow-sm">
            <div className="text-center py-8">
              <LineChartOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={5} className="text-gray-600">
                Seasonal Pattern Visualization
              </Title>
              <Text type="secondary">
                Interactive chart showing seasonal amplitude over time
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Holiday Impact Timeline" className="shadow-sm">
            <div className="text-center py-8">
              <CalendarOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={5} className="text-gray-600">
                Holiday Impact Calendar
              </Title>
              <Text type="secondary">
                Timeline view of holiday effects throughout the year
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 