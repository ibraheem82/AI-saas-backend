# AI SaaS Application - MERN Stack

A full-stack AI-powered SaaS application built with the MERN stack (MongoDB, Express, React, Node.js) featuring Google Gemini AI integration, Stripe payment processing, and subscription management.

## Features

- 🤖 AI content generation powered by Google Gemini
- 💳 Stripe payment integration for subscription plans
- 👤 User authentication with JWT
- 📊 Subscription management (Trial, Free, Basic, Premium)
- 🔒 Secure API request rate limiting
- 📅 Automated subscription renewal via cron jobs
- 🎨 Modern React frontend with TanStack Query
- 💅 Styled with Tailwind CSS

## Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Google Gemini AI** - Content generation
- **node-cron** - Scheduled tasks

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TanStack Query** - Data fetching and state management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Formik** & **Yup** - Form handling and validation
- **Stripe React** - Payment UI components

## Project Structure

```
AI-saas-application-mern-main/
├── controllers/          # Business logic
│   ├── usersControllers.js
│   ├── googleAIController.js
│   └── handleStripePayment.js
├── middlewares/          # Custom middleware
│   ├── isAuthenticated.js
│   ├── checkApiRequestLimit.js
│   └── errorMiddleware.js
├── models/              # Database models
│   ├── User.js
│   ├── Payment.js
│   └── ContentHistory.js
├── routes/              # API routes
│   ├── usersRouter.js
│   ├── geminiAIRouter.js
│   └── stripeRouter.js
├── utils/               # Utility functions
│   ├── connectDB.js
│   ├── calculateNextBillingDate.js
│   └── shouldRenewSubscriptionPlan.js
├── front-app/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── apis/
│   │   ├── AuthContext/
│   │   └── config.js
│   └── package.json
├── server.js            # Main server file
├── .env.example         # Environment variables template
└── package.json
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account
- Google Gemini API key

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd AI-saas-application-mern-main
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your credentials:
# - MONGO_URL: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - GEMINI_API_KEY: Your Google Gemini API key
# - STRIPE_SECRET_KEY: Your Stripe secret key
# - FRONTEND_URL: Your frontend URL (http://localhost:5173 for dev)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd front-app

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add:
# - VITE_API_BASE_URL: Backend URL (http://localhost:8090 for dev)
# - VITE_STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
# From root directory
npm start
```

**Terminal 2 - Frontend:**
```bash
# From front-app directory
npm run dev
```

The backend will run on `http://localhost:8090`  
The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/ai-saas-db
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
PORT=8090
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (front-app/.env)
```env
VITE_API_BASE_URL=http://localhost:8090
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user
- `GET /api/v1/users/auth/check` - Check auth status
- `GET /api/v1/users/profile` - Get user profile (protected)

### AI Content Generation
- `POST /api/v1/google/generate-content` - Generate AI content (protected, rate-limited)

### Payment & Subscription
- `POST /api/v1/stripe/checkout` - Create payment intent
- `POST /api/v1/stripe/verify-payment/:paymentId` - Verify payment
- `POST /api/v1/stripe/free-plan` - Subscribe to free plan (protected)

## Subscription Plans

| Plan | Monthly Requests | Price |
|------|-----------------|-------|
| Trial | 100 | Free (3 days) |
| Free | 5 | $0 |
| Basic | 50 | (Configure in Stripe) |
| Premium | 100 | (Configure in Stripe) |

## Automated Tasks

The application uses cron jobs for automated subscription management:

- **Trial Expiration**: Runs every hour to check and expire trial periods
- **Monthly Reset**: Runs on the 1st of each month to reset API request counts

## Security Features

- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- API request rate limiting per subscription plan
- CORS configuration for frontend/backend separation
- Environment-based configuration

## Development

### Code Quality
- ESLint configured for both backend and frontend
- Consistent error handling across all endpoints
- Comprehensive error messages for better debugging

### State Management
- TanStack Query for server state
- React Context for authentication state
- Optimistic updates for better UX

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Update `FRONTEND_URL` to your production frontend URL
3. Use a production MongoDB database
4. Configure proper CORS origins
5. Use production Stripe keys

### Frontend Deployment
1. Update `VITE_API_BASE_URL` to your production backend URL
2. Update `VITE_STRIPE_PUBLISHABLE_KEY` to production key
3. Build the frontend: `npm run build`
4. Deploy the `dist` folder to your hosting service

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check `MONGO_URL` in `.env`

**CORS Error**
- Verify `FRONTEND_URL` matches your frontend origin
- Check that both servers are running

**Payment Failures**
- Confirm Stripe keys in both backend and frontend
- Use test mode keys during development

**API Request Limit**
- Check user's subscription plan
- Verify monthly request count hasn't been exceeded

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the repository.
