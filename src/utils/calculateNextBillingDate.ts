/**
 * Calculate the next billing date (30 days from now)
 */
export const calculateNextBillingDate = (): Date => {
    const today = new Date();
    const nextBillingDate = new Date(today);
    nextBillingDate.setDate(today.getDate() + 30);
    return nextBillingDate;
};
