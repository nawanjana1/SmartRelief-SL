import { useEffect, useMemo, useState } from 'react';
import { getAttendance } from './api/attendance.js';
import { getClasses } from './api/classes.js';
import { getReliefAssignments, addReliefAssignment } from './api/reliefAssignments.js';
import { getSubjects } from './api/subjects.js';
import { getTeachers } from './api/teachers.js';
import { getTeacherSubjects } from './api/teacherSubjects.js';
import { getTimetable } from './api/timetable.js';

function todayLocal() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const weekdayNames = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};

export default function ReliefAssignments() {
  const [date, setDate] = useState(todayLocal);
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [term, setTerm] = useState('2');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      getTeachers(),
      getSubjects(),
      getClasses(),
      getTeacherSubjects(),
      getTimetable(),
      getAttendance(date),
      getReliefAssignments(date),
    ])
      .then(([teacherData, subjectData, classData, teacherSubjectData, timetableData, attendanceData, assignmentData]) => {
        if (cancelled) return;
        setTeachers(teacherData.filter((teacher) => teacher.is_active));
        setSubjects(subjectData.filter((subject) => subject.is_active));
        setClasses(classData);
        setTeacherSubjects(teacherSubjectData);
        setTimetable(timetableData);
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

  const recommendations = useMemo(() => {
    const parsedDate = new Date(`${date}T00:00:00`);
    const weekday = parsedDate.getDay();
    if (weekday < 1 || weekday > 5) return [];

    const year = Number(academicYear);
    const selectedTerm = Number(term);
    const absentTeacherIds = attendance
      .filter((record) => ['absent', 'half_day'].includes(record.status))
      .map((record) => record.teacher_id);

    const dayEntries = timetable.filter(
      (entry) =>
        entry.academic_year === year &&
        entry.term === selectedTerm &&
        entry.weekday === weekday,
    );

    const needs = dayEntries.filter((entry) =>
      absentTeacherIds.includes(entry.teacher_id),
    );

    return needs.map((entry) => {
      const schoolClass = classes.find((item) => item.id === entry.class_id);
      const subject = subjects.find((item) => item.id === entry.subject_id);
      const absentTeacher = teachers.find((item) => item.id === entry.teacher_id);
      const alreadyAssigned = assignments.some(
        (item) => item.timetable_entry_id === entry.id,
      );

      const candidates = teacherSubjects
        .filter(
          (item) =>
            item.subject_id === entry.subject_id &&
            item.grade_levels.includes(schoolClass?.grade),
        )
        .map((item) => teachers.find((teacher) => teacher.id === item.teacher_id))
        .filter(
          (teacher) =>
            teacher &&
            teacher.id !== entry.teacher_id &&
            !absentTeacherIds.includes(teacher.id) &&
            !dayEntries.some(
              (other) =>
                other.teacher_id === teacher.id &&
                other.period_number === entry.period_number,
            ),
        )
        .map((teacher) => {
          const dailyLoad = dayEntries.filter(
            (item) => item.teacher_id === teacher.id,
          ).length;
          return {
            ...teacher,
            score: Math.max(50, 100 - dailyLoad * 5),
            dailyLoad,
          };
        })
        .sort((a, b) => b.score - a.score || a.dailyLoad - b.dailyLoad);

      return {
        entry,
        schoolClass,
        subject,
        absentTeacher,
        alreadyAssigned,
        candidates,
      };
    });
  }, [academicYear, assignments, attendance, classes, date, subjects, teacherSubjects, teachers, term, timetable]);

  async function assignRelief(need, candidate) {
    setError('');
    setMessage('');
    setSavingId(need.entry.id);

    try {
      const saved = await addReliefAssignment({
        timetable_entry_id: need.entry.id,
        assignment_date: date,
        absent_teacher_id: need.entry.teacher_id,
        relief_teacher_id: candidate.id,
        suitability_score: candidate.score,
        status: 'assigned',
      });

      setAssignments((current) => [...current, saved]);
      setMessage(`Relief assigned to ${candidate.full_name}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId('');
    }
  }

  function teacherName(id) {
    return teachers.find((teacher) => teacher.id === id)?.full_name ?? 'Unknown teacher';
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          School Relief Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Relief Assignments
        </h1>
        <p className="mt-2 text-slate-600">
          Review available teachers for periods affected by staff absences.
        </p>
      </header>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <label className="space-y-2 font-medium text-slate-700">
          Date
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label className="space-y-2 font-medium text-slate-700">
          Academic year
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="number"
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
          />
        </label>
        <label className="space-y-2 font-medium text-slate-700">
          Term
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {message && <p className="rounded-lg bg-green-50 p-4 text-green-700">{message}</p>}

      {loading ? (
        <p className="rounded-lg bg-white p-6 text-slate-600">Loading recommendations...</p>
      ) : recommendations.length === 0 ? (
        <p className="rounded-lg bg-white p-6 text-slate-600">
          No absent teacher timetable periods found for this date, year, and term.
        </p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((need) => (
            <section
              key={need.entry.id}
              className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {need.subject?.name ?? 'Subject'} · {need.schoolClass ? `Grade ${need.schoolClass.grade}-${need.schoolClass.section}` : 'Class'}
                </h2>
                <p className="mt-1 text-slate-600">
                  {weekdayNames[need.entry.weekday]}, Period {need.entry.period_number}
                  {' · '}Absent: {need.absentTeacher?.full_name ?? teacherName(need.entry.teacher_id)}
                  {need.entry.room ? ` · Room ${need.entry.room}` : ''}
                </p>
              </div>

              {need.alreadyAssigned ? (
                <p className="rounded-lg bg-green-50 p-4 text-green-700">
                  Relief assignment already saved for this period.
                </p>
              ) : need.candidates.length === 0 ? (
                <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
                  No available teacher matched this subject and grade.
                </p>
              ) : (
                <div className="space-y-3">
                  {need.candidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          #{index + 1} {candidate.full_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          Suitability: {candidate.score}% · Today’s periods: {candidate.dailyLoad}
                        </p>
                      </div>
                      <button
                        className="rounded-lg bg-sky-700 px-5 py-2 font-semibold text-white disabled:opacity-60"
                        type="button"
                        disabled={savingId === need.entry.id}
                        onClick={() => assignRelief(need, candidate)}
                      >
                        {savingId === need.entry.id ? 'Saving...' : 'Assign teacher'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}