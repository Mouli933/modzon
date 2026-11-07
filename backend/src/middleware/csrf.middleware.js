import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function verifyRequestOrigin(request, response, next) {
  if (!stateChangingMethods.has(request.method)) {
    return next();
  }

  const origin = request.get('origin');
  if (!origin) {
    return next(new HttpError(403, 'Request origin is required.'));
  }

  let requestOrigin;
  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    return next(new HttpError(403, 'Request origin is not allowed.'));
  }

  if (requestOrigin !== env.CLIENT_ORIGIN) {
    return next(new HttpError(403, 'Request origin is not allowed.'));
  }

  return next();
}
