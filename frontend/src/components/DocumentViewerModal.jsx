import React, { useEffect } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

export const getFileViewUrl = (filePath) => {
  if (!filePath) return '#';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  if (typeof window !== 'undefined' && window.location.port && window.location.port !== '8000') {
    return `http://localhost:8000${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  }
  return filePath.startsWith('/') ? filePath : `/${filePath}`;
};

const DocumentViewerModal = ({ isOpen, onClose, file }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const rawPath = file.file_path || file.url || '';
  const fileUrl = getFileViewUrl(rawPath);
  const title = file.title || file.file_name || 'Document Viewer';
  const fileName = file.file_name || (rawPath ? rawPath.split('/').pop() : 'document');
  const ext = (fileName.includes('.') ? fileName.split('.').pop() : '').toLowerCase();

  const isPdf = ext === 'pdf' || file.file_type === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || file.file_type === 'image';
  const isText = ['txt', 'csv', 'log', 'json', 'py', 'js', 'html', 'md'].includes(ext);
  const isOfficeDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext) || ['doc', 'ppt'].includes(file.file_type);

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          width: '95vw',
          maxWidth: '1050px',
          height: '90vh',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '0.9rem 1.25rem',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: 'var(--bg-main, #f8fafc)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isPdf ? '#fee2e2' : isImage ? '#e0e7ff' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={18} color={isPdf ? '#ef4444' : isImage ? '#4f46e5' : '#64748b'} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-main, #0f172a)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={title}
              >
                {title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  {ext ? ext.toUpperCase() : 'DOCUMENT'}
                </span>
                {file.file_size && <span>• {file.file_size}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons in header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '0.35rem' }}
              title="Open full page in a new browser tab"
            >
              <ExternalLink size={13} />
              <span>Open in New Tab</span>
            </a>

            <a
              href={fileUrl}
              download={fileName}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', gap: '0.35rem' }}
              title="Download file to computer"
            >
              <Download size={13} />
              <span>Download</span>
            </a>

            <button
              onClick={onClose}
              type="button"
              className="btn btn-outline btn-sm"
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px'
              }}
              title="Close Viewer (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              title={title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          ) : isImage ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                backgroundColor: '#1e293b'
              }}
            >
              <img
                src={fileUrl}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
              />
            </div>
          ) : isText ? (
            <iframe
              src={fileUrl}
              title={title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          ) : isOfficeDoc ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Microsoft Office Document ({ext.toUpperCase()})
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                This is a <strong>.{ext.toUpperCase()}</strong> file. You can download and view it with Microsoft Office, Google Docs, or your preferred office suite.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <a
                  href={fileUrl}
                  download={fileName}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem' }}
                >
                  <Download size={15} />
                  <span>Download Document</span>
                </a>
                <button onClick={onClose} className="btn btn-outline">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={fileUrl}
              title={title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
