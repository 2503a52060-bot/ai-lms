import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, ExternalLink, FileText, Clock, Layers, Sparkles, Video, Eye } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DocumentViewerModal, { getFileViewUrl } from '../../components/DocumentViewerModal';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const CourseMaterials = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModule, setActiveModule] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const [matRes, vidRes] = await Promise.all([
        api.getCourseMaterials(id),
        api.getStudentCourseVideos(id)
      ]);
      setData(matRes.data);
      setVideos(vidRes.data || []);
      if (matRes.data?.modules?.length > 0) {
        setActiveModule(matRes.data.modules[0].id);
      }
    } catch (err) {
      setError('Failed to fetch course materials. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const getFileDownloadUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    return filePath;
  };

  if (loading) return <LoadingSpinner message="Loading course curriculum &amp; modules..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMaterials} />;

  const { course, modules, general_resources } = data || {};

  return (
    <div className="page-container">
      <button
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '1.25rem' }}
        onClick={() => navigate('/student/courses')}
      >
        <ArrowLeft size={16} />
        <span>Back to Courses</span>
      </button>

      <div className="ai-banner" style={{ marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="ai-pill">{course?.code || 'CS301'}</span>
            <span style={{ fontSize: '0.8rem', color: '#c7d2fe' }}>Sequential Syllabus View</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{course?.title}</h2>
          <p style={{ fontSize: '0.85rem', color: '#e0e7ff', marginTop: '0.25rem' }}>
            Instructor: {course?.faculty_name || 'Prof. Alan Turing'}
          </p>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Left: Sequential Learning Modules */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary)" />
            <span>Sequential Learning Modules</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {modules && modules.map((m, index) => {
              const isOpen = activeModule === m.id;
              return (
                <div key={m.id} className="card" style={{ padding: '1.25rem' }}>
                  <div
                    onClick={() => setActiveModule(isOpen ? null : m.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-primary">Step {index + 1}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} /> {m.duration}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {m.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>

                  {isOpen && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                        {m.description}
                      </p>

                      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                        Faculty Uploaded Materials &amp; Resources ({m.resources?.length || 0})
                      </h5>

                      {m.resources && m.resources.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {m.resources.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.65rem 0.85rem',
                                backgroundColor: 'var(--bg-main)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <FileText size={16} color="var(--primary)" />
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {r.title}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {r.resource_type === 'file' ? `${r.file_type?.toUpperCase()} • ${r.file_size || 'File'}` : 'External Resource URL'}
                                  </div>
                                </div>
                              </div>

                              {r.resource_type === 'file' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => setViewingFile(r)}
                                    className="btn btn-primary btn-sm"
                                    style={{ gap: '0.35rem', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                    title="View/Open File directly in website"
                                  >
                                    <Eye size={14} />
                                    <span>View/Open</span>
                                  </button>
                                  <a
                                    href={getFileViewUrl(r.file_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="btn btn-outline btn-sm"
                                    style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                                    title="Download File"
                                  >
                                    <Download size={14} />
                                    <span>Download</span>
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline btn-sm"
                                  style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                                >
                                  <ExternalLink size={14} />
                                  <span>Open URL</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                          No files uploaded for this module yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: General Course Files & AI Tutor Quick Access */}
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Course Syllabus &amp; General Resources
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {general_resources && general_resources.length > 0 ? (
                general_resources.map((gr) => (
                  <div
                    key={gr.id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{gr.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {gr.resource_type === 'file'
                          ? (gr.file_size || 'Document File')
                          : gr.resource_type === 'video'
                          ? 'Video Lecture Link'
                          : 'External Resource'}
                      </div>
                    </div>
                    {gr.resource_type === 'file' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => setViewingFile(gr)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', gap: '0.25rem' }}
                          title="View/Open File in Website"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <a
                          href={getFileViewUrl(gr.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.45rem' }}
                          title="Download File"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    ) : (
                      <a
                        href={gr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        title={gr.resource_type === 'video' ? 'Watch Video' : 'Open Link'}
                      >
                        {gr.resource_type === 'video' ? <Video size={13} /> : <ExternalLink size={13} />}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  All syllabus materials are structured under modules.
                </div>
              )}
            </div>
          </div>

          {/* Course Video Lectures Card */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Video size={16} color="var(--primary)" />
                <span>Course Videos ({videos.length})</span>
              </h4>
              <button
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => navigate('/student/videos')}
              >
                All Videos
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {videos && videos.length > 0 ? (
                videos.map((vid) => (
                  <div
                    key={vid.id}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {vid.title}
                    </div>
                    {vid.module_title && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                        {vid.module_title}
                      </div>
                    )}
                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                    >
                      <ExternalLink size={13} />
                      <span>Watch Lecture Video</span>
                    </a>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No video lectures published for this course yet.
                </div>
              )}
            </div>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
              border: '1px solid var(--primary-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                Have a Doubt on this Module?
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Ask the integrated AI Doubt Assistant for step-by-step algorithms, complexity calculations, or code examples.
            </p>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() => navigate('/student/doubt')}
            >
              Open AI Doubt Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Embedded In-Website Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={!!viewingFile}
        onClose={() => setViewingFile(null)}
        file={viewingFile}
      />
    </div>
  );
};

export default CourseMaterials;
