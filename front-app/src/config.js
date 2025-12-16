/**
 * Centralized application configuration
 * Manages environment-based settings for the frontend
 */

export const config = {
  // API Base URL from environment variable, fallback to localhost for development
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090',

  // Paystack Public Key from environment variable (replacing Stripe)
  paystackPublicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',

  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
