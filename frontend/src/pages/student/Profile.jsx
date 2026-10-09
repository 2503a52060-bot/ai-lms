import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Award, BookOpen, GraduationCap, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Sowmya',
    email: user?.email || 'student@lms.edu',
    phone: user?.phone || '+1 (555) 234-5678',
    address: user?.address || 'Campus Hostel 4, Room 312, Tech University',
    department: user?.department || 'Computer Science & Engineering',
    semester: user?.semester || '3rd Semester',
    batch: user?.batch || '2024-2028',
    rollNo: user?.identifier || user?.rollNo || 'CS-2024-042'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        department: user.department || prev.department,
        semester: user.semester || prev.semester,
        batch: user.batch || prev.batch,
        rollNo: user.identifier || user.rollNo || prev.rollNo
      }));
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await api.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        semester: formData.semester,
        batch: formData.batch
      });
      if (res.data) {
        updateUserProfile(res.data);
      }
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaveError(err.response?.data?.detail || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Profile &amp; Academic Identity</h1>
          <p className="page-subtitle">
            Manage your personal contact info, departmental registration, and view academic standing
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile Info'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert alert-success">
          <Check size={16} /> Profile changes updated and saved successfully!
        </div>
      )}

      {saveError && (
        <div className="alert alert-danger" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171' }}>
          {saveError}
        </div>
      )}

      <div className="grid-1-2">
        {/* Profile Card Sidebar */}
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Student Avatar"
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid var(--primary-light)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1rem'
            }}
          />

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formData.name}
          </h2>
          <span className="badge badge-primary" style={{ marginTop: '0.25rem', textTransform: 'uppercase' }}>
            {user?.role || 'Student'} • {formData.rollNo}
          </span>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {formData.department}
          </p>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Mail size={15} color="var(--primary)" />
              <span style={{ color: 'var(--text-main)' }}>{formData.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Phone size={15} color="var(--primary)" />
              <span style={{ color: 'var(--text-main)' }}>{formData.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <MapPin size={15} color="var(--primary)" />
              <span style={{ color: 'var(--text-main)' }}>{formData.address}</span>
            </div>
          </div>
        </div>

        {/* Academic Details & Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Standing Quick Stats */}
          <div className="grid-3">
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>CGPA</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>8.72</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>Top 5% Cohort</span>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Credits Earned</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>124 Cr</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: 160 Cr</span>
            </div>
            <div className="card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Curriculum Term</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{formData.semester || '3rd Semester'}</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Batch: {formData.batch || '2024-2028'}</span>
            </div>
          </div>

          {/* Profile Form */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
              Institutional Registration Details
            </h3>

            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Enrollment / Roll Number</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={formData.rollNo}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">University Email</label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={formData.department}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Semester</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className="form-input"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Batch</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={formData.batch}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hostel / Campus Residential Address</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
