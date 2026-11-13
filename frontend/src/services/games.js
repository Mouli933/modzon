import { apiRequest } from './api';

const excludedGameSlugs = new Set(['valorant', 'minecraft', 'among-us']);

export async function getAvailableGames() {
  const response = await apiRequest('/games');
  return response.games.filter((game) => !excludedGameSlugs.has(game.slug));
}
