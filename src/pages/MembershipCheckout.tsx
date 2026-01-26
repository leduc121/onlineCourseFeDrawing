import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function MembershipCheckout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const planId = searchParams.get('plan');

    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'details' | 'success'>('details');

    // Plan Details Map
    const plans: Record<string, { name: string; price: string }> = {
        'little-artist': { name: 'Little Artist', price: '$9.99/mo' },
        'creative-studio': { name: 'Creative Studio', price: '$19.99/mo' },
        'masterpiece-pro': { name: 'Masterpiece Pro', price: '$49.99/mo' }
    };

    const selectedPlan = planId ? plans[planId] : null;

    useEffect(() => {
        if (!selectedPlan) {
            navigate('/membership');
        }
    }, [selectedPlan, navigate]);

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
        }, 2000);
    };

    if (!selectedPlan) return null;

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-[#2d2d2d]/10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-4">Welcome to the Club!</h2>
                    <p className="text-gray-600 mb-8">
                        You have successfully subscribed to the <strong>{selectedPlan.name}</strong> plan.
                    </p>
                    <Button
                        className="w-full bg-[#2d2d2d] text-white hover:bg-black"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf8f5] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/membership')}
                    className="mb-8 pl-0 text-gray-600 hover:text-[#2d2d2d]"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Plans
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Order Summary */}
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">Order Summary</h2>
                        <div className="bg-white p-6 rounded-xl border border-[#2d2d2d]/10 shadow-sm">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="font-bold text-lg text-[#2d2d2d]">{selectedPlan.name}</h3>
                                    <p className="text-sm text-gray-500">Monthly subscription</p>
                                </div>
                                <span className="text-xl font-serif font-bold text-[#2d2d2d]">{selectedPlan.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                                <span>Subtotal</span>
                                <span>{selectedPlan.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="font-bold text-[#2d2d2d]">Total due today</span>
                                <span className="text-2xl font-serif font-bold text-[#2d2d2d]">{selectedPlan.price}</span>
                            </div>
                        </div>

                        <div className="mt-8 bg-purple-50 p-4 rounded-lg flex gap-3 text-purple-800 text-sm">
                            <Lock size={20} className="shrink-0" />
                            <p>Secure checkout powered by Stripe. Your payment information is encrypted.</p>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">Payment Details</h2>
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent outline-none transition-all"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent outline-none transition-all"
                                        placeholder="MM/YY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2d2d2d] focus:border-transparent outline-none transition-all"
                                        placeholder="123"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-4 bg-[#2d2d2d] text-white hover:bg-black font-medium text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing Payment...' : `Pay ${selectedPlan.price}`}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
