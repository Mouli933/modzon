const configuredApiUrl = import.meta.env.VITE_API_URL;
const isLocalApiUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(
  configuredApiUrl || '',
);
const API_BASE_URL = !configuredApiUrl || (import.meta.env.PROD && isLocalApiUrl)
  ? '/api'
  : configuredApiUrl;

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new Error('Unable to reach the MODS\'ZONE server. Check that the backend is running and try again.');
  }

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

export async function apiDownload(path) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/octet-stream' },
      credentials: 'include',
    });
  } catch {
    throw new Error('Unable to reach the MODS\'ZONE server. Check that the backend is running and try again.');
  }

  if (!response.ok) {
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    const error = new Error(payload.message || 'The download could not be completed.');
    error.status = response.status;
    throw error;
  }

  return response.blob();
}
