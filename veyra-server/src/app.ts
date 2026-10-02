/** Express app: middleware stack, route mounting, error handler. No listen() here. */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { requestId } from './middleware/requestId.js';
import { defaultRateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { mountRoutes } from './routes/index.js';

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utilities
app.use(requestId);
app.use(defaultRateLimit);

// Routes
mountRoutes(app);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app };
