'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Card, Alert, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (values: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setSubmittedEmail(values.email);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto" bordered={false}>
        <Result
          status="success"
          title="Check Your Email"
          subTitle={
            <div className="text-center">
              <p>
                We've sent a password reset link to <strong>{submittedEmail}</strong>
              </p>
              <p className="text-gray-600 mt-2">
                The link will expire in 1 hour for security reasons.
              </p>
              <p className="text-gray-600 mt-2">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          }
          extra={[
            <Button type="primary" key="login">
              <Link href="/auth/login">
                <ArrowLeftOutlined /> Back to Login
              </Link>
            </Button>,
            <Button key="retry" onClick={() => setEmailSent(false)}>
              Try Different Email
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Reset Your Password"
      className="w-full max-w-md mx-auto"
      bordered={false}
    >
      <div className="text-center mb-6 text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      <Form
        form={form}
        name="forgotPassword"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        autoComplete="off"
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter your email address"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full"
            size="large"
          >
            Send Reset Link
          </Button>
        </Form.Item>

        <div className="text-center mt-4">
          <Link 
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            <ArrowLeftOutlined className="mr-1" />
            Back to Login
          </Link>
        </div>
      </Form>
    </Card>
  );
} 