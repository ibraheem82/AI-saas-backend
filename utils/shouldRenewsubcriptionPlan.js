export const shouldRenewSubcriptionPlan = (user) => {
    // *  the current date and time.
    // 2025-03-14T06:28:14.770Z
    const today = new Date();
    // user?.nextBillingDate <= today - This checks if the user's next billing date is today or has already passed.
    // if it is less than or equal to the current date (user?.nextBillingDate <= today).
    return !user?.nextBillingDate || user?.nextBillingDate <= today;
};
