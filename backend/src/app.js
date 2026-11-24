import cors from 'cors';
import express from 'express';
import { supabase } from './lib/supabase.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'smartrelief-api' });
  });

  app.get('/api/teachers', async (_request, response) => {
    const { data, error } = await supabase
      .from('teachers')
      .select('id, employee_number, full_name, email, department, is_active')
      .order('full_name');

    if (error) {
      console.error('Failed to load teachers:', error.message);
      return response.status(500).json({ error: 'Unable to load teachers' });
    }

    return response.json(data);
  });
  app.post('/api/teachers', async (request, response) => {
    const body = request.body ?? {};
    const employeeNumber =
      typeof body.employee_number === 'string' ? body.employee_number.trim() : '';
    const fullName =
      typeof body.full_name === 'string' ? body.full_name.trim() : '';
    const email =
      typeof body.email === 'string' && body.email.trim()
        ? body.email.trim().toLowerCase()
        : null;
    const department =
      typeof body.department === 'string' && body.department.trim()
        ? body.department.trim()
        : null;

    if (!employeeNumber || !fullName) {
      return response.status(400).json({
        error: 'Employee number and full name are required',
      });
    }

    const { data, error } = await supabase
      .from('teachers')
      .insert({
        employee_number: employeeNumber,
        full_name: fullName,
        email,
        department,
      })
      .select('id, employee_number, full_name, email, department, is_active')
      .single();

    if (error) {
      if (error.code === '23505') {
        return response.status(409).json({
          error: 'That employee number or email already exists',
        });
      }

      console.error('Failed to add teacher:', error.message);
      return response.status(500).json({ error: 'Unable to add teacher' });
    }

    return response.status(201).json(data);
  });
  
    app.patch('/api/teachers/:id', async (request, response) => {
    const body = request.body ?? {};
    const updates = {};

    if ('employee_number' in body) {
      if (typeof body.employee_number !== 'string' || !body.employee_number.trim()) {
        return response.status(400).json({ error: 'Employee number cannot be empty' });
      }
      updates.employee_number = body.employee_number.trim();
    }

    if ('full_name' in body) {
      if (typeof body.full_name !== 'string' || !body.full_name.trim()) {
        return response.status(400).json({ error: 'Full name cannot be empty' });
      }
      updates.full_name = body.full_name.trim();
    }

    if ('email' in body) {
      if (body.email !== null && typeof body.email !== 'string') {
        return response.status(400).json({ error: 'Email must be text or empty' });
      }
      updates.email =
        typeof body.email === 'string' && body.email.trim()
          ? body.email.trim().toLowerCase()
          : null;
    }

    if ('department' in body) {
      if (body.department !== null && typeof body.department !== 'string') {
        return response.status(400).json({ error: 'Department must be text or empty' });
      }
      updates.department =
        typeof body.department === 'string' && body.department.trim()
          ? body.department.trim()
          : null;
    }

    if ('is_active' in body) {
      if (typeof body.is_active !== 'boolean') {
        return response.status(400).json({ error: 'Active status must be true or false' });
      }
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return response.status(400).json({ error: 'No teacher fields were provided' });
    }

    const { data, error } = await supabase
      .from('teachers')
      .update(updates)
      .eq('id', request.params.id)
      .select('id, employee_number, full_name, email, department, is_active');

    if (error) {
      if (error.code === '23505') {
        return response.status(409).json({
          error: 'That employee number or email already exists',
        });
      }

      console.error('Failed to update teacher:', error.message);
      return response.status(500).json({ error: 'Unable to update teacher' });
    }

    if (!data || data.length === 0) {
      return response.status(404).json({ error: 'Teacher not found' });
    }

    return response.json(data[0]);
  });
  
   app.get('/api/subjects', async (_request, response) => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, code, name, is_active')
      .order('name');

    if (error) {
      console.error('Failed to load subjects:', error.message);
      return response.status(500).json({ error: 'Unable to load subjects' });
    }

    return response.json(data);
  });

  app.post('/api/subjects', async (request, response) => {
    const body = request.body ?? {};
    const code =
      typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!code || !name) {
      return response.status(400).json({
        error: 'Subject code and name are required',
      });
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({ code, name })
      .select('id, code, name, is_active')
      .single();

    if (error) {
      if (error.code === '23505') {
        return response.status(409).json({ error: 'That subject code already exists' });
      }

      console.error('Failed to add subject:', error.message);
      return response.status(500).json({ error: 'Unable to add subject' });
    }

    return response.status(201).json(data);
  }); 
 
   app.patch('/api/subjects/:id', async (request, response) => {
    const body = request.body ?? {};
    const updates = {};

    if ('code' in body) {
      if (typeof body.code !== 'string' || !body.code.trim()) {
        return response.status(400).json({ error: 'Subject code cannot be empty' });

         

 
      }
      updates.code = body.code.trim().toUpperCase();
    }

    if ('name' in body) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return response.status(400).json({ error: 'Subject name cannot be empty' });
      }
      updates.name = body.name.trim();
    }

    if ('is_active' in body) {
      if (typeof body.is_active !== 'boolean') {
        return response.status(400).json({ error: 'Active status must be true or false' });
      }
      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return response.status(400).json({ error: 'No subject fields were provided' });
    }

    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', request.params.id)
      .select('id, code, name, is_active');

    if (error) {
      if (error.code === '23505') {
        return response.status(409).json({ error: 'That subject code already exists' });
      }

      console.error('Failed to update subject:', error.message);
      return response.status(500).json({ error: 'Unable to update subject' });
    }

    if (!data || data.length === 0) {
      return response.status(404).json({ error: 'Subject not found' });
    }

    return response.json(data[0]);
  });
  
   app.post('/api/classes', async (request, response) => {
    const body = request.body ?? {};
    const grade = Number(body.grade);
    const section =
      typeof body.section === 'string' ? body.section.trim().toUpperCase() : '';

    if (!Number.isInteger(grade) || grade < 1 || grade > 13 || !section) {
      return response.status(400).json({
        error: 'Grade (1–13) and section are required',
      });
    }

    const { data, error } = await supabase
      .from('school_classes')
      .insert({ grade, section })
      .select('id, grade, section, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return response.status(409).json({
          error: 'That grade and section already exist',
        });
      }

      console.error('Failed to add class:', error.message);
      return response.status(500).json({ error: 'Unable to add class' });
    }

    return response.status(201).json(data);
  }); 
  app.get('/api/classes', async (_request, response) => {
    const { data, error } = await supabase
      .from('school_classes')
      .select('id, grade, section, created_at')
      .order('grade')
      .order('section');

    if (error) {
      console.error('Failed to load classes:', error.message);
      return response.status(500).json({ error: 'Unable to load classes' });
    }

    return response.json(data);
  });
  
    app.get('/api/teacher-subjects', async (_request, response) => {
    const { data, error } = await supabase
      .from('teacher_subjects')
      .select('teacher_id, subject_id, grade_levels')
      .order('teacher_id');

    if (error) {
      console.error('Failed to load teacher subjects:', error.message);
      return response.status(500).json({ error: 'Unable to load assignments' });
    }

    return response.json(data);
  });

  app.post('/api/teacher-subjects', async (request, response) => {
    const body = request.body ?? {};
    const teacherId =
      typeof body.teacher_id === 'string' ? body.teacher_id.trim() : '';
    const subjectId =
      typeof body.subject_id === 'string' ? body.subject_id.trim() : '';
    const gradeLevels = Array.isArray(body.grade_levels)
      ? [...new Set(body.grade_levels)]
      : [];

    if (
      !teacherId ||
      !subjectId ||
      gradeLevels.length === 0 ||
      !gradeLevels.every(
        (grade) => Number.isInteger(grade) && grade >= 1 && grade <= 13,
      )
    ) {
      return response.status(400).json({
        error: 'Teacher, subject, and valid grade levels are required',
      });
    }

    const { data, error } = await supabase
      .from('teacher_subjects')
      .upsert(
        {
          teacher_id: teacherId,
          subject_id: subjectId,
          grade_levels: gradeLevels.sort((a, b) => a - b),
        },
        { onConflict: 'teacher_id,subject_id' },
      )
      .select('teacher_id, subject_id, grade_levels')
      .single();

    if (error) {
      console.error('Failed to save teacher subject:', error.message);
      return response.status(500).json({ error: 'Unable to save assignment' });
    }

    return response.status(201).json(data);
  });
 
    app.get('/api/teacher-attendance', async (request, response) => {
    const date = request.query.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return response.status(400).json({ error: 'A valid date is required' });
    }

    const { data, error } = await supabase
      .from('teacher_attendance')
      .select('id, teacher_id, attendance_date, status, note')
      .eq('attendance_date', date)
      .order('teacher_id');

    if (error) {
      console.error('Failed to load attendance:', error.message);
      return response.status(500).json({ error: 'Unable to load attendance' });
    }

    return response.json(data);
  });

  app.post('/api/teacher-attendance', async (request, response) => {
    const body = request.body ?? {};
    const teacherId =
      typeof body.teacher_id === 'string' ? body.teacher_id.trim() : '';
    const date =
      typeof body.attendance_date === 'string' ? body.attendance_date : '';
    const status = body.status;
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (
      !teacherId ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !['present', 'absent', 'half_day'].includes(status)
    ) {
      return response.status(400).json({
        error: 'Teacher, date, and a valid attendance status are required',
      });
    }

    const { data, error } = await supabase
      .from('teacher_attendance')
      .insert({
        teacher_id: teacherId,
        attendance_date: date,
        status,
        note: note || null,
      })
      .select('id, teacher_id, attendance_date, status, note')
      .single();

    if (error) {
      console.error('Failed to save attendance:', error.message);
      return response.status(500).json({ error: 'Unable to save attendance' });
    }

    return response.status(201).json(data);
  });

  app.patch('/api/teacher-attendance/:id', async (request, response) => {
    const body = request.body ?? {};
    const status = body.status;
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!['present', 'absent', 'half_day'].includes(status)) {
      return response.status(400).json({ error: 'A valid status is required' });
    }

    const { data, error } = await supabase
      .from('teacher_attendance')
      .update({ status, note: note || null })
      .eq('id', request.params.id)
      .select('id, teacher_id, attendance_date, status, note')
      .single();

    if (error) {
      console.error('Failed to update attendance:', error.message);
      return response.status(500).json({ error: 'Unable to update attendance' });
    }

    return response.json(data);
  });
  
    app.get('/api/timetable', async (_request, response) => {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select(
        'id, academic_year, term, weekday, class_id, period_number, subject_id, teacher_id, room',
      )
      .order('academic_year')
      .order('term')
      .order('weekday')
      .order('period_number');

    if (error) {
      console.error('Failed to load timetable:', error.message);
      return response.status(500).json({ error: 'Unable to load timetable' });
    }

    return response.json(data);
  });

  app.post('/api/timetable', async (request, response) => {
    const body = request.body ?? {};
    const academicYear = Number(body.academic_year);
    const term = Number(body.term);
    const weekday = Number(body.weekday);
    const periodNumber = Number(body.period_number);
    const classId = typeof body.class_id === 'string' ? body.class_id : '';
    const subjectId = typeof body.subject_id === 'string' ? body.subject_id : '';
    const teacherId = typeof body.teacher_id === 'string' ? body.teacher_id : '';
    const room = typeof body.room === 'string' ? body.room.trim() : '';

    if (
      !Number.isInteger(academicYear) ||
      !Number.isInteger(term) ||
      term < 1 ||
      term > 3 ||
      !Number.isInteger(weekday) ||
      weekday < 1 ||
      weekday > 5 ||
      !Number.isInteger(periodNumber) ||
      periodNumber < 1 ||
      !classId ||
      !subjectId ||
      !teacherId
    ) {
      return response.status(400).json({
        error: 'Academic year, term, weekday, period, class, subject, and teacher are required',
      });
    }

    const { data, error } = await supabase
      .from('timetable_entries')
      .insert({
        academic_year: academicYear,
        term,
        weekday,
        class_id: classId,
        period_number: periodNumber,
        subject_id: subjectId,
        teacher_id: teacherId,
        room: room || null,
      })
      .select(
        'id, academic_year, term, weekday, class_id, period_number, subject_id, teacher_id, room',
      )
      .single();

    if (error) {
      console.error('Failed to add timetable entry:', error.message);
      return response.status(500).json({ error: 'Unable to add timetable entry' });
    }

    return response.status(201).json(data);
  });
  return app;
}