import React, { useState, useEffect } from 'react';
import { Video, Play, ExternalLink, BookOpen, Search, Filter, X, Sparkles, Layers } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const CourseVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentVideos();
      setVideos(res.data || []);
    } catch (err) {
      setError('Failed to fetch course lecture videos.');
    } finally {
      setLoading(false);
    }
  };

  // Distinct courses for filtering
  const courses = Array.from(new Set(videos.map(v => v.course_code || v.course_title).filter(Boolean)));

  const filteredVideos = videos.filter(v => {
    const matchesCourse = selectedCourse === 'ALL' || v.course_code === selectedCourse || v.course_title === selectedCourse;
    const matchesSearch = !searchQuery || 
      v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.module_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  if (loading) return <LoadingSpinner message="Loading course lecture videos..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchVideos} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Video Lectures</h1>
          <p className="page-subtitle">Watch curated video lectures and tutorials for your enrolled courses</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search lectures by topic or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          {/* Course Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="ALL">All Enrolled Courses</option>
              {courses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No Course Videos Found"
          description={videos.length === 0 ? "Faculty has not published any YouTube videos for your enrolled courses yet." : "No videos match your search or filter criteria."}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredVideos.map((video) => {
            const embedUrl = getYouTubeEmbedUrl(video.url);
            return (
              <div key={video.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
                {/* Video Preview / Embed Thumbnail */}
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0f172a' }}>
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={video.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: '#94a3b8'
                      }}
                    >
                      <Video size={40} />
                      <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>External Video</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        {video.course_code || 'Course'}
                      </span>
                      {video.module_title && (
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                          {video.module_title}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', lineHeight: 1.4 }}>
                      {video.title}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Course: {video.course_title}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      {video.created_at || 'Curriculum Video'}
                    </span>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                    >
                      <ExternalLink size={13} />
                      <span>Watch on YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseVideos;
