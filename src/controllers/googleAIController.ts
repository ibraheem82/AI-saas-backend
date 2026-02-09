import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import axios, { AxiosError } from 'axios';
import ContentHistory from '../models/ContentHistory.js';
import User from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';

// --- Interfaces ---
interface GenerateContentBody {
    prompt: string;
}

interface GeminiPart {
    text: string;
}

interface GeminiCandidate {
    content: {
        parts: GeminiPart[];
    };
    finishReason?: string;
}

interface GeminiResponse {
    candidates?: GeminiCandidate[];
    error?: {
        code: number;
        message: string;
        status: string;
    };
}

// --- Controller ---
export const googleAIController = asyncHandler(
    async (req: AuthenticatedRequest & { body: GenerateContentBody }, res: Response): Promise<void> => {
        const { prompt } = req.body;

        // 1. Validation
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            res.status(400);
            throw new Error('Prompt is required and must be a string');
        }

        // 2. Configuration from .env
        const apiKey = process.env.GEMINI_API_KEY;
        // Default to stable Flash model if not specified in .env
        const modelId = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash'; 

        if (!apiKey) {
            res.status(500);
            throw new Error('Server Error: GEMINI_API_KEY is not configured');
        }

        try {
            // 3. Request to Gemini API
            const response = await axios.post<GeminiResponse>(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                { text: prompt.trim() },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192, // High limit for newer models
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 60000, // 60s timeout (AI can be slow)
                }
            );

            // 4. Extract Content
            const candidate = response.data?.candidates?.[0];
            const content = candidate?.content?.parts?.[0]?.text?.trim();

            if (!content) {
                // Handle case where AI returns safety block or empty response
                console.warn('Gemini returned no content. Full response:', JSON.stringify(response.data));
                res.status(422); // Unprocessable Entity
                throw new Error('Gemini could not generate a response (Safety filter or empty result).');
            }

            // 5. Save to ContentHistory
            // Check if req.user exists (since AuthenticatedRequest implies it might be optional in some types)
            if (!req.user?._id) {
                res.status(401);
                throw new Error('User not authenticated');
            }

            const newContent = await ContentHistory.create({
                user: req.user._id,
                content,
            });

            // 6. Update User Stats
            // Using findByIdAndUpdate is often atomic and safer than find -> save
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $push: { contentHistory: newContent._id },
                    $inc: { apiRequestCount: 1 },
                },
                { new: true } // returns the updated document
            );

            // 7. Send Response
            res.status(200).json(content);

        } catch (error: unknown) {
            // --- Robust Error Handling ---
            
            // Cast error to AxiosError to access response properties safely
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<GeminiResponse>;
                const status = axiosError.response?.status;
                const apiMessage = axiosError.response?.data?.error?.message;

                console.error(`Gemini API Error (${status}):`, apiMessage || axiosError.message);

                if (status === 400) {
                    res.status(400);
                    throw new Error(`Bad Request to AI Model: ${apiMessage}`);
                }
                if (status === 401 || status === 403) {
                    res.status(500); // Don't tell client it's 401, that implies THEY are unauthorized. This is a server config error.
                    throw new Error('Server API Key Invalid'); 
                }
                if (status === 429) {
                    res.status(429);
                    throw new Error('AI Service is busy (Rate Limit Exceeded). Please try again in a moment.');
                }
                if (status === 503) {
                    res.status(503);
                    throw new Error('AI Service is temporarily overloaded.');
                }
                
                // Fallback for other axios errors
                res.status(status || 500);
                throw new Error(apiMessage || 'Failed to communicate with AI Service');
            }

            // Non-Axios Errors (DB errors, etc)
            console.error('Controller Error:', error);
            res.status(500);
            throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    }
);