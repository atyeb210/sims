import React, { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Spin } from 'antd';

export const metadata = {
  title: 'Reset Password - Smart Inventory System',
  description: 'Reset your Smart Inventory System password',
};

function ResetPasswordFormWrapper() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        }>
          <ResetPasswordFormWrapper />
        </Suspense>
      </div>
    </div>
  );
} 