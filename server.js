import express from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import usersRouter from "./routes/usersRouter.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import googleAIRouter from "./routes/geminiAIRouter.js";
import paystackRouter from "./routes/paystackRouter.js";
import User from "./models/User.js";
import connectDB from "./utils/connectDB.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8090;

/*
! Explanation CRON JOB
-> The Cron Pattern "0 0 * * * *":
This string is a standard way to define recurring time intervals. The pattern has six parts: second minute hour day_of_month month day_of_week.
 ----> 0: the 0th second
0: the 0th minute
2: the 2nd hour (2:00 AM)
2: on the 2nd day of the month
4: the 4th month (April)
3: the 3rd day of the week (Wednesday, assuming Sunday is 0 or 7, and Monday is 1. Some systems use 0-6 or 1-7 for day of week). Let's assume Monday=1, so 3 means Wednesday.
  0: Specifies the second (the 0th second).
  0: Specifies the minute (the 0th minute).
  *: Specifies every hour.
  *: Specifies every day of the month.
  *: Specifies every month.
  *: Specifies every day of the week.


    ->

    */

// Cron job to expire trial periods - runs every hour
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running trial expiration cron job...");
    const today = new Date();
    const result = await User.updateMany({
      trialActive: true,
      trialExpires: { $lt: today }
    }, {
      trialActive: false,
      subscriptionPlan: 'Free',
      monthlyRequestCount: 5
    }
    );
    console.log(`Trial expiration cron completed: ${result.modifiedCount} users updated`);
  } catch (error) {
    console.error("Error in trial expiration cron job:", error);
  }
});

//Cron for all paid plans: run at the start of each month (1st day at midnight)
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Running monthly subscription reset cron job...");
    const today = new Date();

    // Reset Free plan users
    const freeResult = await User.updateMany(
      {
        subscriptionPlan: "Free",
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
        subscriptionPlan: "Basic",
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
        subscriptionPlan: "Premium",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 100,
        apiRequestCount: 0,
      }
    );
    console.log(`Premium plan reset: ${premiumResult.modifiedCount} users updated`);

    console.log("Monthly subscription reset cron completed");
  } catch (error) {
    console.error("Error in monthly subscription reset cron job:", error);
  }
});

// Connect to database
connectDB();

//---- Security Middlewares ----
// Helmet helps secure Express apps by setting HTTP response headers
app.use(helmet());

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/", limiter);

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again after 15 minutes",
});

//---- Middlewares ----
// Body parser with size limit (prevent DOS attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// CORS configuration - supports multiple origins via environment variable
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

//---- Routes ----
app.use("/api/v1/users/login", authLimiter); // Apply strict rate limiting to login
app.use("/api/v1/users/register", authLimiter); // Apply strict rate limiting to register

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/google", googleAIRouter);
app.use("/api/v1/paystack", paystackRouter);

//--- Error handler middleware ----
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running securely on port ${PORT}`));
