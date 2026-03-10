import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Lock, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';
import { cartApi, studentProfilesApi, default as api } from '../api';

export function Checkout() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    studentProfilesApi.getMyStudents()
      .then(res => {
        if (res.data?.data) {
          setChildren(res.data.data);
          
          // Pre-select based on cart items first, then fallback to first student
          const firstItemWithProfile = items.find(i => i.studentProfileId);
          if (firstItemWithProfile?.studentProfileId) {
            setSelectedChildId(firstItemWithProfile.studentProfileId);
          } else if (res.data.data.length > 0) {
            setSelectedChildId(res.data.data[0].id);
          }
        }
      })
      .catch(err => console.error("Failed to load students", err));
  }, [items]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      // Find a course to validate against (or just validate globally)
      const firstCourseId = items[0]?.id;
      if (!firstCourseId) return;

      const res = await api.post('/coupons/validate', { code: couponCode, courseId: firstCourseId });
      const discount = res.data?.data;

      if (discount) {
        // Apply to all items in cart (backend logic will handle eligibility)
        for (const item of items) {
          if (item.cartItemId) {
            await cartApi.updateItem(item.cartItemId, { couponCode: couponCode });
          }
        }
        // Force refresh cart to see new prices
        window.location.reload(); // Simplest way to refresh all contexts
        setCouponMessage({ text: 'Coupon applied successfully!', type: 'success' });
      }
    } catch (err: any) {
      setCouponMessage({ 
        text: err.response?.data?.message || 'Invalid or expired coupon code.', 
        type: 'error' 
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleStripeCheckout = async () => {
    if (!selectedChildId) {
      alert("Please select a child profile first.");
      return;
    }
    
    setIsProcessing(true);
    try {
      // Sync all cart items to the selected student profile
      for (const item of items) {
         if (item.studentProfileId !== selectedChildId && item.cartItemId) {
            await cartApi.updateItem(item.cartItemId, {
                studentProfileId: selectedChildId
            });
         }
      }

      const res = await cartApi.checkout({
          successUrl: window.location.origin + '/dashboard',
          cancelUrl: window.location.origin + '/checkout'
      });

      if (res.data?.data?.sessionUrl) {
          clearCart(); 
          window.location.href = res.data.data.sessionUrl; 
      } else {
          alert("Failed to initialize payment session.");
      }
    } catch (error: any) {
       console.error("Checkout Error:", error);
       alert(error.response?.data?.message || "Checkout failed.");
    } finally {
       setIsProcessing(false);
    }
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
                    <p className="font-bold text-[#2d2d2d]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                    <button onClick={() => removeFromCart(item.cartItemId || item.id)} className="text-red-500 hover:text-red-700 text-sm mt-1 flex items-center">
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </button>
                  </div>
                </div>)}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center text-xl font-bold text-[#2d2d2d]">
                  <span>Total</span>
                  <div className="text-right">
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mt-6 bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
              <h3 className="font-bold text-[#2d2d2d] mb-4">Promotional Code</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code..." 
                  className="flex-1 px-4 py-2 border-2 border-gray-100 rounded-lg focus:border-[#ff8a80] outline-none uppercase text-sm font-bold"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button onClick={handleApplyCoupon} isLoading={isApplyingCoupon} disabled={!couponCode}>Apply</Button>
              </div>
              {couponMessage && (
                <p className={`mt-2 text-sm font-bold ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>
          </div>

          {/* Checkout Details & Actions */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
              Payment & Assignment
            </h2>
            <div className="bg-white p-8 border border-[#2d2d2d]/10 shadow-lg space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Assign these courses to:</label>
                {children.length > 0 ? (
                  <select 
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#ff8a80] focus:ring focus:ring-[#ff8a80]/20 transition-colors"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                  >
                    {children.map(kid => (
                      <option key={kid.id} value={kid.id}>{kid.studentFullName || "Student"}</option>
                    ))}
                  </select>
                ) : (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                     <AlertCircle size={16} /> You need to add a Child Profile in your Dashboard first.
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4 pt-4 border-t border-gray-100">
                <Lock className="w-4 h-4" />
                <span>Secure payment powered by Stripe</span>
              </div>

              <div className="pt-4">
                <Button 
                   onClick={handleStripeCheckout} 
                   className="w-full" 
                   size="lg" 
                   isLoading={isProcessing}
                   disabled={children.length === 0}
                >
                  Pay {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)} with Stripe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}