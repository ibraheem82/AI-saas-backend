import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyPaymentAPI } from "../../apis/paystackPayment/paystackPayment";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    // Paystack redirects with ?reference=... parameter
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    const mutation = useMutation({
        mutationFn: verifyPaymentAPI,
    });

    useEffect(() => {
        if (reference) {
            mutation.mutate(reference);
        }
    }, [reference]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
                {mutation.isPending && (
                    <div className="flex flex-col items-center">
                        <FaSpinner className="animate-spin text-4xl text-indigo-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
                        <p className="text-gray-600">Please wait while we confirm your transaction.</p>
                    </div>
                )}

                {mutation.isError && (
                    <div className="flex flex-col items-center">
                        <FaTimesCircle className="text-5xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h2>
                        <p className="text-red-600 mt-2">{mutation.error?.response?.data?.message || "Something went wrong."}</p>
                        <Link to="/plans" className="mt-6 text-indigo-600 hover:text-indigo-500 font-medium">
                            Try Again
                        </Link>
                    </div>
                )}

                {mutation.isSuccess && (
                    <div className="flex flex-col items-center">
                        <FaCheckCircle className="text-5xl text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                        <p className="text-gray-600 mt-2">
                            Reference: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{reference}</span>
                        </p>
                        <p className="text-gray-600 mt-2">Your subscription has been activated.</p>
                        <Link
                            to="/dashboard"
                            className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
