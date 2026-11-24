import { useEffect, useState } from 'react';
import { getTeachers } from './api/teachers.js';
import {
  addAttendance,
  getAttendance,
  updateAttendance,
} from './api/attendance.js';

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function AttendanceRegistry() {
  const [date, setDate] = useState(getToday);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([getTeachers(), getAttendance(date)])
      .then(([teacherData, attendanceData]) => {
        if (cancelled) return;

        setTeachers(teacherData.filter((teacher) => teacher.is_active));
        setAttendance(attendanceData);

        const nextDrafts = {};
        attendanceData.forEach((record) => {
          nextDrafts[record.teacher_id] = {
            status: record.status,
            note: record.note ?? '',
          };
        });
        setDrafts(nextDrafts);
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

  function updateDraft(teacherId, field, value) {
    setDrafts((current) => ({
      ...current,
      [teacherId]: {
        status: current[teacherId]?.status ?? '',
        note: current[teacherId]?.note ?? '',
        [field]: value,
      },
    }));
  }

  async function saveTeacherAttendance(teacher) {
    const draft = drafts[teacher.id];
    if (!draft?.status) {
      setError(`Select an attendance status for ${teacher.full_name}.`);
      return;
    }

    setError('');
    setMessage('');
    setSavingId(teacher.id);

    const existing = attendance.find(
      (record) => record.teacher_id === teacher.id,
    );
    const values = {
      status: draft.status,
      note: draft.note,
    };

    try {
      const saved = existing
        ? await updateAttendance(existing.id, values)
        : await addAttendance({
            teacher_id: teacher.id,
            attendance_date: date,
            ...values,
          });

      setAttendance((current) =>
        existing
          ? current.map((record) => (record.id === saved.id ? saved : record))
          : [...current, saved],
      );
      setDrafts((current) => ({
        ...current,
        [teacher.id]: { status: saved.status, note: saved.note ?? '' },
      }));
      setMessage(`Attendance saved for ${teacher.full_name}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId('');
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          School Registry
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Daily Attendance
        </h1>
        <p className="mt-2 text-slate-600">
          Record each teacher’s attendance for the selected date.
        </p>
      </header>

      <label className="block max-w-xs space-y-2 font-medium text-slate-700">
        Attendance date
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>
      )}

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-slate-600">Loading attendance...</p>
        ) : teachers.length === 0 ? (
          <p className="p-6 text-slate-600">No active teachers found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Teacher</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Note</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-t border-slate-200">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {teacher.full_name}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={drafts[teacher.id]?.status ?? ''}
                      onChange={(event) =>
                        updateDraft(teacher.id, 'status', event.target.value)
                      }
                    >
                      <option value="">Choose status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="half_day">Half-day</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <input
                      className="w-full min-w-32 rounded-lg border border-slate-300 px-3 py-2"
                      value={drafts[teacher.id]?.note ?? ''}
                      onChange={(event) =>
                        updateDraft(teacher.id, 'note', event.target.value)
                      }
                      placeholder="Optional"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                      type="button"
                      disabled={savingId === teacher.id}
                      onClick={() => saveTeacherAttendance(teacher)}
                    >
                      {savingId === teacher.id ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}