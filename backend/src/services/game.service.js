import { findGame, games, getPublicGame } from '../config/games.js';
import { HttpError } from '../utils/httpError.js';

export function listPublicGames() {
  return games.map(getPublicGame);
}

export function getPublicGameBySlug(slug) {
  const game = findGame(slug);
  if (!game) {
    throw new HttpError(404, 'Game not found.');
  }
  return getPublicGame(game);
}

export function getGameAccessBySlug(slug) {
  const game = findGame(slug);
  if (!game) {
    throw new HttpError(404, 'Game not found.');
  }
  return { game: getPublicGame(game), url: game.githubUrl };
}
