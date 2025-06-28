'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  DashboardOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  FileTextOutlined,
  AlertOutlined,
  TagsOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, Badge, Typography, Divider } from 'antd';
import { cn } from '@/utils/cn';
import { useInventoryStore } from '@/stores/inventoryStore';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    key: 'inventory',
    icon: <ShoppingOutlined />,
    label: 'Inventory',
    href: '/inventory',
    children: [
      {
        key: 'inventory-overview',
        icon: <ShopOutlined />,
        label: 'Overview',
        href: '/inventory',
      },
      {
        key: 'products',
        icon: <TagsOutlined />,
        label: 'Products',
        href: '/inventory/products',
      },
      {
        key: 'stock-levels',
        icon: <BarChartOutlined />,
        label: 'Stock Levels',
        href: '/inventory/stock-levels',
      },
      {
        key: 'transactions',
        icon: <SwapOutlined />,
        label: 'Transactions',
        href: '/inventory/transactions',
      },
    ],
  },
  {
    key: 'analytics',
    icon: <BarChartOutlined />,
    label: 'Analytics & Forecasting',
    href: '/analytics',
    children: [
      {
        key: 'forecasting-dashboard',
        icon: <DashboardOutlined />,
        label: 'Forecasting Dashboard',
        href: '/analytics',
      },
      {
        key: 'model-management',
        icon: <SettingOutlined />,
        label: 'Model Management',
        href: '/analytics#models',
      },
      {
        key: 'seasonal-analysis',
        icon: <BarChartOutlined />,
        label: 'Seasonal Analysis',
        href: '/analytics#seasonal',
      },
      {
        key: 'variant-analysis',
        icon: <TagsOutlined />,
        label: 'Size/Color Analysis',
        href: '/analytics#variants',
      },
    ],
  },
  {
    key: 'alerts',
    icon: <AlertOutlined />,
    label: 'Alerts',
    href: '/alerts',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    href: '/settings',
    children: [
      {
        key: 'account',
        icon: <UserOutlined />,
        label: 'Account',
        href: '/settings/account',
      },
      {
        key: 'locations',
        icon: <ShopOutlined />,
        label: 'Locations',
        href: '/settings/locations',
      },
      {
        key: 'categories',
        icon: <TagsOutlined />,
        label: 'Categories',
        href: '/settings/categories',
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const pathname = usePathname();
  const { unreadAlertsCount } = useInventoryStore();

  // Handle client-side hash to prevent hydration errors
  useEffect(() => {
    setCurrentHash(window.location.hash);
    
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const getSelectedKeys = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Handle analytics hash routes
    if (pathname === '/analytics') {
      if (currentHash === '#models') return ['model-management'];
      if (currentHash === '#seasonal') return ['seasonal-analysis'];
      if (currentHash === '#variants') return ['variant-analysis'];
      return ['forecasting-dashboard']; // Default analytics tab
    }
    
    // For nested routes, find the most specific match
    for (let i = pathSegments.length; i > 0; i--) {
      const currentPath = '/' + pathSegments.slice(0, i).join('/');
      
      // Check all navigation items including nested ones
      for (const item of navigationItems) {
        if (item.href === currentPath) {
          return [item.key];
        }
        
        if (item.children) {
          for (const child of item.children) {
            // Handle exact path match
            if (child.href === currentPath) {
              return [child.key];
            }
            // Handle hash routes
            if (child.href.includes('#') && child.href.split('#')[0] === currentPath) {
              const expectedHash = '#' + child.href.split('#')[1];
              if (currentHash === expectedHash) {
                return [child.key];
              }
            }
          }
        }
      }
    }
    
    return ['inventory-overview']; // Default selection
  };

  const getOpenKeys = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const openKeys: string[] = [];
    
    for (const item of navigationItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          const childPath = child.href.split('#')[0]; // Remove hash for comparison
          return pathname.startsWith(childPath) || pathname === childPath;
        });
        
        if (hasActiveChild || pathname.startsWith(item.href)) {
          openKeys.push(item.key);
        }
      }
    }
    
    return openKeys;
  };

  const renderMenuItem = (item: NavigationItem): any => {
    const isActive = pathname === item.href || 
                    (item.children && item.children.some(child => pathname.startsWith(child.href)));
    
    let badge = item.badge;
    if (item.key === 'alerts' && unreadAlertsCount > 0) {
      badge = unreadAlertsCount;
    }

    const menuItem: any = {
      key: item.key,
      icon: item.icon,
      label: (
        <Link href={item.href} className="flex items-center justify-between">
          <span>{item.label}</span>
          {badge && badge > 0 && (
            <Badge count={badge} size="small" />
          )}
        </Link>
      ),
      children: item.children?.map(renderMenuItem),
    };

    return menuItem;
  };

  const menuItems = navigationItems.map(renderMenuItem);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={280}
      collapsedWidth={80}
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/30">
          {!collapsed && (
            <div className="flex items-center space-x-3 transition-all duration-300 ease-in-out">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
                <ShoppingOutlined className="text-white text-xl" />
              </div>
              <div>
                <Text className="text-white font-bold text-lg tracking-tight">
                  Smart Inventory
                </Text>
                <Text className="text-slate-400 text-xs font-medium block">
                  Management System
                </Text>
              </div>
            </div>
          )}
          
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50 border-none transition-all duration-200 rounded-lg p-2"
          />
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            className="bg-transparent border-none [&_.ant-menu-item]:rounded-lg [&_.ant-menu-item]:mx-1 [&_.ant-menu-item]:mb-1 [&_.ant-menu-submenu-title]:rounded-lg [&_.ant-menu-submenu-title]:mx-1 [&_.ant-menu-submenu-title]:mb-1"
            style={{
              background: 'transparent',
            }}
            theme="dark"
          />
        </div>

        {/* User Section */}
        <div className="border-t border-secondary-700 p-4">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <UserOutlined className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <Text className="text-white font-medium block truncate">
                  John Doe
                </Text>
                <Text className="text-secondary-400 text-xs block truncate">
                  Admin
                </Text>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <UserOutlined className="text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Sider>
  );
}; 