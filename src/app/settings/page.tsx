'use client';

import { Card, Typography, Row, Col, Button, Space } from 'antd';
import { 
  UserOutlined,
  ShopOutlined,
  TagsOutlined,
  SettingOutlined,
  DatabaseOutlined,
  BellOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const settingsCategories = [
    {
      key: 'account',
      title: 'Account Settings',
      description: 'Manage your profile, password, and preferences',
      icon: <UserOutlined className="text-2xl" />,
      href: '/settings/account',
      color: '#1890ff'
    },
    {
      key: 'locations',
      title: 'Locations',
      description: 'Manage warehouses, stores, and distribution centers',
      icon: <ShopOutlined className="text-2xl" />,
      href: '/settings/locations',
      color: '#52c41a'
    },
    {
      key: 'categories',
      title: 'Categories',
      description: 'Configure product categories and classifications',
      icon: <TagsOutlined className="text-2xl" />,
      href: '/settings/categories',
      color: '#faad14'
    },
    {
      key: 'system',
      title: 'System Settings',
      description: 'Database, integrations, and system configurations',
      icon: <DatabaseOutlined className="text-2xl" />,
      href: '/settings/system',
      color: '#722ed1'
    },
    {
      key: 'notifications',
      title: 'Notifications',
      description: 'Configure alerts, email notifications, and webhooks',
      icon: <BellOutlined className="text-2xl" />,
      href: '/settings/notifications',
      color: '#eb2f96'
    }
  ];

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-100/50">
        <div className="space-y-3">
          <Title level={2} className="mb-0 text-slate-800 font-bold text-3xl tracking-tight">
            Settings
          </Title>
          <Text className="text-slate-600 text-lg font-medium leading-relaxed">
            Configure your Smart Inventory Management System
          </Text>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="my-10">
        <Row gutter={[32, 32]}>
          {settingsCategories.map(category => (
            <Col xs={24} sm={12} lg={8} key={category.key}>
              <Card 
                className="h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                bodyStyle={{ padding: '40px' }}
              >
                <Link href={category.href}>
                  <div className="text-center">
                    <div 
                      className="mb-6 p-6 rounded-2xl inline-flex transition-transform group-hover:scale-110 duration-300 shadow-lg"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      {category.icon}
                    </div>
                    
                    <Title level={4} className="mb-3 text-slate-800 font-bold">
                      {category.title}
                    </Title>
                    
                    <Text className="block mb-6 text-slate-600 font-medium">
                      {category.description}
                    </Text>
                    
                    <Button 
                      type="primary" 
                      size="large"
                      className="h-12 px-8 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ backgroundColor: category.color, borderColor: category.color }}
                    >
                      Configure
                    </Button>
                  </div>
                  </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

              {/* Quick Actions */}
      <Card 
        title={
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <SettingOutlined className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-slate-800">Quick Actions</span>
          </div>
        }
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50"
      >
        <div className="p-4">
          <Space wrap size="large">
            <Button 
              icon={<DatabaseOutlined />} 
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Backup Data
            </Button>
            <Button 
              icon={<SettingOutlined />}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Export Settings
            </Button>
            <Button 
              icon={<BellOutlined />}
              size="large"
              className="h-12 px-6 bg-white/80 hover:bg-white border-slate-200 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Test Notifications
            </Button>
            <Button 
              type="primary" 
              icon={<UserOutlined />}
              size="large"
              className="h-12 px-6 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 border-none rounded-xl shadow-lg font-medium hover:shadow-xl transition-all duration-200"
            >
              Update Profile
            </Button>
          </Space>
        </div>
      </Card>
    </>
  );
} 