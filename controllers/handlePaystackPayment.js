import asyncHandler from "express-async-handler";
import https from "https";
import { calculateNextBillingDate } from "../utils/calculateNextBillingDate.js";
import { shouldRenewSubcriptionPlan } from "../utils/shouldRenewsubcriptionPlan.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

/*
  * -> Paystack payment integration
  * -> Initialize payment, verify payment, and handle subscriptions
  */

//-----Paystack Initialize Payment-----
export const handlePaystackPayment = asyncHandler(async (req, res) => {
    const { amount, subscriptionPlan, email } = req.body;
    //get the user
    const user = req?.user;

    try {
        const params = JSON.stringify({
            email: email || user?.email,
            amount: Number(amount) * 100, // Paystack expects amount in kobo (NGN) or cents (USD)
            metadata: {
                userId: user?._id?.toString(),
                userEmail: user?.email,
                subscriptionPlan,
                custom_fields: [
                    {
                        display_name: "Subscription Plan",
                        variable_name: "subscription_plan",
                        value: subscriptionPlan
                    }
                ]
            }
        });

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const paystackReq = https.request(options, (paystackRes) => {
            let data = '';

            paystackRes.on('data', (chunk) => {
                data += chunk;
            });

            paystackRes.on('end', () => {
                const response = JSON.parse(data);
                console.log("Paystack initialize response:", response);

                if (response.status) {
                    res.json({
                        status: true,
                        authorizationUrl: response.data.authorization_url,
                        accessCode: response.data.access_code,
                        reference: response.data.reference,
                    });
                } else {
                    res.status(400).json({
                        status: false,
                        message: response.message || "Failed to initialize payment"
                    });
                }
            });
        });

        paystackReq.on('error', (error) => {
            console.error("Paystack request error:", error);
            res.status(500).json({ error: error.message });
        });

        paystackReq.write(params);
        paystackReq.end();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// -----Verify Payment-----
export const verifyPayment = asyncHandler(async (req, res) => {
    const { reference } = req.params;

    try {
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${reference}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        };

        const paystackReq = https.request(options, (paystackRes) => {
            let data = '';

            paystackRes.on('data', (chunk) => {
                data += chunk;
            });

            paystackRes.on('end', async () => {
                const response = JSON.parse(data);
                console.log("Paystack verify response:", response);

                if (!response.status || response.data.status !== 'success') {
                    console.log(`Payment ${reference} status is ${response.data?.status}.`);
                    return res.status(400).json({
                        status: false,
                        message: "Payment verification failed or not successful"
                    });
                }

                const metadata = response.data?.metadata;
                const { subscriptionPlan, userId } = metadata;

                const userFound = await User.findById(userId);

                if (!userFound) {
                    console.log(`User ${userId} not found.`);
                    return res.status(404).json({ status: false, message: "User not found" });
                }

                const amount = response.data?.amount / 100; // Convert from kobo/cents to main currency
                const currency = response.data?.currency;

                const newPayment = await Payment.create({
                    user: userId,
                    email: userFound.email,
                    subscriptionPlan,
                    amount,
                    currency,
                    status: "success",
                    reference: response.data?.reference,
                });

                if (!newPayment) {
                    console.error(`Failed to create payment record for user ${userId}.`);
                    return res.status(500).json({
                        status: false,
                        message: "Failed to create payment record"
                    });
                }

                let monthlyRequestCount = 0;
                switch (subscriptionPlan) {
                    case "Basic":
                        monthlyRequestCount = 50;
                        break;
                    case "Premium":
                        monthlyRequestCount = 100;
                        break;
                    case "Trial":
                        monthlyRequestCount = 10;
                        break;
                    default:
                        monthlyRequestCount = 0;
                }

                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    {
                        subscriptionPlan,
                        trialPeriod: 0,
                        trialActive: false,
                        nextBillingDate: calculateNextBillingDate(),
                        apiRequestCount: 0,
                        monthlyRequestCount,
                        $addToSet: { payments: newPayment._id },
                    },
                    { new: true }
                );

                if (!updatedUser) {
                    console.error(`Failed to update user ${userId}.`);
                    return res.status(500).json({
                        status: false,
                        message: "Failed to update user"
                    });
                }

                console.log(`Payment ${reference} verified and user ${userId} updated.`);
                return res.json({
                    status: true,
                    message: "Payment verified, user updated",
                    payment: response.data
                });
            });
        });

        paystackReq.on('error', (error) => {
            console.error("Error in verifyPayment:", error);
            res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
        });

        paystackReq.end();

    } catch (error) {
        console.error("Error in verifyPayment:", error);
        res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
    }
});

//-----Handle free subscription-----
export const handleFreeSubscription = asyncHandler(async (req, res) => {
    // Get the login user
    const user = req?.user;
    console.log("free plan", user);

    try {
        if (shouldRenewSubcriptionPlan(user)) {
            //Update the user account
            user.subscriptionPlan = "Free";
            user.monthlyRequestCount = 5;
            user.apiRequestCount = 0;
            user.nextBillingDate = calculateNextBillingDate();

            //Create new payment and save into DB
            const newPayment = await Payment.create({
                user: user?._id,
                subscriptionPlan: "Free",
                amount: 0,
                status: "success",
                reference: Math.random().toString(36).substring(7),
                monthlyRequestCount: 0,
                currency: "usd",
            });
            user.payments.push(newPayment?._id);
            //save the user
            await user.save();
            //send the response
            res.json({
                status: "success",
                message: "Subscription plan updated successfully",
                user,
            });
        } else {
            return res.status(403).json({ error: "Subscription renewal not due yet" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});
