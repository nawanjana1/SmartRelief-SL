import { useEffect, useState } from 'react';
import { getAttendance } from './api/attendance.js';
import { getReliefAssignments } from './api/reliefAssignments.js';
import { getTeachers } from './api/teachers.js';

function todayLocal() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReportsInsights() {
  const [date, setDate] = useState(todayLocal);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      getTeachers(),
      getAttendance(date),
      getReliefAssignments(date),
    ])
      .then(([teacherData, attendanceData, assignmentData]) => {
        if (cancelled) return;
        setTeachers(teacherData.filter((teacher) => teacher.is_active));
        setAttendance(attendanceData);
        setAssignments(assignmentData);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const attendanceByTeacher = new Map(
    attendance.map((record) => [record.teacher_id, record]),
  );

  const statusLabel = (status) => {
    const labels = {
      present: 'Present',
      absent: 'Absent',
      morning_half_day: 'Morning half-day',
      afternoon_half_day: 'Afternoon half-day',
      special_duty: 'Special duty',
    };
    return labels[status] ?? 'Not recorded';
  };

  function teacherName(id) {
    return teachers.find((teacher) => teacher.id === id)?.full_name ?? 'Unknown teacher';
  }

  const presentCount = attendance.filter((record) => record.status === 'present').length;
  const absentCount = attendance.filter((record) =>
    ['absent', 'morning_half_day', 'afternoon_half_day'].includes(record.status),
  ).length;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          School Relief Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Reports &amp; Insights
        </h1>
        <p className="mt-2 text-slate-600">
          Review attendance and relief assignments for a selected date.
        </p>
      </header>

      <label className="block max-w-xs space-y-2 font-medium text-slate-700">
        Report date
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">ACTIVE TEACHERS</p>
          <strong className="mt-2 block text-3xl">{teachers.length}</strong>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">PRESENT</p>
          <strong className="mt-2 block text-3xl">{presentCount}</strong>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">ABSENT / HALF-DAY</p>
          <strong className="mt-2 block text-3xl">{absentCount}</strong>
        </article>
      </section>

      {loading ? (
        <p className="rounded-xl bg-white p-6 text-slate-600">Loading report...</p>
      ) : (
        <>
          <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-200 p-6 text-xl font-semibold">
              Teacher attendance
            </h2>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Teacher</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => {
                  const record = attendanceByTeacher.get(teacher.id);
                  return (
                    <tr key={teacher.id} className="border-t border-slate-200">
                      <td className="px-5 py-4">{teacher.full_name}</td>
                      <td className="px-5 py-4">
                        {statusLabel(record?.status)}
                      </td>
                      <td className="px-5 py-4">{record?.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-200 p-6 text-xl font-semibold">
              Relief assignments ({assignments.length})
            </h2>
            {assignments.length === 0 ? (
              <p className="p-6 text-slate-600">No relief assignments for this date.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-sm uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Absent teacher</th>
                    <th className="px-5 py-4">Relief teacher</th>
                    <th className="px-5 py-4">Suitability</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-t border-slate-200">
                      <td className="px-5 py-4">
                        {teacherName(assignment.absent_teacher_id)}
                      </td>
                      <td className="px-5 py-4">
                        {teacherName(assignment.relief_teacher_id)}
                      </td>
                      <td className="px-5 py-4">
                        {assignment.suitability_score}%
                      </td>
                      <td className="px-5 py-4">{assignment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  );
}