/**
 * Check if the user's subscription plan should be renewed
 * Returns true if the next billing date has passed or doesn't exist
 */
export const shouldRenewSubcriptionPlan = (user) => {
    const today = new Date();
    if (!user.nextBillingDate) {
        return true;
    }
    return new Date(user.nextBillingDate) < today;
};
//# sourceMappingURL=shouldRenewsubcriptionPlan.js.map