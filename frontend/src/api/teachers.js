import { apiFetch } from './apiFetch.js';

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Teacher request failed');
  }

  return result;
}

export async function getTeachers() {
  const response = await apiFetch('/api/teachers');
  return readResponse(response);
}

export async function addTeacher(teacher) {
  const response = await apiFetch('/api/teachers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teacher),
  });

  return readResponse(response);
}

export async function updateTeacher(id, updates) {
  const response = await apiFetch(`/api/teachers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return readResponse(response);
}

