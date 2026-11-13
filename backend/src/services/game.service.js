import { readFileSync } from 'node:fs';
import { findGame, games, getPublicGame } from '../config/games.js';
import { HttpError } from '../utils/httpError.js';

const cheatTableLinks = JSON.parse(
  readFileSync(new URL('../../private-config/cheat-table-links.json', import.meta.url), 'utf8'),
);

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

export async function getCheatTableDownloadBySlug(slug) {
  const game = findGame(slug);
  const url = cheatTableLinks[slug];
  if (game && url === 'MEDIAFIRE_URL') {
    throw new HttpError(404, 'Cheat Table Currently Unavailable.');
  }
  if (!game || typeof url !== 'string') {
    throw new HttpError(404, 'Cheat table not available.');
  }

  const mediaFireUrl = new URL(url);
  if (mediaFireUrl.protocol !== 'https:' || mediaFireUrl.hostname !== 'www.mediafire.com') {
    throw new Error(`Invalid MediaFire cheat-table URL configured for ${slug}.`);
  }

  return { url: mediaFireUrl.href };
}
