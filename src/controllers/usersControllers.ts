import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { AuthenticatedRequest, LoginResponse, RegisterResponse } from '../types/index.js';

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface LoginBody {
    email: string;
    password: string;
}

// Registration
export const register = asyncHandler(
    async (req: Request<object, object, RegisterBody>, res: Response<RegisterResponse>): Promise<void> => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400);
            throw new Error('Please all fields are required');
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
        });

        newUser.trialExpires = new Date(
            new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000
        );

        await newUser.save();
        res.json({
            status: true,
            message: 'Registration was successful',
            user: {
                username,
                email,
            },
        });
    }
);

// Login
export const login = asyncHandler(
    async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
            expiresIn: '3d',
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            status: 'success',
            _id: user._id.toString(),
            message: 'Login success',
            username: user.username,
            email: user.email,
        } as LoginResponse);
    }
);

// Logout
export const logout = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
        res.cookie('token', '', { maxAge: 1 });
        res.status(200).json({ message: 'Logged out successfully' });
    }
);

// User Profile
export const userProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const user = await User.findById(req.user?._id)
            .select('-password')
            .populate('payments')
            .populate('contentHistory');

        if (user) {
            res.status(200).json({
                status: 'success',
                user,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }
);

// Check Auth Status
export const checkAuth = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string);
            if (decoded) {
                res.json({
                    isAuthenticated: true,
                });
            } else {
                res.json({
                    isAuthenticated: false,
                });
            }
        } catch {
            res.json({
                isAuthenticated: false,
            });
        }
    }
);

// Update User Profile
export const updateUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const user = await User.findById(req.user?._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            // If a password is provided, hash it before saving
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                status: 'success',
                message: 'Profile updated successfully',
                user: {
                    _id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                },
            });
            throw new Error('User not found');
        }
    }
);

// Delete History Item
export const deleteHistory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Remove from User's history array
        user.contentHistory = user.contentHistory.filter(
            (historyId) => historyId.toString() !== id
        );
        await user.save();

        // Remove the actual document
        // Dynamic import to avoid circular dependency
        const ContentHistory = (await import('../models/ContentHistory.js')).default;
        await ContentHistory.findByIdAndDelete(id);

        res.json({
            status: 'success',
            message: 'History item deleted successfully',
        });
    }
);
