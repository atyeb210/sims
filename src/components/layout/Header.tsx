'use client';

import React, { useState } from 'react';
import { 
  Layout, 
  Input, 
  Button, 
  Badge, 
  Dropdown, 
  Avatar, 
  Typography, 
  Space,
  Breadcrumb,
  Switch,
  Divider
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  QuestionCircleOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { cn } from '@/utils/cn';
import { useInventoryStore } from '@/stores/inventoryStore';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  className?: string;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
}

export const Header: React.FC<HeaderProps> = ({ className, breadcrumbs = [] }) => {
  const [searchValue, setSearchValue] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { unreadAlertsCount } = useInventoryStore();

  // Mock user data - replace with actual auth context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    avatar: undefined,
  };

  // Mock notifications - replace with actual notifications from store
  const notifications = [
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Denim Jacket (SKU: DJ001) is running low (5 units remaining)',
      time: '2 minutes ago',
      type: 'warning',
      unread: true,
    },
    {
      id: '2',
      title: 'Reorder Point Reached',
      message: 'Cotton T-Shirt (SKU: CT002) has reached reorder point',
      time: '1 hour ago',
      type: 'info',
      unread: true,
    },
    {
      id: '3',
      title: 'Stock Updated',
      message: 'Inventory levels updated for Summer Collection',
      time: '3 hours ago',
      type: 'success',
      unread: false,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
    },
    {
      key: 'preferences',
      icon: <SettingOutlined />,
      label: 'Preferences',
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
    },
  ];

  const notificationItems: MenuProps['items'] = [
    {
      key: 'header',
      label: (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Text strong>Notifications</Text>
            <Button type="link" size="small" className="p-0">
              Mark all as read
            </Button>
          </div>
        </div>
      ),
      disabled: true,
    },
    ...notifications.map(notification => ({
      key: notification.id,
      label: (
        <div className={cn(
          'px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0',
          notification.unread && 'bg-blue-50'
        )}>
          <div className="flex items-start space-x-3">
            <div className={cn(
              'w-2 h-2 rounded-full mt-2 flex-shrink-0',
              notification.type === 'warning' && 'bg-amber-500',
              notification.type === 'info' && 'bg-blue-500',
              notification.type === 'success' && 'bg-green-500',
              !notification.unread && 'bg-gray-300'
            )} />
            <div className="flex-1 min-w-0">
              <Text strong className="block text-sm">
                {notification.title}
              </Text>
              <Text className="text-xs text-gray-600 block mt-1">
                {notification.message}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {notification.time}
              </Text>
            </div>
          </div>
        </div>
      ),
    })),
    {
      key: 'footer',
      label: (
        <div className="px-4 py-3 border-t border-gray-200 text-center">
          <Button type="link" size="small" className="p-0">
            View all notifications
          </Button>
        </div>
      ),
      disabled: true,
    },
  ];

  const handleSearch = (value: string) => {
    console.log('Search:', value);
  };

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        console.log('Navigate to profile');
        break;
      case 'preferences':
        console.log('Navigate to preferences');
        break;
      case 'help':
        console.log('Navigate to help');
        break;
      case 'logout':
        console.log('Sign out');
        break;
    }
  };

  const handleNotificationClick: MenuProps['onClick'] = ({ key }) => {
    if (key !== 'header' && key !== 'footer') {
      console.log('Notification clicked:', key);
    }
  };

  return (
    <AntHeader 
      className={cn(
        'bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm h-16',
        className
      )}
      style={{ padding: '0 24px', height: '64px' }}
    >
      {/* Left Section - Breadcrumbs */}
      <div className="flex-1 min-w-0">
        {breadcrumbs.length > 0 && (
          <Breadcrumb
            items={breadcrumbs.map(breadcrumb => ({
              title: breadcrumb.href ? (
                <a href={breadcrumb.href}>{breadcrumb.title}</a>
              ) : (
                breadcrumb.title
              ),
            }))}
            className="text-sm"
          />
        )}
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <Input
          placeholder="Search products, SKUs, or categories..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={() => handleSearch(searchValue)}
          size="middle"
          className="w-full"
        />
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-2">
          <SunOutlined className="text-gray-500" />
          <Switch
            size="small"
            checked={darkMode}
            onChange={setDarkMode}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>

        {/* Notifications */}
        <Dropdown
          menu={{
            items: notificationItems,
            onClick: handleNotificationClick,
          }}
          trigger={['click']}
          placement="bottomRight"
          arrow
          overlayClassName="w-80"
        >
          <Button
            type="text"
            icon={
              <Badge count={unreadAlertsCount} size="small" offset={[4, -4]}>
                <BellOutlined className="text-lg" />
              </Badge>
            }
            className="flex items-center justify-center"
          />
        </Dropdown>

        {/* User Menu */}
        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
          trigger={['click']}
          placement="bottomRight"
          arrow
        >
          <Button
            type="text"
            className="flex items-center space-x-2 px-2 hover:bg-gray-50"
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={user.avatar}
              className="bg-primary-600"
            />
            <div className="hidden md:block text-left">
              <Text className="text-sm font-medium block leading-none">
                {user.name}
              </Text>
              <Text className="text-xs text-gray-500 block leading-none mt-1">
                {user.role}
              </Text>
            </div>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}; 