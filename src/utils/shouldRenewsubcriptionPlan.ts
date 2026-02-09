import { IUser } from '../types/index.js';

/**
 * Check if the user's subscription plan should be renewed
 * Returns true if the next billing date has passed or doesn't exist
 */
export const shouldRenewSubcriptionPlan = (user: IUser): boolean => {
    const today = new Date();

    if (!user.nextBillingDate) {
        return true;
    }

    return new Date(user.nextBillingDate) < today;
};
