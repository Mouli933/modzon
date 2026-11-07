import { getGameAccessBySlug, getPublicGameBySlug, listPublicGames } from '../services/game.service.js';

export function listGames(request, response) {
  response.status(200).json({ success: true, games: listPublicGames() });
}

export function gameDetails(request, response) {
  response.status(200).json({ success: true, game: getPublicGameBySlug(request.params.slug) });
}

export function gameAccess(request, response) {
  response.status(200).json({
    success: true,
    ...getGameAccessBySlug(request.params.slug),
  });
}
