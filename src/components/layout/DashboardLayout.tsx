'use client';

import React from 'react';
import { Layout, ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/utils/cn';

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
  breadcrumbs,
}) => {
  // Ant Design theme configuration
  const theme = {
    token: {
      colorPrimary: '#2563eb', // primary-600
      colorPrimaryHover: '#1d4ed8', // primary-700
      colorSuccess: '#10b981', // accent-500
      colorWarning: '#f59e0b', // amber-500
      colorError: '#ef4444', // red-500
      colorInfo: '#3b82f6', // primary-500
      borderRadius: 8,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Layout: {
        headerBg: '#ffffff',
        siderBg: '#0f172a',
        bodyBg: '#f8fafc',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkItemSelectedBg: '#1e40af',
        darkItemHoverBg: '#1e293b',
        darkItemColor: '#cbd5e1',
        darkItemSelectedColor: '#ffffff',
        darkItemHoverColor: '#ffffff',
        darkSubMenuItemBg: 'transparent',
      },
      Button: {
        primaryShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
      },
      Card: {
        borderRadius: 12,
        boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      Table: {
        headerBg: '#f8fafc',
        headerColor: '#1e293b',
        rowHoverBg: '#f1f5f9',
      },
    },
  };

  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <Layout className="min-h-screen">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <Layout className="bg-background-light">
            {/* Header */}
            <Header breadcrumbs={breadcrumbs} />
            
            {/* Content */}
            <Content
              className={cn(
                'flex-1 px-8 py-8 overflow-auto bg-background-light',
                className
              )}
            >
              <div className="max-w-none space-y-8">
                {children}
              </div>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </AntdRegistry>
  );
}; 