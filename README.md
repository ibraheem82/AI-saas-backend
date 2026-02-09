# TalkFlow AI - Premium Generative Suite (Backend)

Welcome to the **TalkFlow AI** backend engine. This is a high-performance, TypeScript-based API designed to power a modern AI SaaS platform. It leverages the Google Gemini Pro architecture for intelligent content generation and integrates Paystack for seamless subscription monetization.

---

## 🚀 Architectural Vision

TalkFlow AI is built on a "Service-Oriented Model" that decouples AI orchestration from payment processing and identity management.

### Key Pillars:
1. **Intelligence**: Direct integration with Google Gemini API for context-aware content synthesis.
2. **Monetization**: Tiered subscription logic integrated with Paystack's payment webhooks.
3. **Security**: Multi-layered protection using JWT (HTTP-only cookies), Express Rate Limit, and Helmet.
4. **Stability**: Fully typed with TypeScript to ensure runtime reliability and developer efficiency.

---

## 🛠️ Tech Stack

### Core Engine
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)

### Integration Layer
- **AI**: Google Gemini Pro (Generative AI SDK)
- **Payments**: Paystack (Transaction Verification Layer)
- **Scheduling**: Node-Cron (Subscription Lifecycle Management)

### Security Suite
- **Auth**: JSON Web Tokens (JWT) + BcryptJS
- **Protection**: Express-Rate-Limit, Helmet, HPP, XSS-Clean
- **Data Integrity**: Express-Mongo-Sanitize, Yup/Validation logic

---

## 📁 Project Structure

```bash
sass-backend/
├── src/
│   ├── controllers/      # Service Logic (AI, Auth, Payments)
│   ├── middlewares/      # Security & Pipeline Guards (Rate Limit, Auth)
│   ├── models/           # Mongoose Data Schemas
│   ├── routes/           # RESTful Endpoint Definitions
│   ├── types/            # Global TypeScript Interfaces
│   ├── utils/            # Shared Utilities (DB Connect, Date Logic)
│   └── server.ts         # Application Entry Point
├── .env                  # Environment Configuration (Local)
├── package.json          # Dependency Manifest
└── tsconfig.json         # TypeScript Compiler Config
```

---

## ⚙️ Setup & Installation

### 1. Environment Configuration
Create a `.env` file in the root directory:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secure_authentication_secret
GEMINI_API_KEY=your_google_gemini_api_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PORT=8090
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. Dependency Injection
```bash
npm install
```

### 3. Execution
```bash
# Development (with TSX Watch)
npm run dev

# Production Build
npm run build
npm start
```

---

## 📡 API Ecosystem

### 🔐 Identity Management
- `POST /api/v1/users/register`: Create a new neural identity.
- `POST /api/v1/users/login`: Initialize session via secure cookies.
- `GET /api/v1/users/profile`: Retrieve account metrics and credit status.

### 🧠 Intelligence Suite
- `POST /api/v1/google/generate-content`: Synthesize content via Gemini Pro.
  - *Note: Subject to subscription-based rate limits.*

### 💳 Commerce & Subscription
- `POST /api/v1/paystack/verify-payment/:reference`: Finalize commerce transactions.
- `POST /api/v1/paystack/free-plan`: Activate the 'Explorer' tier (3-day trial).

---

## 🏦 Subscription Matrix

| Tier | Capacity | Duration | Notes |
| :--- | :--- | :--- | :--- |
| **Explorer (Trial)** | 100 Credits | 3 Days | High-intensity onboarding |
| **Free** | 5 Credits | Perpetual | Basic exploration |
| **Basic** | 50 Credits | 30 Days | Professional standard |
| **Premium** | 100 Credits | 30 Days | Enterprise-grade generation |

---

## 🛡️ Senior Developer Notes

> [!IMPORTANT]
> **Rate Limiting Engine**: The backend implements a dynamic rate-limiting middleware that checks the user's `plan` before every AI request. This is critical for maintaining infrastructure budget and prevents API abuse.
>
> **Atomic Payments**: Payment verification is performed server-side via direct Paystack API calls using the client-provided reference. Access is only granted *after* a 'success' response from Paystack, preventing frontend injection attacks.

---

## 📜 License
This software is licensed under the **ISC License**. Designed with excellence by the TalkFlow Team.
