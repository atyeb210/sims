'use client';

import React from 'react';
import { Card, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { cn } from '@/utils/cn';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

const { Title, Text } = Typography;

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  format?: 'currency' | 'number' | 'percentage' | 'custom';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  format = 'number',
  prefix,
  suffix,
  loading = false,
  className,
  color = 'primary',
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'number':
        return formatNumber(val);
      default:
        return val.toString();
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'border-l-4 border-l-green-500';
      case 'warning':
        return 'border-l-4 border-l-amber-500';
      case 'danger':
        return 'border-l-4 border-l-red-500';
      case 'info':
        return 'border-l-4 border-l-blue-500';
      default:
        return 'border-l-4 border-l-primary-600';
    }
  };

  const getChangeColor = () => {
    return change?.type === 'increase' 
      ? 'text-green-600 bg-green-50' 
      : 'text-red-600 bg-red-50';
  };

  return (
    <Card
      loading={loading}
      className={cn(
        'hover:shadow-md transition-shadow duration-200',
        getColorClasses(),
        className
      )}
      styles={{
        body: { padding: '20px' }
      }}
    >
      <div className="space-y-2">
        {/* Title */}
        <Text className="text-secondary-600 text-sm font-medium block">
          {title}
        </Text>

        {/* Value */}
        <div className="flex items-center space-x-2">
          {prefix && (
            <span className="text-secondary-500 text-lg">
              {prefix}
            </span>
          )}
          
          <Title 
            level={2} 
            className="!mb-0 !text-secondary-900 font-bold"
            style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
          >
            {formatValue(value)}
          </Title>
          
          {suffix && (
            <span className="text-secondary-500 text-lg">
              {suffix}
            </span>
          )}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center space-x-1">
            <div className={cn(
              'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
              getChangeColor()
            )}>
              {change.type === 'increase' ? (
                <ArrowUpOutlined className="text-xs" />
              ) : (
                <ArrowDownOutlined className="text-xs" />
              )}
              <span>
                {format === 'percentage' 
                  ? formatPercentage(Math.abs(change.value))
                  : formatNumber(Math.abs(change.value))
                }
              </span>
            </div>
            
            {change.period && (
              <Text className="text-secondary-500 text-xs">
                {change.period}
              </Text>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}; 