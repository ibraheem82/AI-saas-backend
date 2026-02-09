import asyncHandler from 'express-async-handler';
import https from 'https';
import { calculateNextBillingDate } from '../utils/calculateNextBillingDate.js';
import { shouldRenewSubcriptionPlan } from '../utils/shouldRenewsubcriptionPlan.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
// Paystack Initialize Payment
export const handlePaystackPayment = asyncHandler(async (req, res) => {
    const { amount, subscriptionPlan, email } = req.body;
    const user = req.user;
    const params = JSON.stringify({
        email: email || user?.email,
        amount: Number(amount) * 100,
        metadata: {
            userId: user?._id?.toString(),
            userEmail: user?.email,
            subscriptionPlan,
            custom_fields: [
                {
                    display_name: 'Subscription Plan',
                    variable_name: 'subscription_plan',
                    value: subscriptionPlan,
                },
            ],
        },
    });
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    };
    const paystackReq = https.request(options, (paystackRes) => {
        let data = '';
        paystackRes.on('data', (chunk) => {
            data += chunk.toString();
        });
        paystackRes.on('end', () => {
            const response = JSON.parse(data);
            console.log('Paystack initialize response:', response);
            if (response.status) {
                res.json({
                    status: true,
                    authorizationUrl: response.data.authorization_url,
                    accessCode: response.data.access_code,
                    reference: response.data.reference,
                });
            }
            else {
                res.status(400).json({
                    status: false,
                    message: response.message || 'Failed to initialize payment',
                });
            }
        });
    });
    paystackReq.on('error', (error) => {
        console.error('Paystack request error:', error);
        res.status(500).json({ error: error.message });
    });
    paystackReq.write(params);
    paystackReq.end();
});
// Verify Payment
export const verifyPayment = asyncHandler(async (req, res) => {
    const { reference } = req.params;
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    };
    const paystackReq = https.request(options, (paystackRes) => {
        let data = '';
        paystackRes.on('data', (chunk) => {
            data += chunk.toString();
        });
        paystackRes.on('end', async () => {
            try {
                const response = JSON.parse(data);
                console.log('Paystack verify response:', response);
                if (!response.status || response.data.status !== 'success') {
                    console.log(`Payment ${reference} status is ${response.data?.status}.`);
                    res.status(400).json({
                        status: false,
                        message: 'Payment verification failed or not successful',
                    });
                    return;
                }
                const metadata = response.data?.metadata;
                const { subscriptionPlan, userId } = metadata;
                const userFound = await User.findById(userId);
                if (!userFound) {
                    console.log(`User ${userId} not found.`);
                    res.status(404).json({ status: false, message: 'User not found' });
                    return;
                }
                const amount = response.data?.amount / 100;
                const currency = response.data?.currency;
                const newPayment = await Payment.create({
                    user: userId,
                    email: userFound.email,
                    subscriptionPlan,
                    amount,
                    currency,
                    status: 'success',
                    reference: response.data?.reference,
                });
                if (!newPayment) {
                    console.error(`Failed to create payment record for user ${userId}.`);
                    res.status(500).json({
                        status: false,
                        message: 'Failed to create payment record',
                    });
                    return;
                }
                let monthlyRequestCount = 0;
                switch (subscriptionPlan) {
                    case 'Basic':
                        monthlyRequestCount = 50;
                        break;
                    case 'Premium':
                        monthlyRequestCount = 100;
                        break;
                    case 'Trial':
                        monthlyRequestCount = 10;
                        break;
                    default:
                        monthlyRequestCount = 0;
                }
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    subscriptionPlan,
                    trialPeriod: 0,
                    trialActive: false,
                    nextBillingDate: calculateNextBillingDate(),
                    apiRequestCount: 0,
                    monthlyRequestCount,
                    $addToSet: { payments: newPayment._id },
                }, { new: true });
                if (!updatedUser) {
                    console.error(`Failed to update user ${userId}.`);
                    res.status(500).json({
                        status: false,
                        message: 'Failed to update user',
                    });
                    return;
                }
                console.log(`Payment ${reference} verified and user ${userId} updated.`);
                res.json({
                    status: true,
                    message: 'Payment verified, user updated',
                    payment: response.data,
                });
            }
            catch (error) {
                console.error('Error processing payment verification:', error);
                res.status(500).json({ status: false, message: 'Internal Server Error' });
            }
        });
    });
    paystackReq.on('error', (error) => {
        console.error('Error in verifyPayment:', error);
        res.status(500).json({ status: false, message: error.message || 'Internal Server Error' });
    });
    paystackReq.end();
});
// Handle free subscription
export const handleFreeSubscription = asyncHandler(async (req, res) => {
    const user = req.user;
    console.log('free plan', user);
    if (!user) {
        res.status(401).json({ error: 'Not authorized' });
        return;
    }
    if (shouldRenewSubcriptionPlan(user)) {
        user.subscriptionPlan = 'Free';
        user.monthlyRequestCount = 5;
        user.apiRequestCount = 0;
        user.nextBillingDate = calculateNextBillingDate();
        const newPayment = await Payment.create({
            user: user._id,
            subscriptionPlan: 'Free',
            amount: 0,
            status: 'success',
            reference: Math.random().toString(36).substring(7),
            monthlyRequestCount: 0,
            currency: 'usd',
        });
        user.payments.push(newPayment._id);
        await user.save();
        res.json({
            status: 'success',
            message: 'Subscription plan updated successfully',
            user,
        });
    }
    else {
        res.status(403).json({ error: 'Subscription renewal not due yet' });
    }
});
//# sourceMappingURL=handlePaystackPayment.js.map