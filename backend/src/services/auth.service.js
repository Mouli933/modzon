import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const BCRYPT_ROUNDS = 12;

export async function registerUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, created_at`,
    [randomUUID(), name, email, passwordHash],
  );
  return result.rows[0];
}

export async function authenticateUser({ email, password }) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = $1',
    [email],
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '1d' });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}
