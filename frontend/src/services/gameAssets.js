const GAME_IMAGES = {
  'gta-v': '/gta1.png',
  sekiro: '/SEKIRO.jpg',
  'god-of-war': '/god.webp',
  'lies-of-p': '/Lies of P.jpg',
  'assassins-creed-black-flag': "/Assassin's Creed IV.jpg",
  'spiderman-2': '/Marvel’s Spider-Man 2.jpg',
  'spiderman-remastered': '/spiderman remaster.png',
  'dying-light-2': '/Dying_Light_2.jpg',
  'assault-cube': '/AssaultCubee.jpg',
  'elden-ring': '/eldenring.jpg',
  'resident-evil-4-remake': '/re4.jpg',
  'resident-evil-requiem': '/resident-evil-requiem.jpg',
};

export function getGameImage(slug) {
  const image = GAME_IMAGES[slug];
  return image ? encodeURI(image) : '';
}
