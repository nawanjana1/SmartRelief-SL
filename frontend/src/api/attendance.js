import { apiFetch } from './apiFetch.js';

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Attendance request failed');
  }

  return result;
}

export async function getAttendance(date) {
  const response = await apiFetch(
    `/api/teacher-attendance?date=${encodeURIComponent(date)}`,
  );
  return readResponse(response);
}

export async function addAttendance(record) {
  const response = await apiFetch('/api/teacher-attendance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  return readResponse(response);
}

export async function updateAttendance(id, updates) {
  const response = await apiFetch(`/api/teacher-attendance/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return readResponse(response);
}

