import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../utils/cookies.js';
import { HttpError } from '../utils/httpError.js';

export async function requireAuth(request, response, next) {
  const token = request.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return next(new HttpError(401, 'Please log in to access this resource.'));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload || typeof payload !== 'object' || typeof payload.sub !== 'string') {
      throw new Error('Invalid token subject.');
    }
  } catch {
    return next(new HttpError(401, 'Please log in to access this resource.'));
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [payload.sub],
    );
    if (result.rowCount === 0) {
      return next(new HttpError(401, 'Please log in to access this resource.'));
    }

    request.user = result.rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}
