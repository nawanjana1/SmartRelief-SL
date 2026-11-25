import { apiFetch } from './apiFetch.js';

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Assignment request failed');
  }

  return result;
}

export async function getTeacherSubjects() {
  const response = await apiFetch('/api/teacher-subjects');
  return readResponse(response);
}

export async function saveTeacherSubject(assignment) {
  const response = await apiFetch('/api/teacher-subjects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignment),
  });

  return readResponse(response);
}

