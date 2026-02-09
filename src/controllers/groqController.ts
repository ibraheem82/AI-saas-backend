import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import ContentHistory from '../models/ContentHistory.js';
import User from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';

// --- Interfaces for Groq/OpenAI Format ---
interface GenerateContentBody {
    prompt: string;
}

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqChoice {
    index: number;
    message: GroqMessage;
    finish_reason: string;
}

interface GroqResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: GroqChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// --- Controller ---
export const groqController = asyncHandler(
    async (req: AuthenticatedRequest & { body: GenerateContentBody }, res: Response): Promise<void> => {
        const { prompt } = req.body;

        // 1. Validation
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            res.status(400);
            throw new Error('Prompt is required and must be a string');
        }

        // 1.5 Rate Limiting Check
        const user = await User.findById(req.user?._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.apiRequestCount >= user.monthlyRequestCount) {
            res.status(403);
            throw new Error('Monthly request limit reached. Please upgrade your plan.');
        }

        // 2. Configuration from .env
        const apiKey = process.env.GROQ_API_KEY;
        const modelId = process.env.GROQ_MODEL_ID || 'llama-3.3-70b-versatile';

        if (!apiKey) {
            res.status(500);
            throw new Error('Server Error: GROQ_API_KEY is not configured');
        }

        try {
            // 3. Request to Groq API (OpenAI Compatible)
            const response = await axios.post<GroqResponse>(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: modelId,
                    messages: [
                        {
                            role: 'user',
                            content: prompt.trim(),
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 4096,
                    top_p: 1,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30s timeout
                }
            );

            // 4. Extract Content
            const content = response.data?.choices?.[0]?.message?.content?.trim();

            if (!content) {
                console.warn('Groq returned no content. Full response:', JSON.stringify(response.data));
                res.status(422);
                throw new Error('Groq could not generate a response.');
            }

            // 5. Save to ContentHistory (Your existing logic)
            if (!req.user?._id) {
                res.status(401);
                throw new Error('User not authenticated');
            }

            const newContent = await ContentHistory.create({
                user: req.user._id,
                content,
            });

            // 6. Update User Stats (Your existing logic)
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $push: { contentHistory: newContent._id },
                    $inc: { apiRequestCount: 1 },
                },
                { new: true }
            );

            // 7. Send Response
            res.status(200).json(content);

        } catch (error: any) {
            // --- Error Handling ---
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const apiMessage = error.response?.data?.error?.message;

                console.error(`Groq API Error (${status}):`, apiMessage || error.message);

                if (status === 401) {
                    res.status(500); // Internal config error, not user error
                    throw new Error('Invalid Groq API Key configured on server');
                }
                if (status === 429) {
                    res.status(429);
                    throw new Error('Groq rate limit exceeded. Please try again later.');
                }
                if (status === 503) {
                    res.status(503);
                    throw new Error('Groq service is temporarily overloaded.');
                }

                res.status(status || 500);
                throw new Error(apiMessage || 'Failed to communicate with AI Service');
            }

            console.error('Controller Error:', error);
            res.status(500);
            throw new Error(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    }
);