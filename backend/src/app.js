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
  return app;
}