import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { verifyRequestOrigin } from './middleware/csrf.middleware.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import gameRoutes from './routes/game.routes.js';
import userRoutes from './routes/user.routes.js';
import { HttpError } from './utils/httpError.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || new URL(origin).origin === env.CLIENT_ORIGIN) {
      callback(null, true);
      return;
    }
    callback(new HttpError(403, 'Request origin is not allowed.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use('/api', verifyRequestOrigin);

app.get('/api/health', (request, response) => {
  response.status(200).json({
    success: true,
    message: "MODS'ZONE API is running",
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
