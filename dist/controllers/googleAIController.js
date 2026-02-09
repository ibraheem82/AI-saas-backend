import asyncHandler from 'express-async-handler';
import axios from 'axios';
import ContentHistory from '../models/ContentHistory.js';
import User from '../models/User.js';
// Google AI Controller
export const googleAIController = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    console.log(prompt);
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            contents: [
                {
                    parts: [
                        {
                            text: `${prompt}`,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2000,
                stopSequences: [],
            },
            safetySettings: [],
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const content = response.data?.candidates[0]?.content?.parts[0]?.text?.trim();
        const newContent = await ContentHistory.create({
            user: req.user?._id,
            content,
        });
        const userFound = await User.findById(req.user?._id);
        if (userFound) {
            userFound.contentHistory.push(newContent._id);
            userFound.apiRequestCount += 1;
            await userFound.save();
        }
        res.status(200).json(content);
    }
    catch (error) {
        console.error('Error generating content:', error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Invalid Gemini API key. Please check your configuration.');
            }
            else if (error.response?.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to Gemini API. Please check your internet connection.');
            }
            else {
                throw new Error(error.response?.data?.error?.message || error.message || 'Failed to generate content');
            }
        }
        throw error;
    }
});
//# sourceMappingURL=googleAIController.js.map