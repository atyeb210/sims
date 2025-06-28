'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Result, Button, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function EmailVerificationContent() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setError(data.error || 'Email verification failed');
        }
      } catch (err) {
        console.error('Email verification error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, email, router]);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto" bordered={false}>
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">
            Verifying your email address...
          </div>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto" bordered={false}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          status="success"
          title="Email Verified Successfully"
          subTitle={
            <div className="text-center">
              <p>Your email address has been verified.</p>
              <p className="text-gray-600 mt-2">
                You will be redirected to the dashboard in 3 seconds.
              </p>
            </div>
          }
          extra={[
            <Button type="primary" key="dashboard">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" bordered={false}>
      <Result
        icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
        status="error"
        title="Email Verification Failed"
        subTitle={
          <div className="text-center">
            <p>{error}</p>
            <p className="text-gray-600 mt-2">
              The verification link may have expired or is invalid.
            </p>
          </div>
        }
        extra={[
          <Button type="primary" key="login">
            <Link href="/auth/login">
              Back to Login
            </Link>
          </Button>,
          <Button key="signup">
            <Link href="/auth/signup">
              Try Signing Up Again
            </Link>
          </Button>,
        ]}
      />
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <Card className="w-full max-w-md mx-auto" bordered={false}>
            <div className="text-center py-8">
              <Spin size="large" />
              <div className="mt-4 text-gray-600">
                Loading...
              </div>
            </div>
          </Card>
        }>
          <EmailVerificationContent />
        </Suspense>
      </div>
    </div>
  );
} 