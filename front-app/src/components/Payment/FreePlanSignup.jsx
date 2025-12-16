import React from "react";
import { useMutation } from "@tanstack/react-query";
import { handleFreeSubscriptionAPI } from "../../apis/paystackPayment/paystackPayment";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

const FreePlanSignup = () => {
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: handleFreeSubscriptionAPI,
        onSuccess: (data) => {
            console.log(data);
            //Wait for a few seconds before redirecting
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        },
        onError: (error) => {
            console.log(error);
            alert(error?.response?.data?.error);
        }
    });

    const handleConfirm = () => {
        mutation.mutate();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Free Plan</h2>
                <p className="text-gray-600 mb-8">
                    You are about to subscribe to the Free Plan. You will get 5 free API requests per month.
                </p>

                {mutation.isSuccess ? (
                    <div className="flex flex-col items-center text-green-600">
                        <FaCheckCircle className="text-5xl mb-4" />
                        <p className="text-lg font-medium">Subscription Activated!</p>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <button
                        onClick={handleConfirm}
                        disabled={mutation.isPending}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center"
                    >
                        {mutation.isPending ? <FaSpinner className="animate-spin mr-2" /> : "Confirm Subscription"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FreePlanSignup;
