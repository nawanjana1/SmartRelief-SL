import { useEffect, useState } from 'react';
import TeacherRegistry from './TeacherRegistry.jsx';
import SubjectRegistry from './SubjectRegistry.jsx';
import ClassRegistry from './ClassRegistry.jsx';
import TeacherSubjectLoad from './TeacherSubjectLoad.jsx';
import AttendanceRegistry from './AttendanceRegistry.jsx';
import MasterTimetable from './MasterTimetable.jsx';
import ReliefAssignments from './ReliefAssignments.jsx';
import { getDashboardData } from './api/dashboard.js';
import ReportsInsights from './ReportsInsights.jsx';
import Login from './Login.jsx';
import PasswordRecovery from './PasswordRecovery.jsx';
import Settings from './Settings.jsx';
import { supabase } from './lib/supabase.js';
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

function Sidebar({ onNavigate, activePage, email, onSignOut }) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="SmartRelief SL home">
        <img className="brand-logo" src="/smartrelief-logo.png" alt="SmartRelief SL logo" />
        <span>
          <strong>SmartRelief SL</strong>
          <small>School Portal</small>
        </span>
      </a>

      <div className="school-card">
        <span className="eyebrow">SELECTED SCHOOL</span>
        <strong>Hemamali Maha Vidyalaya</strong>
      </div>

      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            className={`nav-item${activePage === item.label ? ' active' : ''}`}
            key={item.label}
            href="#top"
            aria-current={activePage === item.label ? 'page' : undefined}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.label);
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
            className={`nav-item compact${activePage === item ? ' active' : ''}`}
            key={item}
            aria-current={activePage === item ? 'page' : undefined}
            onClick={() => onNavigate(item)}
            type="button"
          >
            <span className="nav-icon">◈</span>
            {item}
          </button>
        ))}

        <button
          className={`nav-item compact${activePage === 'Settings' ? ' active' : ''}`}
          aria-current={activePage === 'Settings' ? 'page' : undefined}
          onClick={() => onNavigate('Settings')}
          type="button"
        >
          <span className="nav-icon">⚙</span>
          Settings
        </button>
      </nav>

      {accountMenuOpen && (
        <div className="account-dropdown">
          <span className="eyebrow">SIGNED IN AS</span>
          <strong className="account-dropdown-email">{email}</strong>
          <span className="account-dropdown-role">School administrator</span>
          <div className="account-dropdown-actions">
            <button
              onClick={() => {
                setAccountMenuOpen(false);
                onNavigate('Settings');
              }}
              type="button"
            >
              Account settings
            </button>
            <button
              onClick={onSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      <button
        className="account"
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
        onClick={() => setAccountMenuOpen((open) => !open)}
        type="button"
      >
        <div className="avatar admin-avatar">AD</div>
        <span>
          <strong>School Admin</strong>
          <small>Administrator</small>
        </span>
        <span className="account-menu">{accountMenuOpen ? '⌃' : '⌄'}</span>
      </button>
    </aside>
  );
}

function StatCard({ label, value, hint, color, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="eyebrow">{label}</span>
        <span className={`stat-icon ${color}`} aria-hidden="true">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-hint">{hint}</span>
    </article>
  );
}

function App() {
 const [activePage, setActivePage] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
   const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(() =>
    window.location.hash.includes('type=recovery'),
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

   const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState('');

    useEffect(() => {
    if (!session) return;

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    getDashboardData(today, now.getFullYear(), 2)
      .then(setDashboardData)
      .catch((error) => setDashboardError(error.message));
  }, [session]);

  const pendingCoverageCount = dashboardData
    ? Math.max(
        0,
        dashboardData.affectedPeriods.length - dashboardData.coveredCount,
      )
    : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const todayLabel = new Intl.DateTimeFormat('en-LK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const searchResults = normalizedSearch.length < 2 || !dashboardData
    ? []
    : [
        ...(dashboardData.teachers ?? []).map((teacher) => ({
          kind: 'Teacher',
          title: teacher.full_name,
          detail: [teacher.employee_number, teacher.department].filter(Boolean).join(' · '),
          page: 'Teachers Registry',
          searchText: `${teacher.full_name} ${teacher.employee_number} ${teacher.email ?? ''} ${teacher.department ?? ''}`,
        })),
        ...(dashboardData.subjects ?? []).map((subject) => ({
          kind: 'Subject',
          title: subject.name,
          detail: subject.code,
          page: 'Subjects & Load',
          searchText: `${subject.name} ${subject.code}`,
        })),
        ...(dashboardData.classes ?? []).map((schoolClass) => ({
          kind: 'Class',
          title: `Grade ${schoolClass.grade}-${schoolClass.section}`,
          detail: 'Class & section',
          page: 'Classes & Sections',
          searchText: `grade ${schoolClass.grade} ${schoolClass.section} ${schoolClass.grade}-${schoolClass.section}`,
        })),
      ]
        .filter((item) => item.searchText.toLocaleLowerCase().includes(normalizedSearch))
        .slice(0, 8);

  function openSearchResult(page) {
    setActivePage(page);
    setSearchQuery('');
    setSearchOpen(false);
  }



    if (authLoading) {
    return <main className="p-8">Checking sign-in...</main>;
  }

  if (passwordRecovery) {
    return <PasswordRecovery onComplete={() => setPasswordRecovery(false)} />;
  }

  if (!session) {
    return <Login />;
  }
  if (
  activePage === 'Daily Attendance' ||
  activePage === 'Master Timetable' ||
  activePage === 'Relief Assignments' ||
  activePage === 'Teachers Registry' ||
  activePage === 'Subjects & Load' ||
  activePage === 'Reports & Insights' ||
  activePage === 'Classes & Sections' ||
  activePage === 'Settings'
) {
  return (
    <div className="app-shell" id="top">
      <Sidebar
        onNavigate={setActivePage}
        activePage={activePage}
        email={session.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />
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
        ) : activePage === 'Reports & Insights' ? (
  <ReportsInsights />
        
        ) : activePage === 'Teachers Registry' ? (
          <TeacherRegistry />
        ) : activePage === 'Settings' ? (
          <Settings
            email={session.user.email}
            onSignOut={() => supabase.auth.signOut()}
          />
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
      <Sidebar
        onNavigate={setActivePage}
        activePage={activePage}
        email={session.user.email}
        onSignOut={() => supabase.auth.signOut()}
      />
      <main className="main-content">
        <header className="topbar">
          <div
            className="search-container"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false);
            }}
          >
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search teachers, subjects, or classes"
                aria-expanded={searchOpen && normalizedSearch.length >= 2}
                aria-controls="global-search-results"
                autoComplete="off"
                placeholder="Search teachers, subjects, or classes..."
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setSearchOpen(false);
                  if (event.key === 'Enter' && searchResults[0]) {
                    event.preventDefault();
                    openSearchResult(searchResults[0].page);
                  }
                }}
              />
            </label>
            {searchOpen && normalizedSearch.length > 0 && (
              <div className="search-results" id="global-search-results" role="listbox">
                {normalizedSearch.length < 2 ? (
                  <p className="search-empty">Type at least 2 characters.</p>
                ) : dashboardError ? (
                  <p className="search-empty">School records could not be loaded.</p>
                ) : !dashboardData ? (
                  <p className="search-empty">Loading school records…</p>
                ) : searchResults.length === 0 ? (
                  <p className="search-empty">No matching teachers, subjects, or classes.</p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      className="search-result"
                      key={`${result.kind}-${result.title}`}
                      onClick={() => openSearchResult(result.page)}
                      role="option"
                      type="button"
                    >
                      <span className={`search-result-icon ${result.kind.toLowerCase()}`}>
                        {result.kind.charAt(0)}
                      </span>
                      <span className="search-result-copy">
                        <strong>{result.title}</strong>
                        <small>{result.detail || result.kind}</small>
                      </span>
                      <span className="search-result-kind">{result.kind}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="topbar-right"><span className="term-pill">Term 2 <span>•</span> Week 7</span><span className="admin-chip">
  <span className="online-dot" /> {session.user.email}
</span>
<button
  className="button button-light"
  type="button"
  onClick={() => supabase.auth.signOut()}
>
  Sign out
</button></div>
        </header>

        <section className="page-heading dashboard-heading">
          <div className="dashboard-heading-copy">
            <span className="eyebrow heading-eyebrow">HEMAMALI MAHA VIDYALAYA · DAILY OVERVIEW</span>
            <h1>Good {greeting}, Admin</h1>
            <p>Your school staffing and relief snapshot for today.</p>
          </div>
          <div className="dashboard-heading-actions">
            <span className="dashboard-date">{todayLabel}</span>
            <button
              className="button button-secondary"
              onClick={() => setActivePage('Master Timetable')}
              type="button"
            >
              ▤ &nbsp; View timetable
            </button>
          </div>
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
          <button
            className="button button-primary"
            onClick={() => setActivePage('Relief Assignments')}
            type="button"
          >
            Review assignments <span>→</span>
          </button>
        </section>

        <section className="stats-grid" aria-label="Today's statistics">
          <StatCard
  label="TEACHING STAFF"
  value={dashboardData?.activeTeacherCount ?? '—'}
  hint="Active teachers"
  color="blue"
  icon="◉"
/>
<StatCard
  label="PRESENT TODAY"
  value={dashboardData?.presentCount ?? '—'}
  hint="Attendance recorded"
  color="green"
  icon="✓"
/>
<StatCard
  label="ABSENT / HALF-DAY"
  value={dashboardData?.absentCount ?? '—'}
  hint="Today's attendance"
  color="red"
  icon="!"
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
  icon="↗"
/>
        </section>

        <section className="content-grid">
          <article className="panel assignments-panel">
            <div className="panel-heading"><div><span className="eyebrow">ATTENTION QUEUE</span><h2>Pending relief assignments</h2></div><button className="button button-light" onClick={() => setActivePage('Relief Assignments')} type="button">View all <span>→</span></button></div>
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
