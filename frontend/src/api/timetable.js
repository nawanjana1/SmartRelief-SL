async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Timetable request failed');
  }

  return result;
}

export async function getTimetable() {
  const response = await fetch('/api/timetable');
  return readResponse(response);
}

export async function addTimetableEntry(entry) {
  const response = await fetch('/api/timetable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });

  return readResponse(response);
}