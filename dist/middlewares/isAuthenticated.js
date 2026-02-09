import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
const isAuthenticated = asyncHandler(async (req, res, next) => {
    if (req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
            next();
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: 'Token has expired, please login again' });
                return;
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ message: 'Invalid token, please login again' });
                return;
            }
            else {
                res.status(401).json({ message: 'Authentication failed' });
                return;
            }
        }
    }
    else {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
});
export default isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map