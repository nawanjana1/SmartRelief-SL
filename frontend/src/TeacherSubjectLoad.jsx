import { useEffect, useState } from 'react';
import { getSubjects } from './api/subjects.js';
import { getTeachers } from './api/teachers.js';
import {
  getTeacherSubjects,
  saveTeacherSubject,
} from './api/teacherSubjects.js';

export default function TeacherSubjectLoad() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([getTeachers(), getSubjects(), getTeacherSubjects()])
      .then(([teacherData, subjectData, assignmentData]) => {
        setTeachers(teacherData.filter((teacher) => teacher.is_active));
        setSubjects(subjectData.filter((subject) => subject.is_active));
        setAssignments(assignmentData);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleGrade(grade) {
    setGradeLevels((current) =>
      current.includes(grade)
        ? current.filter((item) => item !== grade)
        : [...current, grade].sort((a, b) => a - b),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const saved = await saveTeacherSubject({
        teacher_id: teacherId,
        subject_id: subjectId,
        grade_levels: gradeLevels,
      });

      setAssignments((current) => [
        ...current.filter(
          (item) =>
            !(
              item.teacher_id === saved.teacher_id &&
              item.subject_id === saved.subject_id
            ),
        ),
        saved,
      ]);
      setGradeLevels([]);
      setMessage('Teacher subject assignment saved.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function teacherName(id) {
    return teachers.find((teacher) => teacher.id === id)?.full_name ?? 'Unknown teacher';
  }

  function subjectName(id) {
    return subjects.find((subject) => subject.id === id)?.name ?? 'Unknown subject';
  }

  return (
    <section className="mx-auto mt-8 max-w-5xl space-y-6 p-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">
          Teacher subject assignments
        </h2>
        <p className="mt-2 text-slate-600">
          Choose a teacher, a subject, and the grades they teach.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 font-medium text-slate-700">
            Teacher *
            <select
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              required
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name} ({teacher.employee_number})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 font-medium text-slate-700">
            Subject *
            <select
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              required
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="mb-3 font-medium text-slate-700">
            Grades taught *
          </legend>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            {Array.from({ length: 13 }, (_, index) => index + 1).map((grade) => (
              <label
                key={grade}
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-3"
              >
                <input
                  type="checkbox"
                  checked={gradeLevels.includes(grade)}
                  onChange={() => toggleGrade(grade)}
                />
                Grade {grade}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          className="rounded-lg bg-sky-700 px-6 py-3 font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={saving || teachers.length === 0 || subjects.length === 0}
        >
          {saving ? 'Saving...' : 'Save assignment'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 p-6 text-xl font-semibold text-slate-900">
          Current assignments
        </h3>

        {loading ? (
          <p className="p-6 text-slate-600">Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="p-6 text-slate-600">No assignments added yet.</p>
        ) : (
          <div className="divide-y divide-slate-200">
            {assignments.map((assignment) => (
              <div
                key={`${assignment.teacher_id}-${assignment.subject_id}`}
                className="flex flex-col gap-2 p-6 sm:flex-row sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {teacherName(assignment.teacher_id)}
                  </p>
                  <p className="text-slate-600">
                    {subjectName(assignment.subject_id)}
                  </p>
                </div>
                <p className="text-slate-600">
                  Grades: {assignment.grade_levels.join(', ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}