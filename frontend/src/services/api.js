const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok) {
    const error = new Error(payload.message || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }

  return payload;
}
