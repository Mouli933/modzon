import { authenticateUser, registerUser } from '../services/auth.service.js';
import { clearAuthCookie, setAuthCookie } from '../utils/cookies.js';

export async function signup(request, response) {
  const user = await registerUser(request.body);
  response.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user,
  });
}

export async function login(request, response) {
  const { token, user } = await authenticateUser(request.body);
  setAuthCookie(response, token);
  response.status(200).json({ success: true, user });
}

export function logout(request, response) {
  clearAuthCookie(response);
  response.status(200).json({ success: true, message: 'Logged out successfully.' });
}

export function currentUser(request, response) {
  response.status(200).json({ success: true, user: request.user });
}
