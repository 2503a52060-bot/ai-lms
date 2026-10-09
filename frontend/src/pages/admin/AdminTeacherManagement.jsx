import React, { useState } from 'react';
import { Briefcase, Search, Plus, BookOpen, Award } from 'lucide-react';

const AdminTeacherManagement = () => {
  const [teachers, setTeachers] = useState([
    { id: 'tch_201', name: 'Prof. Katherine Reed', facultyId: 'FAC-CS-109', dept: 'CSE', courses: ['CS601 DSA', 'CS602 ML'], designation: 'Associate Professor', status: 'Active' },
    { id: 'tch_202', name: 'Dr. Marcus Holloway', facultyId: 'FAC-CS-114', dept: 'ECE', courses: ['CS605 Networks'], designation: 'Professor & Head', status: 'Active' },
    { id: 'tch_203', name: 'Dr. Anita Sharma', facultyId: 'FAC-CS-122', dept: 'CSE', courses: ['CS603 DBMS'], designation: 'Assistant Professor', status: 'Active' },
    { id: 'tch_204', name: 'Prof. David Lin', facultyId: 'FAC-CS-130', dept: 'CSE', courses: ['CS604 OS'], designation: 'Assistant Professor', status: 'Active' },
    { id: 'tch_205', name: 'Dr. Sarah Connor', facultyId: 'FAC-CS-138', dept: 'CSE', courses: ['CS606 TOC'], designation: 'Senior Lecturer', status: 'Active' }
  ]);
  const [search, setSearch] = useState('');

  const filtered = teachers.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.facultyId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty &amp; Professor Directory</h1>
          <p className="page-subtitle">
            Manage academic appointments, departmental workload, and assigned lecture courses
          </p>
        </div>

        <button onClick={() => alert('Add New Faculty Form triggered!')} className="btn btn-primary btn-sm">
          <Plus size={14} /> Add Faculty Member
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search faculty name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Professor Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Assigned Courses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                    {t.facultyId}
                  </td>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.designation}</td>
                  <td>{t.dept}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {t.courses.map((c, i) => (
                        <span key={i} className="badge badge-neutral" style={{ fontSize: '0.725rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">{t.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => alert(`Allocating additional curriculum modules to ${t.name}`)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Assign Course
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherManagement;
