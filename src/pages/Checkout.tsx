import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, Lock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function Checkout() {
  const {
    items,
    removeFromCart,
    total,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      navigate('/dashboard');
    }, 2000);
  };
  if (items.length === 0) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-[#2d2d2d] mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any courses yet.
          </p>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-[#2d2d2d] mb-12">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
              Order Summary
            </h2>
            <div className="bg-white border border-[#2d2d2d]/10 shadow-sm divide-y divide-[#2d2d2d]/10">
              {items.map(item => <div key={item.id} className="p-4 flex items-center">
                  <img src={item.thumbnail} alt={item.title} className="w-20 h-20 object-cover rounded mr-4" />
                  <div className="flex-grow">
                    <h3 className="font-medium text-[#2d2d2d]">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.instructor}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-[#2d2d2d]">${item.price}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm mt-1 flex items-center">
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </button>
                  </div>
                </div>)}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center text-xl font-bold text-[#2d2d2d]">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
              Payment Details
            </h2>
            <form onSubmit={handlePayment} className="bg-white p-8 border border-[#2d2d2d]/10 shadow-lg space-y-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Lock className="w-4 h-4" />
                <span>Payments are secure and encrypted</span>
              </div>

              <Input label="Cardholder Name" placeholder="John Doe" required />
              <Input label="Card Number" placeholder="0000 0000 0000 0000" required />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiry Date" placeholder="MM/YY" required />
                <Input label="CVC" placeholder="123" required />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" isLoading={isProcessing}>
                  Pay ${total}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>;
}