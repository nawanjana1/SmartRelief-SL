import { useEffect, useState } from 'react';
import {
  addTeacher,
  getTeachers,
  updateTeacher,
} from './api/teachers.js';

const emptyForm = {
  employee_number: '',
  full_name: '',
  email: '',
  department: '',
};

export default function TeacherRegistry() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    getTeachers()
      .then((data) => {
        if (!cancelled) setTeachers(data);
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
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(teacher) {
    setEditingId(teacher.id);
    setForm({
      employee_number: teacher.employee_number,
      full_name: teacher.full_name,
      email: teacher.email ?? '',
      department: teacher.department ?? '',
    });
    setError('');
    setMessage('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const teacherData = {
      employee_number: form.employee_number.trim(),
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      department: form.department.trim() || null,
    };

    try {
      if (editingId) {
        const updated = await updateTeacher(editingId, teacherData);

        setTeachers((current) =>
          current
            .map((teacher) => (teacher.id === updated.id ? updated : teacher))
            .sort((a, b) => a.full_name.localeCompare(b.full_name)),
        );
        setMessage('Teacher updated successfully.');
      } else {
        const created = await addTeacher(teacherData);

        setTeachers((current) =>
          [...current, created].sort((a, b) =>
            a.full_name.localeCompare(b.full_name),
          ),
        );
        setMessage('Teacher added successfully.');
      }

      setEditingId(null);
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTeacherStatus(teacher) {
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const updated = await updateTeacher(teacher.id, {
        is_active: !teacher.is_active,
      });

      setTeachers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(
        updated.is_active
          ? 'Teacher activated successfully.'
          : 'Teacher deactivated successfully.',
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          School Registry
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Teachers</h1>
        <p className="mt-2 text-slate-600">
          Add, edit, and manage the school teacher registry.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Employee number *
          <input
            name="employee_number"
            value={form.employee_number}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="e.g. T002"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Full name *
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Teacher name"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="teacher@school.lk"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Department
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="e.g. Science"
          />
        </label>

        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sky-700 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Save changes'
                : 'Add teacher'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-slate-100 px-5 py-2.5 font-semibold text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm text-green-700">{message}</p>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 px-6 py-4 text-lg font-semibold">
          Teacher list
        </h2>

        {loading ? (
          <p className="p-6 text-slate-600">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="p-6 text-slate-600">No teachers added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Employee no.</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{teacher.employee_number}</td>
                    <td className="px-4 py-3 font-medium">{teacher.full_name}</td>
                    <td className="px-4 py-3">{teacher.email || '—'}</td>
                    <td className="px-4 py-3">{teacher.department || '—'}</td>
                    <td className="px-4 py-3">
                      {teacher.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="space-x-3 px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => startEdit(teacher)}
                        className="font-semibold text-sky-700 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleTeacherStatus(teacher)}
                        className="font-semibold text-slate-600 disabled:opacity-60"
                      >
                        {teacher.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}