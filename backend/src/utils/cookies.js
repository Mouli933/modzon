import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'modszone_token';

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAME_SITE,
    path: '/',
  };
}

export function setAuthCookie(response, token) {
  response.cookie(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions(),
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(response) {
  response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
}
