import { useEffect, useState } from 'react';
import TeacherRegistry from './TeacherRegistry.jsx';
import SubjectRegistry from './SubjectRegistry.jsx';
import ClassRegistry from './ClassRegistry.jsx';
import TeacherSubjectLoad from './TeacherSubjectLoad.jsx';
import AttendanceRegistry from './AttendanceRegistry.jsx';
import MasterTimetable from './MasterTimetable.jsx';
import ReliefAssignments from './ReliefAssignments.jsx';
import { getDashboardData } from './api/dashboard.js';
const navItems = [
  { icon: '▦', label: 'Dashboard', active: true },
  { icon: '☑', label: 'Daily Attendance' },
  { icon: '↻', label: 'Relief Assignments', badge: '3' },
  { icon: '▤', label: 'Master Timetable' },
];

const registryItems = ['Teachers Registry', 'Subjects & Load', 'Classes & Sections', 'Reports & Insights'];

const periods = [
  { period: 'P-1', subject: 'Science', className: 'Grade 8-C', teacher: 'Mrs. K. Silva', state: 'Needs relief', tone: 'urgent' },
  { period: 'P-3', subject: 'Mathematics', className: 'Grade 10-A', teacher: 'Mr. W. Perera', state: 'Needs relief', tone: 'urgent' },
  { period: 'P-5', subject: 'English', className: 'Grade 11-B', teacher: 'Mr. S. Fernando', state: 'Assigned', tone: 'covered' },
];

function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="SmartRelief SL home">
        <span className="brand-mark">↗</span>
        <span>
          <strong>SmartRelief SL</strong>
          <small>School Portal</small>
        </span>
      </a>

      <div className="school-card">
        <span className="eyebrow">SELECTED SCHOOL</span>
        <strong>My School</strong>
      </div>

      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            onClick={(event) => {
  if (
  item.label === 'Daily Attendance' ||
  item.label === 'Relief Assignments' ||
  item.label === 'Master Timetable'
) {
  event.preventDefault();
  onNavigate(item.label);
}
}}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </a>
        ))}

        <span className="nav-heading">SCHOOL REGISTRY</span>

        {registryItems.map((item) => (
          <button
            className="nav-item compact"
            key={item}
            onClick={() => {
  if (
  item === 'Teachers Registry' ||
  item === 'Subjects & Load' ||
  item === 'Classes & Sections'
) {
  onNavigate(item);
}
}}
            style={{
              background: 'transparent',
              border: 0,
              textAlign: 'left',
              width: '100%',
            }}
            type="button"
          >
            <span className="nav-icon">◈</span>
            {item}
          </button>
        ))}

        <a className="nav-item compact" href="#">
          <span className="nav-icon">⚙</span>
          Settings
        </a>
      </nav>

      <div className="account">
        <div className="avatar admin-avatar">AD</div>
        <span>
          <strong>School Admin</strong>
          <small>Administrator</small>
        </span>
        <span className="account-menu">⌄</span>
      </div>
    </aside>
  );
}

function StatCard({ label, value, hint, color }) {
  return <article className="stat-card"><div className="stat-top"><span className="eyebrow">{label}</span><span className={`stat-icon ${color}`}>●</span></div><strong className="stat-value">{value}</strong><span className="stat-hint">{hint}</span></article>;
}

function App() {
 const [activePage, setActivePage] = useState('Dashboard');

   const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    getDashboardData(today, now.getFullYear(), 2)
      .then(setDashboardData)
      .catch((error) => setDashboardError(error.message));
  }, []);

  const pendingCoverageCount = dashboardData
    ? Math.max(
        0,
        dashboardData.affectedPeriods.length - dashboardData.coveredCount,
      )
    : null;

if (
  activePage === 'Daily Attendance' ||
  activePage === 'Master Timetable' ||
  activePage === 'Relief Assignments' ||
  activePage === 'Teachers Registry' ||
  activePage === 'Subjects & Load' ||
  activePage === 'Classes & Sections'
) {
  return (
    <div className="app-shell" id="top">
      <Sidebar onNavigate={setActivePage} />
      <div className="main-content">
        <button
          className="button button-light"
          onClick={() => setActivePage('Dashboard')}
          type="button"
        >
          ← Back to Dashboard
        </button>

        {activePage === 'Relief Assignments' ? (
          <ReliefAssignments />
        ) : activePage === 'Daily Attendance' ? (
          <AttendanceRegistry />
        ) : activePage === 'Master Timetable' ? (
          <MasterTimetable />
        ) : activePage === 'Teachers Registry' ? (
          <TeacherRegistry />
        ) : activePage === 'Subjects & Load' ? (
          <>
            <SubjectRegistry />
            <TeacherSubjectLoad />
          </>
        ) : (
          <ClassRegistry />
        )}
      </div>
    </div>
  );
}
  return (
    <div className="app-shell" id="top">
      <Sidebar onNavigate={setActivePage} />
      <main className="main-content">
        <header className="topbar">
          <label className="search-box"><span>⌕</span><input aria-label="Search" placeholder="Search teachers, subjects, or classes..." /></label>
          <div className="topbar-right"><span className="term-pill">Term 2 <span>•</span> Week 7</span><span className="admin-chip"><span className="online-dot" /> Admin</span></div>
        </header>

        <section className="page-heading">
          <div><span className="eyebrow heading-eyebrow">SCHOOL RELIEF MANAGEMENT</span><h1>Good morning, Admin</h1><p>Here is the relief coverage overview for today.</p></div>
          <button className="button button-secondary">▣ &nbsp; View timetable</button>
        </section>
{dashboardError && (
  <p className="rounded-lg bg-red-50 p-4 text-red-700">
    Dashboard data error: {dashboardError}
  </p>
)}
        <section className="alert-card" aria-label="Uncovered periods alert">
          <div className="alert-symbol">!</div>
          <div className="alert-copy">
  <strong>
    {pendingCoverageCount === null
      ? 'Loading relief coverage...'
      : pendingCoverageCount > 0
        ? `${pendingCoverageCount} teaching periods need relief assignments`
        : 'All affected periods are covered'}
  </strong>
  <p>
    {dashboardData
      ? `${dashboardData.absentCount} teachers marked absent or half-day today.`
      : 'Loading today’s attendance and timetable.'}
  </p>
  <span className="alert-tag">
    {pendingCoverageCount > 0 ? 'ACTION NEEDED' : 'UP TO DATE'}
  </span>
</div>
          <button className="button button-primary">Review assignments <span>→</span></button>
        </section>

        <section className="stats-grid" aria-label="Today's statistics">
          <StatCard
  label="TEACHING STAFF"
  value={dashboardData?.activeTeacherCount ?? '—'}
  hint="Active teachers"
  color="blue"
/>
<StatCard
  label="PRESENT TODAY"
  value={dashboardData?.presentCount ?? '—'}
  hint="Attendance recorded"
  color="green"
/>
<StatCard
  label="ABSENT / HALF-DAY"
  value={dashboardData?.absentCount ?? '—'}
  hint="Today's attendance"
  color="red"
/>
<StatCard
  label="RELIEF COVERAGE"
  value={
    dashboardData
      ? `${dashboardData.coveredCount} / ${dashboardData.affectedPeriods.length}`
      : '—'
  }
  hint="Covered periods / affected periods"
  color="violet"
/>
        </section>

        <section className="content-grid">
          <article className="panel assignments-panel">
            <div className="panel-heading"><div><span className="eyebrow">ATTENTION QUEUE</span><h2>Pending relief assignments</h2></div><button className="button button-light">View all <span>→</span></button></div>
            <div className="table-wrap"><table><thead><tr><th>PERIOD</th><th>CLASS & SUBJECT</th><th>ABSENT TEACHER</th><th>STATUS</th><th></th></tr></thead><tbody>
              {(dashboardData?.affectedPeriods ?? []).map((row) => (
  <tr key={row.id}>
    <td><strong>{row.period}</strong></td>
    <td><strong>{row.className}</strong><small>{row.subject}</small></td>
    <td>{row.teacher}</td>
    <td>
      <span className={`status-pill ${row.assigned ? 'covered' : 'urgent'}`}>
        {row.assigned ? 'Assigned' : 'Needs relief'}
      </span>
    </td>
    <td>
      {!row.assigned && (
        <button
          className="text-button"
          onClick={() => setActivePage('Relief Assignments')}
        >
          Find relief →
        </button>
      )}
    </td>
  </tr>
))}
            </tbody></table></div>
            <div className="panel-footer"><span><i className="legend-dot red-dot" /> Needs relief</span><span><i className="legend-dot green-dot" /> Assigned</span><span className="footer-note">Showing {dashboardData?.affectedPeriods.length ?? 0} affected periods</span></div>
          </article>

          <div className="side-panels">
            <article className="panel coverage-panel">
  <div className="panel-heading">
    <div>
      <span className="eyebrow">TODAY</span>
      <h2>Coverage status</h2>
    </div>
    <span className="eyebrow">
      {dashboardData?.affectedPeriods.length ?? 0} PERIODS
    </span>
  </div>

  <div className="progress-track">
    <span
      style={{
        width: `${
          dashboardData?.affectedPeriods.length
            ? (dashboardData.coveredCount /
                dashboardData.affectedPeriods.length) *
              100
            : 0
        }%`,
      }}
    />
  </div>

  <div className="coverage-legend">
    <span>
      <i className="legend-dot green-dot" />
      Assigned {dashboardData?.coveredCount ?? 0}
    </span>
    <span>
      <i className="legend-dot red-dot" />
      Pending {pendingCoverageCount ?? 0}
    </span>
  </div>

  <div className="period-row">
    {(dashboardData?.affectedPeriods ?? []).slice(0, 4).map((period) => (
      <div
        className={`period-chip ${period.assigned ? 'free' : 'needs-relief'}`}
        key={period.id}
      >
        <strong>{period.period}</strong>
        <small>{period.assigned ? 'Assigned' : 'Pending'}</small>
      </div>
    ))}
    {dashboardData?.affectedPeriods.length === 0 && (
      <p>No affected periods today.</p>
    )}
  </div>
</article>
            <article className="panel workload-panel">
  <span className="eyebrow">DAILY ATTENDANCE</span>
  <h2>Staff summary</h2>
  <p>Attendance recorded for today.</p>
  <div className="teacher-row">
    <span><strong>Active teachers</strong></span>
    <span className="teacher-load">{dashboardData?.activeTeacherCount ?? 0}</span>
  </div>
  <div className="teacher-row">
    <span><strong>Present</strong></span>
    <span className="teacher-load">{dashboardData?.presentCount ?? 0}</span>
  </div>
  <div className="teacher-row">
    <span><strong>Absent / half-day</strong></span>
    <span className="teacher-load">{dashboardData?.absentCount ?? 0}</span>
  </div>
  <button
    className="button button-light full-button"
    onClick={() => setActivePage('Daily Attendance')}
  >
    View attendance
  </button>
</article>
          </div>
        </section>
        <footer className="page-footer">SmartRelief SL <span>School relief and timetable management</span></footer>
      </main>
    </div>
  );
}

export default App;
