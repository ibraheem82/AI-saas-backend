/**
 * Calculate the next billing date (30 days from now)
 */
export const calculateNextBillingDate = () => {
    const today = new Date();
    const nextBillingDate = new Date(today);
    nextBillingDate.setDate(today.getDate() + 30);
    return nextBillingDate;
};
//# sourceMappingURL=calculateNextBillingDate.js.map