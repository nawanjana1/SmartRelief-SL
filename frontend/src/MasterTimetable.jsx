import { useEffect, useState } from 'react';
import { getClasses } from './api/classes.js';
import { getSubjects } from './api/subjects.js';
import { getTeachers } from './api/teachers.js';
import {
  addTimetableEntry,
  getTimetable,
} from './api/timetable.js';

const weekdays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

const initialForm = {
  academic_year: String(new Date().getFullYear()),
  term: '2',
  weekday: '1',
  class_id: '',
  period_number: '1',
  subject_id: '',
  teacher_id: '',
  room: '',
};

export default function MasterTimetable() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([getClasses(), getSubjects(), getTeachers(), getTimetable()])
      .then(([classData, subjectData, teacherData, timetableData]) => {
        setClasses(classData);
        setSubjects(subjectData.filter((subject) => subject.is_active));
        setTeachers(teacherData.filter((teacher) => teacher.is_active));
        setEntries(timetableData);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const entryData = {
      academic_year: Number(form.academic_year),
      term: Number(form.term),
      weekday: Number(form.weekday),
      class_id: form.class_id,
      period_number: Number(form.period_number),
      subject_id: form.subject_id,
      teacher_id: form.teacher_id,
      room: form.room.trim(),
    };

    try {
      const created = await addTimetableEntry(entryData);
      setEntries((current) => [...current, created]);
      setMessage('Timetable entry added successfully.');
      setForm((current) => ({
        ...current,
        class_id: '',
        subject_id: '',
        teacher_id: '',
        room: '',
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function className(id) {
    const item = classes.find((schoolClass) => schoolClass.id === id);
    return item ? `Grade ${item.grade}-${item.section}` : 'Unknown class';
  }

  function subjectName(id) {
    return subjects.find((subject) => subject.id === id)?.name ?? 'Unknown subject';
  }

  function teacherName(id) {
    return teachers.find((teacher) => teacher.id === id)?.full_name ?? 'Unknown teacher';
  }

  const sortedEntries = [...entries].sort(
    (a, b) => a.weekday - b.weekday || a.period_number - b.period_number,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          School Registry
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Master Timetable
        </h1>
        <p className="mt-2 text-slate-600">
          Add and view lessons scheduled for each class.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="space-y-2 font-medium text-slate-700">
          Academic year *
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="number"
            min="2000"
            max="2100"
            name="academic_year"
            required
            value={form.academic_year}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Term *
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            name="term"
            value={form.term}
            onChange={handleChange}
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Weekday *
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            name="weekday"
            value={form.weekday}
            onChange={handleChange}
          >
            {weekdays.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Class *
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            name="class_id"
            required
            value={form.class_id}
            onChange={handleChange}
          >
            <option value="">Select a class</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                Grade {schoolClass.grade}-{schoolClass.section}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Period *
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="number"
            min="1"
            max="10"
            name="period_number"
            required
            value={form.period_number}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Subject *
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            name="subject_id"
            required
            value={form.subject_id}
            onChange={handleChange}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Teacher *
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            name="teacher_id"
            required
            value={form.teacher_id}
            onChange={handleChange}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Room
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            name="room"
            value={form.room}
            onChange={handleChange}
            placeholder="e.g. Room 5"
          />
        </label>

        <div className="flex items-end">
          <button
            className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add timetable entry'}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>
      )}

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 p-6 text-xl font-semibold text-slate-900">
          Timetable entries
        </h2>

        {loading ? (
          <p className="p-6 text-slate-600">Loading timetable...</p>
        ) : sortedEntries.length === 0 ? (
          <p className="p-6 text-slate-600">No timetable entries added yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Day</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Room</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    {weekdays.find((day) => day.value === entry.weekday)?.label}
                  </td>
                  <td className="px-4 py-3">{entry.period_number}</td>
                  <td className="px-4 py-3">{className(entry.class_id)}</td>
                  <td className="px-4 py-3">{subjectName(entry.subject_id)}</td>
                  <td className="px-4 py-3">{teacherName(entry.teacher_id)}</td>
                  <td className="px-4 py-3">{entry.room || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}