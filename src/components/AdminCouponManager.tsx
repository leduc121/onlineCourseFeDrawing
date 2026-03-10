import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag, Calendar, Users, Percent, DollarSign, X } from 'lucide-react';
import { Button } from './ui/Button';
import { couponsApi, coursesApi } from '../api';

interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'FixedAmount';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  isGlobal: boolean;
  applicableCourseId?: string;
}

export function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: 0,
    maxUses: '',
    expiresAt: '',
    applicableCourseId: ''
  });

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [couponRes, courseRes] = await Promise.all([
        couponsApi.getAll(),
        coursesApi.getAll(1, 100)
      ]);
      setCoupons(couponRes.data?.data || []);
      setCourses(courseRes.data?.data?.items || []);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await couponsApi.create({
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue),
        maxUses: newCoupon.maxUses ? Number(newCoupon.maxUses) : null,
        expiresAt: newCoupon.expiresAt || null,
        applicableCourseId: newCoupon.applicableCourseId || null,
        discountType: newCoupon.discountType === 'Percentage' ? 0 : 1
      });
      setShowAddModal(false);
      setNewCoupon({
        code: '',
        discountType: 'Percentage',
        discountValue: 0,
        maxUses: '',
        expiresAt: '',
        applicableCourseId: ''
      });
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create coupon.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponsApi.delete(id);
      fetchAll();
    } catch (err) {
      alert("Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] flex items-center gap-2">
          <Tag className="text-[#ff8a80]" />
          Coupon Management
        </h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={18} className="mr-2" />
          Create Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400 italic">Loading coupons...</div>
      ) : (
        <div className="bg-white border border-[#2d2d2d]/10 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Applicable To</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 italic">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No coupons active</td>
                </tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-black text-[#2d2d2d] bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-bold text-[#2d2d2d]">
                      {coupon.discountType === 'Percentage' ? <Percent size={14} className="text-[#ff8a80]" /> : <DollarSign size={14} className="text-[#ff8a80]" />}
                      {coupon.discountValue}{coupon.discountType === 'Percentage' ? '%' : ' VND'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                       <Users size={14} className="text-gray-400" />
                       {coupon.usedCount} / {coupon.maxUses || '∞'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${coupon.isGlobal ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {coupon.isGlobal ? 'Global' : 'Specific Course'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-300" />
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(coupon.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                       <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-serif font-bold text-[#2d2d2d]">Create New Coupon</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Coupon Code</label>
                <input 
                  type="text" 
                  value={newCoupon.code}
                  onChange={e => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#ff8a80] outline-none font-bold uppercase transition-all"
                  placeholder="E.G. SUMMER25"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Discount Type</label>
                  <select 
                    value={newCoupon.discountType}
                    onChange={e => setNewCoupon(prev => ({ ...prev, discountType: e.target.value as any }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#ff8a80] outline-none transition-all"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="FixedAmount">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Value</label>
                  <input 
                    type="number" 
                    value={newCoupon.discountValue}
                    onChange={e => setNewCoupon(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#ff8a80] outline-none transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Applicable To</label>
                <select 
                  value={newCoupon.applicableCourseId}
                  onChange={e => setNewCoupon(prev => ({ ...prev, applicableCourseId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#ff8a80] outline-none transition-all"
                >
                  <option value="">All Courses (Global)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Max Uses</label>
                  <input 
                    type="number" 
                    value={newCoupon.maxUses}
                    onChange={e => setNewCoupon(prev => ({ ...prev, maxUses: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#ff8a80] outline-none transition-all"
                    placeholder="Unlimited if empty"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                  <input 
                    type="date" 
                    value={newCoupon.expiresAt}
                    onChange={e => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#ff8a80] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" isLoading={isCreating}>Create Coupon</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
