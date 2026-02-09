import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { calculateNextBillingDate } from '../utils/calculateNextBillingDate.js';

export const handlePaystackWebhook = async (req: Request, res: Response): Promise<void> => {
    // 1. Verify the signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
        console.error('PAYSTACK_SECRET_KEY is not defined');
        res.status(500).send('Server Error');
        return;
    }

    const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        res.status(400).send('Invalid Signature');
        return;
    }

    // 2. Retrieve the event
    const event = req.body;

    // 3. Handle specific events
    try {
        if (event.event === 'charge.success') {
            const { metadata, amount, reference, status } = event.data;
            const { userId, plan } = metadata;

            // Find the user
            const user = await User.findById(userId);

            if (user) {
                // Update User Subscription
                user.subscriptionPlan = plan;
                user.trialActive = false;
                user.trialExpires = new Date(0); // Expire trial
                user.nextBillingDate = calculateNextBillingDate();

                // Reset or boost credits based on plan
                switch (plan) {
                    case 'Basic':
                        user.monthlyRequestCount = 50;
                        break;
                    case 'Premium':
                        user.monthlyRequestCount = 100;
                        break;
                    default:
                        break;
                }

                // Create Payment Record
                const newPayment = await Payment.create({
                    user: userId,
                    reference,
                    currency: 'NGN',
                    status,
                    subscriptionPlan: plan,
                    amount: amount / 100, // Paystack amount is in kobo
                });

                user.payments.push(newPayment._id);
                await user.save();

                console.log(`Webhook: Subscription updated for user ${userId} to ${plan}`);
            }
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        // Don't fail the request to Paystack, just log the error
    }

    // 4. Acknowledge receipt
    res.status(200).send('Webhook Received');
};
