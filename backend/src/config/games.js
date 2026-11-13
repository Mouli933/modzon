import { env } from './env.js';

const gameFolders = [
  ['gta-v', 'GTA V', 'GTA V MOD', 'gta-v'],
  ['valorant', 'Valorant', 'VALORANT', 'valorant'],
  ['minecraft', 'Minecraft', 'MINECRAFT', 'minecraft'],
  ['among-us', 'Among Us', 'AMONG US', 'among-us'],
  ['sekiro', 'Sekiro: Shadows Die Twice', 'SEKIRO: SHADOWS DIE TWICE', 'sekiro'],
  ['god-of-war', 'God of War', 'GOD OF WAR', 'god-of-war'],
  ['lies-of-p', 'Lies of P', 'LIES OF P', 'lies-of-p'],
  ['assassins-creed-black-flag', "Assassin's Creed IV: Black Flag", "ASSASSIN'S CREED IV: BLACK FLAG", 'assassins-creed-black-flag'],
  ['spiderman-2', "Marvel's Spider-Man 2", "MARVEL'S SPIDER-MAN 2", 'spiderman-2'],
  ['spiderman-remastered', "Marvel's Spider-Man Remastered", "MARVEL'S SPIDER-MAN REMASTERED", 'spiderman-remastered'],
  ['dying-light-2', 'Dying Light 2', 'DYING LIGHT 2', 'dying-light-2'],
  ['assault-cube', 'AssaultCube', 'ASSAULTCUBE', 'assault-cube'],
  ['elden-ring', 'Elden Ring', 'ELDEN RING', 'elden-ring'],
  ['resident-evil-4-remake', 'Resident Evil 4 Remake', 'RESIDENT EVIL 4 REMAKE', 'resident-evil-4-remake'],
  ['resident-evil-requiem', 'Resident Evil Requiem', 'RESIDENT EVIL REQUIEM', 'resident-evil-requiem'],
];

const baseUrl = `https://github.com/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/tree/${encodeURIComponent(env.GITHUB_BRANCH)}`;

export const games = gameFolders.map(([slug, name, title, folder], index) => ({
  id: index + 1,
  slug,
  name,
  title,
  githubFolder: folder,
  githubUrl: `${baseUrl}/${folder}`,
}));

export function getPublicGame(game) {
  return { id: game.id, slug: game.slug, name: game.name, title: game.title };
}

export function findGame(slug) {
  return games.find((game) => game.slug === slug);
}
