import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry = null,
  retryText = 'Retry'
}) => {
  return (
    <div
      style={{
        width: '100%',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--danger-border)',
        backgroundColor: 'var(--danger-light)',
        color: '#991b1b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.85rem',
        margin: '1.5rem 0'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)'
        }}
      >
        <AlertCircle size={28} />
      </div>

      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h4>
        <p style={{ fontSize: '0.875rem', color: '#b91c1c', maxWidth: '480px' }}>{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-danger btn-sm"
          style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} />
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
