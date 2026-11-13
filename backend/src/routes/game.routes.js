import { Router } from 'express';
import { gameAccess, gameCheatTable, gameDetails, listGames } from '../controllers/game.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireExistingGame } from '../middleware/game.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { gameSlugSchema } from '../validators/auth.validator.js';

const router = Router();

router.get('/', listGames);
router.get('/:slug/cheat-table', validate(gameSlugSchema, 'params'), requireExistingGame, requireAuth, asyncHandler(gameCheatTable));
router.get('/:slug/access', validate(gameSlugSchema, 'params'), requireExistingGame, requireAuth, asyncHandler(gameAccess));
router.get('/:slug', validate(gameSlugSchema, 'params'), asyncHandler(gameDetails));

export default router;
