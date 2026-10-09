import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Layers, Upload, Link as LinkIcon, Trash2, ExternalLink, Download, FileText, CheckCircle2, Clock, Video, Edit2, Eye, UserPlus, Users, Search, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DocumentViewerModal, { getFileViewUrl } from '../../components/DocumentViewerModal';

const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modulesData, setModulesData] = useState([]);
  const [generalResources, setGeneralResources] = useState([]);
  const [courseVideos, setCourseVideos] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('available'); // 'available', 'all', 'enrolled'
  const [enrollingLoading, setEnrollingLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);

  // Form states
  const [courseForm, setCourseForm] = useState({ code: '', title: '', description: '', credits: 3, semester: 'Semester 5', department: 'Computer Science & Engineering' });
  const [moduleForm, setModuleForm] = useState({ title: '', duration: '2 Weeks', description: '' });
  const [moduleFiles, setModuleFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [targetModuleId, setTargetModuleId] = useState('');
  const [urlForm, setUrlForm] = useState({ title: '', url: '', moduleId: '' });
  const [videoForm, setVideoForm] = useState({ title: '', url: '', moduleId: '' });
  const [resourceEditForm, setResourceEditForm] = useState({ title: '', url: '', moduleId: '' });

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
        selectCourse(list[0]);
      }
    } catch (err) {
      setError('Failed to fetch faculty courses.');
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      const [modRes, vidRes, stdRes] = await Promise.all([
        api.getFacultyCourseModules(course.id),
        api.getFacultyCourseVideos(course.id),
        api.getCourseStudents(course.id)
      ]);
      const mods = Array.isArray(modRes.data?.modules)
        ? modRes.data.modules
        : Array.isArray(modRes.data)
        ? modRes.data
        : [];
      const genRes = Array.isArray(modRes.data?.general_resources)
        ? modRes.data.general_resources
        : [];
      setModulesData(mods);
      setGeneralResources(genRes);
      setCourseVideos(Array.isArray(vidRes.data) ? vidRes.data : []);
      const enrolled = Array.isArray(stdRes.data?.enrolled_students) ? stdRes.data.enrolled_students : [];
      setEnrolledStudents(enrolled);
      setAllStudents(Array.isArray(stdRes.data?.all_students) ? stdRes.data.all_students : []);
      if (stdRes.data?.course?.students_count !== undefined) {
        setSelectedCourse(prev => prev ? { ...prev, students_count: stdRes.data.course.students_count } : prev);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      const res = await api.getCourseStudents(courseId);
      const enrolled = Array.isArray(res.data?.enrolled_students) ? res.data.enrolled_students : [];
      setEnrolledStudents(enrolled);
      setAllStudents(Array.isArray(res.data?.all_students) ? res.data.all_students : []);
      const count = res.data?.course?.students_count ?? enrolled.length;
      setSelectedCourse(prev => prev ? { ...prev, students_count: count } : prev);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, students_count: count } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddStudents = async () => {
    if (!selectedCourse) return;
    try {
      const res = await api.getCourseStudents(selectedCourse.id);
      const enrolled = Array.isArray(res.data?.enrolled_students) ? res.data.enrolled_students : [];
      const allStd = Array.isArray(res.data?.all_students) ? res.data.all_students : [];
      setEnrolledStudents(enrolled);
      setAllStudents(allStd);
      setSelectedStudentIds([]);
      setStudentSearch('');
      setStudentFilter('available');
      setShowAddStudentsModal(true);
    } catch (err) {
      setError('Failed to fetch student directory for course enrollment.');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllAvailable = (listToSelect) => {
    const ids = listToSelect.filter(s => !s.is_enrolled).map(s => s.id);
    setSelectedStudentIds(ids);
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleEnrollStudentsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || selectedStudentIds.length === 0) return;
    try {
      setEnrollingLoading(true);
      setError('');
      const res = await api.enrollStudentsInCourse(selectedCourse.id, selectedStudentIds);
      setSuccessMsg(res.data?.message || 'Students successfully enrolled into course!');
      setShowAddStudentsModal(false);
      setSelectedStudentIds([]);

      const updatedEnrolled = Array.isArray(res.data?.enrolled_students) ? res.data.enrolled_students : [];
      setEnrolledStudents(updatedEnrolled);
      const totalCount = res.data?.total_students_count ?? updatedEnrolled.length;

      setSelectedCourse(prev => prev ? { ...prev, students_count: totalCount } : prev);
      setCourses(prev =>
        prev.map(c =>
          c.id === selectedCourse.id
            ? { ...c, students_count: totalCount }
            : c
        )
      );
      // Re-fetch students and all directory to keep in sync
      fetchCourseStudents(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll students into course.');
    } finally {
      setEnrollingLoading(false);
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      const res = await api.unenrollStudentFromCourse(selectedCourse.id, studentId);
      setSuccessMsg(res.data?.message || 'Student removed from course.');
      const updatedEnrolled = Array.isArray(res.data?.enrolled_students)
        ? res.data.enrolled_students
        : enrolledStudents.filter(s => s.id !== studentId);
      setEnrolledStudents(updatedEnrolled);
      const totalCount = res.data?.total_students_count ?? updatedEnrolled.length;

      setSelectedCourse(prev => prev ? { ...prev, students_count: totalCount } : prev);
      setCourses(prev =>
        prev.map(c =>
          c.id === selectedCourse.id
            ? { ...c, students_count: totalCount }
            : c
        )
      );
      fetchCourseStudents(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove student from course.');
    }
  };

  const fetchCourseVideos = async (courseId) => {
    try {
      const res = await api.getFacultyCourseVideos(courseId);
      setCourseVideos(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({ title: '', url: '', moduleId: '' });
    setShowVideoModal(true);
  };

  const handleOpenEditVideo = (video) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      url: video.url,
      moduleId: video.module_id ? String(video.module_id) : ''
    });
    setShowVideoModal(true);
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const payload = {
        title: videoForm.title.trim(),
        url: videoForm.url.trim(),
        module_id: videoForm.moduleId ? parseInt(videoForm.moduleId) : null
      };

      if (editingVideo) {
        await api.updateCourseVideo(editingVideo.id, payload);
        setSuccessMsg('Course video updated successfully!');
      } else {
        await api.addCourseVideo(selectedCourse.id, payload);
        setSuccessMsg('YouTube video added to course successfully!');
      }

      setShowVideoModal(false);
      setEditingVideo(null);
      setVideoForm({ title: '', url: '', moduleId: '' });
      fetchCourseVideos(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this course video?')) return;
    try {
      await api.deleteCourseVideo(videoId);
      setSuccessMsg('Course video deleted successfully!');
      if (selectedCourse) fetchCourseVideos(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete video');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse(courseForm);
      setSuccessMsg('Course created successfully!');
      setShowCourseModal(false);
      setCourseForm({ code: '', title: '', description: '', credits: 3, semester: 'Semester 5', department: 'Computer Science & Engineering' });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      if (moduleFiles && moduleFiles.length > 0) {
        const formData = new FormData();
        formData.append('title', moduleForm.title.trim());
        formData.append('duration', moduleForm.duration ? moduleForm.duration.trim() : '2 Weeks');
        if (moduleForm.description) {
          formData.append('description', moduleForm.description.trim());
        }
        for (const file of moduleFiles) {
          formData.append('files', file);
        }
        await api.addCourseModule(selectedCourse.id, formData);
      } else {
        await api.addCourseModule(selectedCourse.id, {
          title: moduleForm.title.trim(),
          duration: moduleForm.duration ? moduleForm.duration.trim() : '2 Weeks',
          description: moduleForm.description ? moduleForm.description.trim() : ''
        });
      }
      setSuccessMsg('Sequential module and attached materials saved successfully!');
      setShowModuleModal(false);
      setModuleForm({ title: '', duration: '2 Weeks', description: '' });
      setModuleFiles([]);
      selectCourse(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add module');
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !uploadFile) return;

    try {
      const formData = new FormData();
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('file', uploadFile);
      if (targetModuleId) formData.append('module_id', targetModuleId);

      await api.uploadCourseResource(selectedCourse.id, formData);
      setSuccessMsg('File uploaded and linked to module successfully!');
      setShowFileUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      selectCourse(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.detail || 'File upload failed');
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await api.addUrlResource(selectedCourse.id, {
        course_id: selectedCourse.id,
        module_id: urlForm.moduleId ? parseInt(urlForm.moduleId) : null,
        title: urlForm.title,
        url: urlForm.url
      });
      setSuccessMsg('Resource URL linked!');
      setShowUrlModal(false);
      setUrlForm({ title: '', url: '', moduleId: '' });
      selectCourse(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to link URL');
    }
  };

  const handleDeleteResource = async (resId) => {
    if (!window.confirm('Delete this resource permanently?')) return;
    try {
      await api.deleteResource(resId);
      setSuccessMsg('Resource removed.');
      if (selectedCourse) selectCourse(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete resource.');
    }
  };

  const canManageResource = (res) => {
    if (!user) return false;
    if (res.uploader_id && res.uploader_id === user.id) return true;
    if (!res.uploader_id && selectedCourse && selectedCourse.faculty_id === user.id) return true;
    return false;
  };

  const handleOpenEditResource = (res) => {
    setEditingResource(res);
    setResourceEditForm({
      title: res.title || '',
      url: res.url || '',
      moduleId: res.module_id ? String(res.module_id) : ''
    });
    setShowEditResourceModal(true);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editingResource) return;
    try {
      const payload = {
        title: resourceEditForm.title.trim(),
        module_id: resourceEditForm.moduleId ? parseInt(resourceEditForm.moduleId) : null
      };
      if (editingResource.resource_type === 'url') {
        payload.url = resourceEditForm.url.trim();
      }
      await api.updateResource(editingResource.id, payload);
      setSuccessMsg('Resource updated successfully!');
      setShowEditResourceModal(false);
      setEditingResource(null);
      if (selectedCourse) selectCourse(selectedCourse);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update resource');
    }
  };

  if (loading && !selectedCourse) return <LoadingSpinner message="Loading courses and curriculum..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course &amp; Module Management</h1>
          <p className="page-subtitle">Organize sequential learning modules, syllabi, notes, and uploaded resources</p>
        </div>

        <button onClick={() => setShowCourseModal(true)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} />
          <span>Create New Course</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Course Selection Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {(Array.isArray(courses) ? courses : []).map(c => (
          <button
            key={c.id}
            onClick={() => selectCourse(c)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: selectedCourse?.id === c.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: selectedCourse?.id === c.id ? 'var(--primary-light)' : '#ffffff',
              cursor: 'pointer',
              textAlign: 'left',
              minWidth: '220px'
            }}
          >
            <span className="badge badge-primary" style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>{c.code}</span>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{c.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.students_count || 0} Students Enrolled</div>
          </button>
        ))}
      </div>

      {selectedCourse && (
        <div className="grid-2-1">
          {/* Modules Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={18} color="var(--primary)" />
                <span>Sequential Learning Modules ({(Array.isArray(modulesData) ? modulesData : []).length})</span>
              </h3>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setModuleForm({ title: '', duration: '2 Weeks', description: '' });
                    setModuleFiles([]);
                    setShowModuleModal(true);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Plus size={14} />
                  <span>Add Module</span>
                </button>
                <button onClick={() => setShowFileUploadModal(true)} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                  <Upload size={14} />
                  <span>Upload File</span>
                </button>
                <button onClick={() => setShowUrlModal(true)} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                  <LinkIcon size={14} />
                  <span>Add URL</span>
                </button>
                <button onClick={handleOpenAddVideo} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                  <Video size={14} />
                  <span>Add Video</span>
                </button>
                <button
                  onClick={handleOpenAddStudents}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.35rem', backgroundColor: '#059669', borderColor: '#059669' }}
                  title="Enroll Students into this course"
                >
                  <UserPlus size={14} />
                  <span>Add Students</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(Array.isArray(modulesData) ? modulesData : []).map((m, idx) => (
                <div key={m.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className="badge badge-primary">Step {idx + 1}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {m.duration}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>{m.title}</h4>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {m.description}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Attached Files &amp; Resources ({m.resources?.length || 0})
                    </div>

                    {m.resources?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {m.resources.map(r => (
                          <div
                            key={r.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.55rem 0.75rem',
                              backgroundColor: 'var(--bg-main)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={15} color="var(--primary)" />
                              <div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.title}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                  {r.resource_type === 'file' ? `${r.file_size || 'File'}` : 'Link'}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              {r.resource_type === 'file' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setViewingFile(r)}
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '0.2rem 0.5rem', gap: '0.25rem', fontSize: '0.75rem' }}
                                    title="View/Open File in Website"
                                  >
                                    <Eye size={13} />
                                    <span>View</span>
                                  </button>
                                  <a
                                    href={getFileViewUrl(r.file_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '0.2rem 0.5rem' }}
                                    title="Download File"
                                  >
                                    <Download size={13} />
                                  </a>
                                </>
                              ) : (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '0.2rem 0.5rem' }}
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              {canManageResource(r) && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditResource(r)}
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '0.2rem 0.5rem' }}
                                    title="Edit Resource"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResource(r.id)}
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '0.2rem 0.5rem', color: 'var(--danger)' }}
                                    title="Delete Resource"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        No files uploaded in this module. Click &apos;Upload File&apos; above to add documents.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* General Course Materials (Syllabus & Core Files) */}
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <span>General Course Materials ({generalResources.length})</span>
                </h4>
              </div>

              {generalResources.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {generalResources.map(r => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.55rem 0.75rem',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={15} color="var(--primary)" />
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {r.resource_type === 'file' ? `${r.file_size || 'File'}` : 'Link'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {r.resource_type === 'file' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewingFile(r)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', gap: '0.25rem', fontSize: '0.75rem' }}
                              title="View/Open File in Website"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            <a
                              href={getFileViewUrl(r.file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.2rem 0.5rem' }}
                              title="Download File"
                            >
                              <Download size={13} />
                            </a>
                          </>
                        ) : (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.2rem 0.5rem' }}
                            title="Open Link"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {canManageResource(r) && (
                          <>
                            <button
                              onClick={() => handleOpenEditResource(r)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.2rem 0.5rem' }}
                              title="Edit Resource"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(r.id)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.2rem 0.5rem', color: 'var(--danger)' }}
                              title="Delete Resource"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                  No general syllabus files uploaded. Use &apos;Upload File&apos; or &apos;Add URL&apos; above without selecting a module.
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Course Info */}
          <div>
            <div className="card">
              <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>{selectedCourse.code}</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{selectedCourse.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {selectedCourse.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                <div><strong>Department:</strong> {selectedCourse.department}</div>
                <div><strong>Credits:</strong> {selectedCourse.credits} Credits</div>
                <div><strong>Term:</strong> {selectedCourse.semester} ({selectedCourse.academic_year})</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong>Enrolled Students:</strong> {selectedCourse.students_count ?? enrolledStudents.length ?? 0} Students</div>
                  <button
                    onClick={handleOpenAddStudents}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', gap: '0.3rem' }}
                    title="Enroll Students into this course"
                  >
                    <UserPlus size={13} />
                    <span>Add Students</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Course Enrolled Students Card */}
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Users size={16} color="var(--primary)" />
                  <span>Enrolled Students ({enrolledStudents.length})</span>
                </h4>
                <button
                  onClick={handleOpenAddStudents}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem', backgroundColor: '#059669', borderColor: '#059669' }}
                  title="Enroll students into this course"
                >
                  <UserPlus size={13} />
                  <span>Add Students</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {enrolledStudents.length > 0 ? (
                  enrolledStudents.map(s => (
                    <div
                      key={s.id}
                      style={{
                        padding: '0.65rem 0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-main)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.15rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>{s.identifier}</span>
                          <span>{s.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnenrollStudent(s.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.2rem 0.4rem', color: 'var(--danger)', borderColor: 'transparent' }}
                        title="Remove student from course"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      No students enrolled in this course yet.
                    </p>
                    <button
                      onClick={handleOpenAddStudents}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', gap: '0.3rem' }}
                    >
                      <UserPlus size={13} />
                      <span>Add Students Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Course YouTube Videos Card */}
            <div className="card" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Video size={16} color="var(--primary)" />
                  <span>Course Videos ({courseVideos.length})</span>
                </h4>
                <button
                  onClick={handleOpenAddVideo}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  <Plus size={13} />
                  <span>Add Video</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {(Array.isArray(courseVideos) ? courseVideos : []).length > 0 ? (
                  courseVideos.map(vid => (
                    <div
                      key={vid.id}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-main)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>
                            {vid.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {vid.module_title || 'General Course Video'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
                        >
                          <ExternalLink size={12} />
                          <span>Watch</span>
                        </a>

                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {canManageResource(vid) && (
                            <>
                              <button
                                onClick={() => handleOpenEditVideo(vid)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
                                title="Edit Video"
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(vid.id)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: 'var(--danger)' }}
                                title="Delete Video"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No lecture videos added yet. Click &apos;Add Video&apos; to link YouTube lectures.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Course */}
      {showCourseModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Create New Course</h3>
              <button onClick={() => setShowCourseModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS410"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Distributed Operating Systems"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    className="form-input"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })}
                    min="1"
                    max="6"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Module */}
      {showModuleModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Add Sequential Learning Module</h3>
              <button
                onClick={() => {
                  setShowModuleModal(false);
                  setModuleFiles([]);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Module Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Module 3: Graph Shortest Path Algorithms"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2 Weeks or 6 Lecture Hours"
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Learning Objectives / Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe topics covered in this module..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Materials / Files (PDF, PPT, DOC, Images)</label>
                  <input
                    type="file"
                    className="form-input"
                    multiple
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.zip"
                    onChange={(e) => setModuleFiles(Array.from(e.target.files || []))}
                  />
                  {moduleFiles.length > 0 && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Selected {moduleFiles.length} file{moduleFiles.length > 1 ? 's' : ''}: {moduleFiles.map(f => f.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowModuleModal(false);
                    setModuleFiles([]);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save Module</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload File */}
      {showFileUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Upload Module Resource File</h3>
              <button onClick={() => setShowFileUploadModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleUploadFile}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Target Module (Optional)</label>
                  <select
                    className="form-select"
                    value={targetModuleId}
                    onChange={(e) => setTargetModuleId(e.target.value)}
                  >
                    <option value="">General Course Files (No specific module)</option>
                    {(Array.isArray(modulesData) ? modulesData : []).map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Resource Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lecture 4 Slides: Red-Black Trees"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Select File (PDF, PPT, PPTX, DOC, DOCX, Images)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.zip"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowFileUploadModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Upload &amp; Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add URL */}
      {showUrlModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>Add Resource URL</h3>
              <button onClick={() => setShowUrlModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleAddUrl}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Target Module</label>
                  <select
                    className="form-select"
                    value={urlForm.moduleId}
                    onChange={(e) => setUrlForm({ ...urlForm, moduleId: e.target.value })}
                  >
                    <option value="">General Course Link</option>
                    {(Array.isArray(modulesData) ? modulesData : []).map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Link Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Interactive Tree Visualizer"
                    value={urlForm.title}
                    onChange={(e) => setUrlForm({ ...urlForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={urlForm.url}
                    onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowUrlModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save URL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit YouTube Video */}
      {showVideoModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>
                {editingVideo ? 'Edit Course Video' : 'Add YouTube Lecture Video'}
              </h3>
              <button onClick={() => setShowVideoModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleSaveVideo}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Video Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lecture 4: Balanced AVL Trees and Rotations"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">YouTube URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Paste any standard YouTube video URL or shortened link.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Module (Optional)</label>
                  <select
                    className="form-select"
                    value={videoForm.moduleId}
                    onChange={(e) => setVideoForm({ ...videoForm, moduleId: e.target.value })}
                  >
                    <option value="">General Course Video (All Modules)</option>
                    {(Array.isArray(modulesData) ? modulesData : []).map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowVideoModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingVideo ? 'Update Video' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Resource (File or URL) */}
      {showEditResourceModal && editingResource && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>
                Edit {editingResource.resource_type === 'file' ? 'Attached File' : 'Resource URL'}
              </h3>
              <button
                onClick={() => {
                  setShowEditResourceModal(false);
                  setEditingResource(null);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateResource}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resource Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={resourceEditForm.title}
                    onChange={(e) => setResourceEditForm({ ...resourceEditForm, title: e.target.value })}
                    required
                  />
                </div>

                {editingResource.resource_type === 'url' && (
                  <div className="form-group">
                    <label className="form-label">Resource URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={resourceEditForm.url}
                      onChange={(e) => setResourceEditForm({ ...resourceEditForm, url: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Target Module</label>
                  <select
                    className="form-select"
                    value={resourceEditForm.moduleId}
                    onChange={(e) => setResourceEditForm({ ...resourceEditForm, moduleId: e.target.value })}
                  >
                    <option value="">General Course Files (No specific module)</option>
                    {(Array.isArray(modulesData) ? modulesData : []).map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditResourceModal(false);
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

      {/* Modal: Add Students to Course */}
      {showAddStudentsModal && selectedCourse && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px', width: '92vw', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserPlus size={18} color="var(--primary)" />
                  <span>Add Students to Course</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {selectedCourse.code} • {selectedCourse.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddStudentsModal(false);
                  setSelectedStudentIds([]);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollStudentsSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ padding: '1.25rem', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.45 }}>
                  Select existing student accounts from the directory to enroll them into this assigned course. Added students will immediately see this course and its materials in their Student Portal.
                </p>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                  <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                    placeholder="Search by student name, roll number, or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                {/* Filter Tabs & Bulk Actions */}
                {(() => {
                  const filteredStudents = allStudents.filter(s => {
                    const q = studentSearch.toLowerCase();
                    const matchesQuery = !q ||
                      (s.name || '').toLowerCase().includes(q) ||
                      (s.email || '').toLowerCase().includes(q) ||
                      (s.identifier || '').toLowerCase().includes(q) ||
                      (s.department || '').toLowerCase().includes(q);

                    if (!matchesQuery) return false;

                    if (studentFilter === 'available') return !s.is_enrolled;
                    if (studentFilter === 'enrolled') return s.is_enrolled;
                    return true;
                  });

                  const availableInFilter = filteredStudents.filter(s => !s.is_enrolled);
                  const availableTotal = allStudents.filter(s => !s.is_enrolled).length;
                  const enrolledTotal = allStudents.filter(s => s.is_enrolled).length;

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${studentFilter === 'available' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            onClick={() => setStudentFilter('available')}
                          >
                            Available to Enroll ({availableTotal})
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${studentFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            onClick={() => setStudentFilter('all')}
                          >
                            All Students ({allStudents.length})
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${studentFilter === 'enrolled' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                            onClick={() => setStudentFilter('enrolled')}
                          >
                            Already Enrolled ({enrolledTotal})
                          </button>
                        </div>

                        {availableInFilter.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => handleSelectAllAvailable(availableInFilter)}
                            >
                              Select All ({availableInFilter.length})
                            </button>
                            {selectedStudentIds.length > 0 && (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                onClick={handleDeselectAll}
                              >
                                Deselect All
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selected Counter Notice */}
                      {selectedStudentIds.length > 0 && (
                        <div
                          style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: 'var(--radius-sm)',
                            color: '#065f46',
                            fontSize: '0.8rem',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span><strong>{selectedStudentIds.length}</strong> student(s) selected for enrollment</span>
                          <button
                            type="button"
                            onClick={handleDeselectAll}
                            style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* Students List */}
                      <div
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          maxHeight: '320px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map(s => {
                            const isSelected = selectedStudentIds.includes(s.id);
                            const isEnrolled = s.is_enrolled;

                            return (
                              <div
                                key={s.id}
                                onClick={() => {
                                  if (!isEnrolled) toggleStudentSelection(s.id);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.65rem 0.85rem',
                                  borderBottom: '1px solid var(--border-color)',
                                  backgroundColor: isEnrolled ? '#f8fafc' : isSelected ? '#f0fdf4' : '#ffffff',
                                  cursor: isEnrolled ? 'default' : 'pointer',
                                  transition: 'background-color 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <input
                                    type="checkbox"
                                    checked={isEnrolled || isSelected}
                                    disabled={isEnrolled}
                                    onChange={() => {
                                      if (!isEnrolled) toggleStudentSelection(s.id);
                                    }}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      cursor: isEnrolled ? 'not-allowed' : 'pointer',
                                      accentColor: 'var(--primary)'
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                      {s.name}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.1rem' }}>
                                      <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                                        {s.identifier}
                                      </span>
                                      <span>{s.email}</span>
                                      {s.department && <span>• {s.department}</span>}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  {isEnrolled ? (
                                    <span
                                      className="badge badge-success"
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                                    >
                                      <CheckCircle2 size={12} />
                                      <span>Already Enrolled</span>
                                    </span>
                                  ) : isSelected ? (
                                    <span
                                      className="badge badge-primary"
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
                                    >
                                      <Check size={12} />
                                      <span>Selected</span>
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                      Click to select
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No student accounts match the filter.
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentsModal(false);
                    setSelectedStudentIds([]);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={selectedStudentIds.length === 0 || enrollingLoading}
                  style={{
                    fontSize: '0.85rem',
                    gap: '0.4rem',
                    backgroundColor: selectedStudentIds.length > 0 ? '#059669' : undefined,
                    borderColor: selectedStudentIds.length > 0 ? '#059669' : undefined
                  }}
                >
                  <UserPlus size={15} />
                  <span>
                    {enrollingLoading
                      ? 'Enrolling Students...'
                      : `Enroll ${selectedStudentIds.length} Student${selectedStudentIds.length === 1 ? '' : 's'}`}
                  </span>
                </button>
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

export default CourseManagement;
