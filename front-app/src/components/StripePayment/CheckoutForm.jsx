import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { createStripePaymentIntentAPI } from "../../apis/stripePayment/stripePayment";
import StatusMessage from "../Alert/StatusMessage";

const CheckoutForm = () => {
  //Get the payloads
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = params.plan;
  const amount = searchParams.get("amount");
  
  const mutation = useMutation({
    mutationFn: createStripePaymentIntentAPI,
  });

  //Stripe configuration
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  // Handle successful mutation (when backend confirms payment)
  useEffect(() => {
    if (mutation.isSuccess && mutation.data) {
      const { clientSecret, status } = mutation.data;
      console.log(clientSecret, status);
      
      if (status === 'succeeded' || status === 'confirmed') {
        // Backend has confirmed the payment, redirect to success with client secret
        navigate(`/success?client_secret=${clientSecret}&payment_intent_status=${status}`);
      } else {
        // Payment intent created but not confirmed yet
        setClientSecret(clientSecret);
        console.log("Payment intent created, ready for confirmation");
      }
    }
  }, [mutation.isSuccess, mutation.data, navigate]);

  //Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      return;
    }

    try {
      // Prepare data for payment intent creation
      const data = {
        amount,
        plan,
        paymentMethodId: "pm_card_visa",
        usePaymentElement: true,
      };

      // Create payment intent (backend will handle confirmation)
      mutation.mutate(data);

    } catch (error) {
      setErrorMessage(error?.message);
    }
  };

  // Optional: Manual confirmation function if needed
  const confirmPayment = async () => {
    if (!clientSecret || !stripe || !elements) return;
    
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });
    
    if (error) {
      setErrorMessage(error?.message);
    }
  };

  return (
    <div className="bg-gray-900 h-screen -mt-4 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 mx-auto my-4 p-6 bg-white rounded-lg shadow-md"
      >
        <div className="mb-4">
          <PaymentElement />
        </div>
        
        {/* Display loading */}
        {mutation?.isPending && (
          <StatusMessage type="loading" message="Processing please wait..." />
        )}

        {/* Display error */}
        {mutation?.isError && (
          <StatusMessage
            type="error"
            message={mutation?.error?.response?.data?.error}
          />
        )}

        <button 
          type="submit"
          disabled={!stripe || !elements || mutation.isPending}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Processing..." : "Pay"}
        </button>

        {/* Optional: Show manual confirm button if client secret exists but payment not confirmed */}
        {clientSecret && !mutation.isPending && (
          <button 
            type="button"
            onClick={confirmPayment}
            className="w-full mt-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Confirm Payment
          </button>
        )}

        {errorMessage && (
          <div className="text-red-500 mt-4">{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;