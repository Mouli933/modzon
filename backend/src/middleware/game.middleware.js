import { findGame } from '../config/games.js';
import { HttpError } from '../utils/httpError.js';

export function requireExistingGame(request, response, next) {
  if (!findGame(request.params.slug)) {
    return next(new HttpError(404, 'Game not found.'));
  }
  return next();
}
