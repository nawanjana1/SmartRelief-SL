import { apiFetch } from './apiFetch.js';

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Relief assignment request failed');
  }

  return result;
}

export async function getReliefAssignments(date) {
  const response = await apiFetch(
    `/api/relief-assignments?date=${encodeURIComponent(date)}`,
  );
  return readResponse(response);
}

export async function addReliefAssignment(assignment) {
  const response = await apiFetch('/api/relief-assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignment),
  });

  return readResponse(response);
}

