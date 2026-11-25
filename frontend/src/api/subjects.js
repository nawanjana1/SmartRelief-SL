import { apiFetch } from './apiFetch.js';

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Subject request failed');
  }

  return result;
}

export async function getSubjects() {
  const response = await apiFetch('/api/subjects');
  return readResponse(response);
}

export async function addSubject(subject) {
  const response = await apiFetch('/api/subjects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subject),
  });

  return readResponse(response);
}

export async function updateSubject(id, updates) {
  const response = await apiFetch(`/api/subjects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return readResponse(response);
}

