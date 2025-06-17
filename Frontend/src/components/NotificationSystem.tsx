import React from 'react';
import { Toaster } from 'react-hot-toast';

const NotificationSystem: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: 'white',
          color: '#374151',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        loading: {
          style: {
            background: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #dbeafe',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#eff6ff',
          },
        },
      }}
    />
  );
};

export default NotificationSystem; 