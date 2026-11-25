import { apiFetch } from './apiFetch.js';

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Class request failed');
  }

  return result;
}

export async function getClasses() {
  const response = await apiFetch('/api/classes');
  return readResponse(response);
}

export async function addClass(classData) {
  const response = await apiFetch('/api/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  return readResponse(response);
}

