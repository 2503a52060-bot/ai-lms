import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, ExternalLink, Filter, Edit2, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import DocumentViewerModal, { getFileViewUrl } from '../../components/DocumentViewerModal';

const CourseFiles = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [viewingFile, setViewingFile] = useState(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', url: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.getFacultyCourses();
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseId(list[0].id);
        fetchFiles(list[0].id);
      }
    } catch (err) {
      setError('Failed to fetch faculty courses.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (courseId) => {
    try {
      const res = await api.getCourseFiles(courseId);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    fetchFiles(courseId);
  };

  const canManageResource = (f) => {
    if (!user) return false;
    if (f.uploader_id && f.uploader_id === user.id) return true;
    const currentCourse = courses.find(c => String(c.id) === String(selectedCourseId));
    if (!f.uploader_id && currentCourse && currentCourse.faculty_id === user.id) return true;
    return false;
  };

  const handleOpenEdit = (f) => {
    setEditingResource(f);
    setEditForm({
      title: f.title || '',
      url: f.url || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      const payload = {
        title: editForm.title.trim()
      };
      if (editingResource.resource_type === 'url') {
        payload.url = editForm.url.trim();
      }
      await api.updateResource(editingResource.id, payload);
      setSuccessMsg('Resource updated successfully!');
      setShowEditModal(false);
      setEditingResource(null);
      fetchFiles(selectedCourseId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update resource');
    }
  };

  const handleDelete = async (resId) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await api.deleteResource(resId);
      setSuccessMsg('Resource deleted successfully!');
      fetchFiles(selectedCourseId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete file.');
    }
  };

  if (loading && courses.length === 0) return <LoadingSpinner message="Loading course files archive..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Files Archive</h1>
          <p className="page-subtitle">Repository of all lecture presentations, documents, code templates, and PDFs</p>
        </div>

        <div style={{ width: '280px' }}>
          <select
            className="form-select"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            {(Array.isArray(courses) ? courses : []).map(c => (
              <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <span>{error}</span>
        </div>
      )}

      {(Array.isArray(files) ? files : []).length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Files Uploaded Yet"
          description="Go to Course &amp; Module Management to upload course slides, PDFs, or code archives."
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Category</th>
                <th>Belongs to Module</th>
                <th>File Size</th>
                <th>Date Added</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(files) ? files : []).map(f => (
                <tr key={f.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FileText size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{f.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.file_name || f.url}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      {f.resource_type === 'file' ? (f.file_type?.toUpperCase() || 'FILE') : 'EXTERNAL URL'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {f.module_title || 'General'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{f.file_size || '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.created_at}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {f.resource_type === 'file' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setViewingFile(f)}
                            className="btn btn-primary btn-sm"
                            style={{ gap: '0.25rem' }}
                            title="View/Open File in Website"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <a
                            href={getFileViewUrl(f.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="btn btn-outline btn-sm"
                            style={{ gap: '0.25rem' }}
                            title="Download File"
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </a>
                        </>
                      ) : (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ gap: '0.25rem' }}
                        >
                          <ExternalLink size={13} />
                          <span>Open</span>
                        </a>
                      )}
                      {canManageResource(f) && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(f)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.5rem' }}
                            title="Edit Resource"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', padding: '0.2rem 0.5rem' }}
                            title="Delete Resource"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Edit Resource */}
      {showEditModal && editingResource && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>
                Edit {editingResource.resource_type === 'file' ? 'Attached File' : 'Resource URL'}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingResource(null);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resource Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                {editingResource.resource_type === 'url' && (
                  <div className="form-group">
                    <label className="form-label">Resource URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingResource(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded In-Website Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewingFile}
        onClose={() => setViewingFile(null)}
        file={viewingFile}
      />
    </div>
  );
};

export default CourseFiles;
