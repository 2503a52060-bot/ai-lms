import React from 'react';

const MarksTable = ({ marks = [], highlightLow = true }) => {
  const getGradeBadge = (grade, total) => {
    if (grade === 'O' || total >= 90) return <span className="badge badge-success">O (Outstanding)</span>;
    if (grade === 'A+' || total >= 80) return <span className="badge badge-primary">A+ (Excellent)</span>;
    if (grade === 'A' || total >= 70) return <span className="badge badge-info">A (Very Good)</span>;
    if (grade === 'B' || total >= 60) return <span className="badge badge-warning">B (Good)</span>;
    return <span className="badge badge-danger">C (Needs Improvement)</span>;
  };

  const safeList = Array.isArray(marks) ? marks : [];

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Credits</th>
            <th>Internal (30)</th>
            <th>Midterm (30)</th>
            <th>End Sem (40)</th>
            <th>Total (100)</th>
            <th>Grade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {safeList.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No marks or examination records found for this semester.
              </td>
            </tr>
          ) : (
            safeList.map((item, idx) => {
              const code = item.code || item.course_code || `CS${601 + idx}`;
              const name = item.name || item.course_title || 'Course Subject';
              const credits = item.credits ?? 4;
              const internal = item.internal ?? '-';
              const midterm = item.midterm ?? '-';
              const endsem = item.endsem ?? '-';
              const total = item.total ?? item.marks_obtained ?? 0;
              const maxVal = item.max ?? item.max_marks ?? 100;
              const grade = item.grade || (total >= 90 ? 'O' : total >= 80 ? 'A+' : total >= 70 ? 'A' : total >= 60 ? 'B' : 'C');
              const status = item.status || (total >= 50 ? 'Passed' : 'Failed');
              const isLow = highlightLow && total < 70;

              return (
                <tr key={item.id || code} style={{ backgroundColor: isLow ? '#fffbeb' : undefined }}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {code}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{credits} Cr</span>
                  </td>
                  <td>{internal}</td>
                  <td>{midterm}</td>
                  <td>{endsem}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{total}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {maxVal}</span>
                    </div>
                  </td>
                  <td>{getGradeBadge(grade, total)}</td>
                  <td>
                    <span
                      className={`badge ${
                        status === 'Passed' ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MarksTable;
