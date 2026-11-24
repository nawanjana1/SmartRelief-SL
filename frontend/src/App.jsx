import { useState } from 'react';
import TeacherRegistry from './TeacherRegistry.jsx';
import SubjectRegistry from './SubjectRegistry.jsx';
import ClassRegistry from './ClassRegistry.jsx';
import TeacherSubjectLoad from './TeacherSubjectLoad.jsx';
import AttendanceRegistry from './AttendanceRegistry.jsx';
import MasterTimetable from './MasterTimetable.jsx';
import ReliefAssignments from './ReliefAssignments.jsx';
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

        <section className="alert-card" aria-label="Uncovered periods alert">
          <div className="alert-symbol">!</div>
          <div className="alert-copy"><strong>2 teaching periods need relief assignments</strong><p>Three staff absences have affected today's timetable. Review the ranked recommendations to continue.</p><span className="alert-tag">ACTION NEEDED</span></div>
          <button className="button button-primary">Review assignments <span>→</span></button>
        </section>

        <section className="stats-grid" aria-label="Today's statistics">
          <StatCard label="TEACHING STAFF" value="45" hint="Across 5 departments" color="blue" />
          <StatCard label="PRESENT TODAY" value="42" hint="Attendance recorded" color="green" />
          <StatCard label="ABSENT / HALF-DAY" value="3" hint="2 absent · 1 half-day" color="red" />
          <StatCard label="RELIEF COVERAGE" value="1 / 3" hint="1 covered · 2 pending" color="violet" />
        </section>

        <section className="content-grid">
          <article className="panel assignments-panel">
            <div className="panel-heading"><div><span className="eyebrow">ATTENTION QUEUE</span><h2>Pending relief assignments</h2></div><button className="button button-light">View all <span>→</span></button></div>
            <div className="table-wrap"><table><thead><tr><th>PERIOD</th><th>CLASS & SUBJECT</th><th>ABSENT TEACHER</th><th>STATUS</th><th></th></tr></thead><tbody>
              {periods.map((row) => <tr key={row.period}><td><strong>{row.period}</strong></td><td><strong>{row.className}</strong><small>{row.subject}</small></td><td>{row.teacher}</td><td><span className={`status-pill ${row.tone}`}>{row.state}</span></td><td>{row.tone === 'urgent' ? <button className="text-button">Find relief →</button> : <span className="covered-check">✓</span>}</td></tr>)}
            </tbody></table></div>
            <div className="panel-footer"><span><i className="legend-dot red-dot" /> Needs relief</span><span><i className="legend-dot green-dot" /> Assigned</span><span className="footer-note">Showing 3 of 3 affected periods</span></div>
          </article>

          <div className="side-panels">
            <article className="panel coverage-panel"><div className="panel-heading"><div><span className="eyebrow">TODAY</span><h2>Coverage status</h2></div><span className="eyebrow">8 PERIODS</span></div><div className="progress-track"><span /></div><div className="coverage-legend"><span><i className="legend-dot green-dot" /> Assigned 1</span><span><i className="legend-dot red-dot" /> Pending 2</span></div><div className="period-row">{['P-1', 'P-2', 'P-3', 'P-4'].map((period, i) => <div className={`period-chip ${i === 0 || i === 2 ? 'needs-relief' : 'free'}`} key={period}><strong>{period}</strong><small>{i === 0 || i === 2 ? 'Pending' : 'Free'}</small></div>)}</div></article>
            <article className="panel workload-panel"><span className="eyebrow">FAIR WORKLOAD</span><h2>Available teachers</h2><p>Teachers with fewer relief duties this week</p><div className="teacher-row"><span className="avatar">NS</span><span><strong>Ms. N. Silva</strong><small>Mathematics</small></span><span className="teacher-load">0 duties</span></div><div className="teacher-row"><span className="avatar avatar-lilac">TJ</span><span><strong>Mr. T. Jayawardena</strong><small>Commerce</small></span><span className="teacher-load">1 duty</span></div><button className="button button-light full-button">View teacher workload</button></article>
          </div>
        </section>
        <footer className="page-footer">SmartRelief SL <span>School relief and timetable management</span></footer>
      </main>
    </div>
  );
}

export default App;
