
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';

// Route Imports
import authRoutes from './modules/auth/auth.routes.js';
import partyRoutes from './modules/parties/parties.routes.js';
import locationRoutes from './modules/locations/locations.routes.js';
import equipmentRoutes from './modules/equipment/equipment.routes.js';
import driverRoutes from './modules/drivers/drivers.routes.js';
import loadRoutes from './modules/loads/loads.routes.js';
import offersRoutes from './modules/offers/offers.routes.js';
import trackingRoutes from './modules/tracking/tracking.routes.js';
import invoiceRoutes from './modules/invoices/invoices.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import userRoutes from './modules/users/users.routes.js';
import documentRoutes from './modules/documents/documents.routes.js';
import shipmentsRoutes from './modules/shipments/shipments.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Static files
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const API_PREFIX = `/api/${env.API_VERSION}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/parties`, partyRoutes);
app.use(`${API_PREFIX}/locations`, locationRoutes);
app.use(`${API_PREFIX}/equipment`, equipmentRoutes);
app.use(`${API_PREFIX}/drivers`, driverRoutes);
app.use(`${API_PREFIX}/loads`, loadRoutes);
app.use(`${API_PREFIX}/offers`, offersRoutes);
app.use(`${API_PREFIX}/tracking`, trackingRoutes);
app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
app.use(`${API_PREFIX}/payments`, paymentsRoutes);
app.use(`${API_PREFIX}/reviews`, reviewsRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/documents`, documentRoutes);
app.use(`${API_PREFIX}/hauls`, shipmentsRoutes);

// Error Handling
app.use(errorHandler);

export default app;
