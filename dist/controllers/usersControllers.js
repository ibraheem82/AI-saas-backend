import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
// Registration
export const register = asyncHandler(async (req, res) => {
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
    newUser.trialExpires = new Date(new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000);
    await newUser.save();
    res.json({
        status: true,
        message: 'Registration was successful',
        user: {
            username,
            email,
        },
    });
});
// Login
export const login = asyncHandler(async (req, res) => {
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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
    });
});
// Logout
export const logout = asyncHandler(async (_req, res) => {
    res.cookie('token', '', { maxAge: 1 });
    res.status(200).json({ message: 'Logged out successfully' });
});
// User Profile
export const userProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
        .select('-password')
        .populate('payments')
        .populate('contentHistory');
    if (user) {
        res.status(200).json({
            status: 'success',
            user,
        });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
// Check Auth Status
export const checkAuth = asyncHandler(async (req, res) => {
    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        if (decoded) {
            res.json({
                isAuthenticated: true,
            });
        }
        else {
            res.json({
                isAuthenticated: false,
            });
        }
    }
    catch {
        res.json({
            isAuthenticated: false,
        });
    }
});
//# sourceMappingURL=usersControllers.js.map