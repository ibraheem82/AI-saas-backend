import { Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { AuthenticatedRequest } from '../types/index.js';

const checkApiRequestLimit = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        let requestLimit = 0;

        if (user.trialActive) {
            requestLimit = user.monthlyRequestCount;
        } else {
            switch (user.subscriptionPlan) {
                case 'Free':
                    requestLimit = 5;
                    break;
                case 'Basic':
                    requestLimit = 50;
                    break;
                case 'Premium':
                    requestLimit = 100;
                    break;
                default:
                    requestLimit = user.monthlyRequestCount || 0;
            }
        }

        if (user.apiRequestCount >= requestLimit) {
            throw new Error(
                `API Request limit reached (${user.apiRequestCount}/${requestLimit}). Please upgrade your plan or wait for the next billing cycle.`
            );
        }
        next();
    }
);

export default checkApiRequestLimit;
