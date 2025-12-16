import axios from "axios";
import config from "../../config";

//=======Paystack Payment=====

export const handleFreeSubscriptionAPI = async () => {
    const response = await axios.post(
        `${config.apiBaseUrl}/api/v1/paystack/free-plan`,
        {},
        {
            withCredentials: true,
        }
    );
    return response?.data;
};

//=======Paystack Initialize Payment=====

export const createPaystackPaymentAPI = async (payment) => {
    console.log(payment);
    const response = await axios.post(
        `${config.apiBaseUrl}/api/v1/paystack/checkout`,
        {
            amount: Number(payment?.amount),
            subscriptionPlan: payment?.plan,
            email: payment?.email,
        },
        {
            withCredentials: true,
        }
    );
    return response?.data;
};

//=======Verify Payment =====

export const verifyPaymentAPI = async (reference) => {
    const response = await axios.post(
        `${config.apiBaseUrl}/api/v1/paystack/verify-payment/${reference}`,
        {},
        {
            withCredentials: true,
        }
    );
    return response?.data;
};
