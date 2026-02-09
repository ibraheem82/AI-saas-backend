/**
 * Environment Variable Validation Utility
 * * This module ensures all required environment variables are present
 * and correctly formatted before the server starts. This prevents
 * cryptic runtime errors and provides clear feedback during deployment.
 */

interface EnvConfig {
    name: string;
    required: boolean;
    validator?: (value: string) => boolean;
    hint?: string;
}

const requiredVariables: EnvConfig[] = [
    {
        name: 'MONGO_URL',
        required: true,
        validator: (val) => val.startsWith('mongodb'),
        hint: 'Should be a valid MongoDB connection string starting with "mongodb://" or "mongodb+srv://"'
    },
    {
        name: 'JWT_SECRET',
        required: true,
        validator: (val) => val.length >= 16,
        hint: 'Should be at least 16 characters for security'
    },
    // --- UPDATED: Groq Validation ---
    {
        name: 'GROQ_API_KEY',
        required: true,
        validator: (val) => val.startsWith('gsk_'),
        hint: 'Your Groq API key (starts with gsk_)'
    },
    {
        name: 'PAYSTACK_SECRET_KEY',
        required: true,
        validator: (val) => val.startsWith('sk_'),
        hint: 'Should start with "sk_test_" (test) or "sk_live_" (production)'
    },
    {
        name: 'FRONTEND_URL',
        required: false,
        hint: 'URL of the frontend for CORS configuration'
    }
];

export const validateEnv = (): void => {
    const errors: string[] = [];

    console.log('\n🔐 Validating environment configuration...\n');

    for (const variable of requiredVariables) {
        const value = process.env[variable.name];

        if (!value) {
            if (variable.required) {
                errors.push(`❌ Missing required: ${variable.name}${variable.hint ? ` (${variable.hint})` : ''}`);
            } else {
                console.log(`⚠️  Optional missing: ${variable.name}`);
            }
            continue;
        }

        if (variable.validator && !variable.validator(value)) {
            errors.push(`❌ Invalid format: ${variable.name}${variable.hint ? ` - ${variable.hint}` : ''}`);
            continue;
        }

        console.log(`✅ ${variable.name}: Configured`);
    }

    if (errors.length > 0) {
        console.error('\n🚨 Environment validation failed:\n');
        errors.forEach(err => console.error(`   ${err}`));
        console.error('\n💡 Please check your .env file and ensure all required variables are set.\n');
        process.exit(1);
    }

    console.log('\n✨ Environment validation passed!\n');
};