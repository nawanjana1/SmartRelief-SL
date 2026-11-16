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
  return app;
}