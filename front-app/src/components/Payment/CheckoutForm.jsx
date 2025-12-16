import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { PaystackButton } from "react-paystack";
import { useMutation } from "@tanstack/react-query";
import { createPaystackPaymentAPI } from "../../apis/paystackPayment/paystackPayment";
import { useAuth } from "../../AuthContext/AuthContext";
import config from "../../config";

const CheckoutForm = () => {
    const { plan } = useParams();
    const { state } = useLocation();
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || "");
    const [amount, setAmount] = useState(0);

    // Calculate amount based on plan
    React.useEffect(() => {
        if (plan === "Basic") setAmount(20); // $20
        if (plan === "Premium") setAmount(50); // $50
    }, [plan]);

    // Paystack configuration
    // Convert amount to kobo (x100) and use your currency if needed. 
    // Paystack creates transactions in NGN by default unless configured otherwise.
    // For USD, ensure your Paystack account supports it.
    // Here assuming USD amount is passed to backend which initializes transaction properly.
    // But react-paystack handles client-side flow.

    // Actually, distinct flow:
    // Option A: Initialize on backend (secure), get authorization_url, redirect user.
    // Option B: react-paystack (client-side), verifies on backend.

    // Let's use Option A (Server-side initialization) as my backend `handlePaystackPayment` returns authorizationUrl.
    // This is more secure and flexible.

    // Wait, the backend `createPaystackPaymentAPI` calls `/api/v1/paystack/checkout`.
    // This returns: { status: true, authorizationUrl: "...", accessCode: "...", reference: "..." }

    const mutation = useMutation({
        mutationFn: createPaystackPaymentAPI,
        onSuccess: (data) => {
            if (data?.authorizationUrl) {
                window.location.href = data.authorizationUrl;
            }
        },
        onError: (error) => {
            console.error(error);
            alert("Payment initialization failed");
        }
    });

    const handlePayment = (e) => {
        e.preventDefault();
        mutation.mutate({ amount, plan, email });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Subscribe to {plan} Plan
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Complete your payment of ${amount}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handlePayment}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {mutation.isPending ? "Processing..." : `Pay $${amount}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;
