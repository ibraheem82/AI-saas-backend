import axios from "axios";
import config from "../../config";

//=======Stripe Payment=====

export const handleFreeSubscriptionAPI = async () => {
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/stripe/free-plan`,
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Stripe  Payment intent=====

export const createStripePaymentIntentAPI = async (payment) => {
  console.log(payment);
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/stripe/checkout`,
    {
      amount: Number(payment?.amount),
      subscriptionPlan: payment?.plan,
      paymentMethodId: payment?.paymentMethodId,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Verify  Payment =====

export const verifyPaymentAPI = async (paymentId) => {
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/stripe/verify-payment/${paymentId}`,
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};