import { useEffect, useState } from 'react';
import {
  addSubject,
  getSubjects,
  updateSubject,
} from './api/subjects.js';

const emptyForm = {
  code: '',
  name: '',
};

export default function SubjectRegistry() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    getSubjects()
      .then((data) => {
        if (!cancelled) setSubjects(data);
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

  function startEdit(subject) {
    setEditingId(subject.id);
    setForm({ code: subject.code, name: subject.name });
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

    const subjectData = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
    };

    try {
      if (editingId) {
        const updated = await updateSubject(editingId, subjectData);
        setSubjects((current) =>
          current
            .map((subject) => (subject.id === updated.id ? updated : subject))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        setMessage('Subject updated successfully.');
      } else {
        const created = await addSubject(subjectData);
        setSubjects((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setMessage('Subject added successfully.');
      }

      setEditingId(null);
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSubjectStatus(subject) {
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const updated = await updateSubject(subject.id, {
        is_active: !subject.is_active,
      });
      setSubjects((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMessage(
        updated.is_active
          ? 'Subject activated successfully.'
          : 'Subject deactivated successfully.',
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
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Subjects</h1>
        <p className="mt-2 text-slate-600">
          Add and manage the subjects taught at the school.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Subject code *
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="e.g. SCI-10"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Subject name *
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
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
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add subject'}
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
          Subject list
        </h2>

        {loading ? (
          <p className="p-6 text-slate-600">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="p-6 text-slate-600">No subjects added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{subject.code}</td>
                    <td className="px-4 py-3 font-medium">{subject.name}</td>
                    <td className="px-4 py-3">
                      {subject.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="space-x-3 px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => startEdit(subject)}
                        className="font-semibold text-sky-700 disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleSubjectStatus(subject)}
                        className="font-semibold text-slate-600 disabled:opacity-60"
                      >
                        {subject.is_active ? 'Deactivate' : 'Activate'}
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