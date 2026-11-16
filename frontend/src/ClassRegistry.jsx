import { useEffect, useState } from 'react';
import { addClass, getClasses } from './api/classes.js';

export default function ClassRegistry() {
  const [classes, setClasses] = useState([]);
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getClasses()
      .then(setClasses)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const created = await addClass({
        grade: Number(grade),
        section: section.trim().toUpperCase(),
      });

      setClasses((current) =>
        [...current, created].sort(
          (a, b) => a.grade - b.grade || a.section.localeCompare(b.section),
        ),
      );
      setGrade('');
      setSection('');
      setMessage('Class added successfully.');
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
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Classes &amp; Sections
        </h1>
        <p className="mt-2 text-slate-600">
          Add school grades and their class sections.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      >
        <label className="space-y-2 font-medium text-slate-700">
          Grade *
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="number"
            min="1"
            max="13"
            required
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            placeholder="e.g. 6"
          />
        </label>

        <label className="space-y-2 font-medium text-slate-700">
          Section *
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="text"
            maxLength="20"
            required
            value={section}
            onChange={(event) => setSection(event.target.value)}
            placeholder="e.g. A"
          />
        </label>

        <div className="sm:col-span-2">
          <button
            className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add class'}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 p-6 text-xl font-semibold text-slate-900">
          Class list
        </h2>

        {loading ? (
          <p className="p-6 text-slate-600">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="p-6 text-slate-600">No classes added yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Section</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((schoolClass) => (
                <tr key={schoolClass.id} className="border-t border-slate-200">
                  <td className="px-6 py-4">Grade {schoolClass.grade}</td>
                  <td className="px-6 py-4">{schoolClass.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}