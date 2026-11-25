import { getAttendance } from './attendance.js';
import { getClasses } from './classes.js';
import { getReliefAssignments } from './reliefAssignments.js';
import { getSubjects } from './subjects.js';
import { getTeachers } from './teachers.js';
import { getTimetable } from './timetable.js';

export async function getDashboardData(date, academicYear, term) {
  const [
    teachers,
    attendance,
    assignments,
    timetable,
    classes,
    subjects,
  ] = await Promise.all([
    getTeachers(),
    getAttendance(date),
    getReliefAssignments(date),
    getTimetable(),
    getClasses(),
    getSubjects(),
  ]);

  const weekday = new Date(`${date}T00:00:00`).getDay();
  const activeTeachers = teachers.filter((teacher) => teacher.is_active);
  const absentIds = attendance
    .filter((record) => ['absent', 'half_day'].includes(record.status))
    .map((record) => record.teacher_id);

  const affectedPeriods = timetable
    .filter(
      (entry) =>
        entry.academic_year === Number(academicYear) &&
        entry.term === Number(term) &&
        entry.weekday === weekday &&
        absentIds.includes(entry.teacher_id),
    )
    .map((entry) => {
      const schoolClass = classes.find((item) => item.id === entry.class_id);
      const subject = subjects.find((item) => item.id === entry.subject_id);
      const teacher = teachers.find((item) => item.id === entry.teacher_id);
      const assignment = assignments.find(
        (item) => item.timetable_entry_id === entry.id,
      );

      return {
        id: entry.id,
        period: `P-${entry.period_number}`,
        className: schoolClass
          ? `Grade ${schoolClass.grade}-${schoolClass.section}`
          : 'Class',
        subject: subject?.name ?? 'Subject',
        teacher: teacher?.full_name ?? 'Teacher',
        assigned: Boolean(assignment),
      };
    });

  return {
    teachers,
    classes,
    subjects,
    activeTeacherCount: activeTeachers.length,
    presentCount: attendance.filter((item) => item.status === 'present').length,
    absentCount: attendance.filter((item) =>
      ['absent', 'morning_half_day', 'afternoon_half_day'].includes(item.status),
    ).length,
    coveredCount: affectedPeriods.filter((item) => item.assigned).length,
    affectedPeriods,
  };
}
