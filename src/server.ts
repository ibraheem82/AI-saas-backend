import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import usersRouter from './routes/usersRouter.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import googleAIRouter from './routes/geminiAIRouter.js';
import paystackRouter from './routes/paystackRouter.js';
import User from './models/User.js';
import connectDB from './utils/connectDB.js';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8090;

// Cron job to expire trial periods - runs every hour
cron.schedule('0 * * * *', async () => {
    try {
        console.log('Running trial expiration cron job...');
        const today = new Date();
        const result = await User.updateMany(
            {
                trialActive: true,
                trialExpires: { $lt: today },
            },
            {
                trialActive: false,
                subscriptionPlan: 'Free',
                monthlyRequestCount: 5,
            }
        );
        console.log(`Trial expiration cron completed: ${result.modifiedCount} users updated`);
    } catch (error) {
        console.error('Error in trial expiration cron job:', error);
    }
});

// Cron for all paid plans: run at the start of each month (1st day at midnight)
cron.schedule('0 0 1 * *', async () => {
    try {
        console.log('Running monthly subscription reset cron job...');
        const today = new Date();

        // Reset Free plan users
        const freeResult = await User.updateMany(
            {
                subscriptionPlan: 'Free',
                nextBillingDate: { $lt: today },
            },
            {
                monthlyRequestCount: 5,
                apiRequestCount: 0,
            }
        );
        console.log(`Free plan reset: ${freeResult.modifiedCount} users updated`);

        // Reset Basic plan users
        const basicResult = await User.updateMany(
            {
                subscriptionPlan: 'Basic',
                nextBillingDate: { $lt: today },
            },
            {
                monthlyRequestCount: 50,
                apiRequestCount: 0,
            }
        );
        console.log(`Basic plan reset: ${basicResult.modifiedCount} users updated`);

        // Reset Premium plan users
        const premiumResult = await User.updateMany(
            {
                subscriptionPlan: 'Premium',
                nextBillingDate: { $lt: today },
            },
            {
                monthlyRequestCount: 100,
                apiRequestCount: 0,
            }
        );
        console.log(`Premium plan reset: ${premiumResult.modifiedCount} users updated`);

        console.log('Monthly subscription reset cron completed');
    } catch (error) {
        console.error('Error in monthly subscription reset cron job:', error);
    }
});

// Connect to database
connectDB();

// ---- Security Middlewares ----
app.use(helmet());

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again after 15 minutes',
});

// ---- Middlewares ----
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173'];

const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// ---- Routes ----
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/register', authLimiter);

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/google', googleAIRouter);
app.use('/api/v1/paystack', paystackRouter);

// --- Error handler middleware ----
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running securely on port ${PORT}`));
