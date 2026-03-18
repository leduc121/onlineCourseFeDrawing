import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, X, ChevronLeft, ChevronRight, Eye, BookOpen, Clock, DollarSign, Tag, PieChart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usersApi, coursesApi, categoriesApi, paymentsApi } from '../api';
import { AdminCouponManager } from '../components/AdminCouponManager';

// --- Modal Component ---
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold text-[#2d2d2d]">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Pagination Component ---
function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-600 font-medium">
        Page {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingApprovals: 0
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'coupons' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Modal states
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allUsersPage, setAllUsersPage] = useState(1);
  const [allUsersTotalPages, setAllUsersTotalPages] = useState(1);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);

  const [showAllPending, setShowAllPending] = useState(false);
  const [allPending, setAllPending] = useState<any[]>([]);
  const [allPendingPage, setAllPendingPage] = useState(1);
  const [allPendingTotalPages, setAllPendingTotalPages] = useState(1);
  const [isLoadingAllPending, setIsLoadingAllPending] = useState(false);

  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [courseDetail, setCourseDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const PAGE_SIZE = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const usersRes = await usersApi.getAll(1, 5);
      const coursesRes = await coursesApi.getAll(1, 1);
      const pendingRes = await coursesApi.getPendingReview(1, 5);

      const totalUsers = usersRes.data?.data?.totalCount || 0;
      const totalCourses = coursesRes.data?.data?.totalCount || 0;
      const pendingApprovals = pendingRes.data?.data?.totalCount || 0;

      setStats({ totalUsers, totalCourses, pendingApprovals });
      setRecentUsers(usersRes.data?.data?.items || []);
      setPendingCourses(pendingRes.data?.data?.items || []);

      await fetchCategories();
      await fetchTransactions();
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const res = await (paymentsApi as any).getAllTransactions();
      setTransactions(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleApproveTransaction = async (txnRef: string) => {
    if(!confirm("Are you sure you want to manually approve this transaction and enroll the student?")) return;
    try {
      await (paymentsApi as any).approveTransaction(txnRef);
      alert("Transaction approved successfully!");
      await fetchTransactions();
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("Failed to approve transaction.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll(1, 100);
      setCategories(res.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // --- View All Users ---
  const fetchAllUsers = async (page: number) => {
    try {
      setIsLoadingAllUsers(true);
      const res = await usersApi.getAll(page, PAGE_SIZE);
      setAllUsers(res.data?.data?.items || []);
      const total = res.data?.data?.totalCount || 0;
      setAllUsersTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      setAllUsersPage(page);
    } catch (error) {
      console.error("Error fetching all users:", error);
    } finally {
      setIsLoadingAllUsers(false);
    }
  };

  const openAllUsers = () => {
    setShowAllUsers(true);
    fetchAllUsers(1);
  };

  // --- View All Pending Courses ---
  const fetchAllPending = async (page: number) => {
    try {
      setIsLoadingAllPending(true);
      const res = await coursesApi.getPendingReview(page, PAGE_SIZE);
      setAllPending(res.data?.data?.items || []);
      const total = res.data?.data?.totalCount || 0;
      setAllPendingTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      setAllPendingPage(page);
    } catch (error) {
      console.error("Error fetching all pending:", error);
    } finally {
      setIsLoadingAllPending(false);
    }
  };

  const openAllPending = () => {
    setShowAllPending(true);
    fetchAllPending(1);
  };

  // --- View Course Detail ---
  const openCourseDetail = async (id: string) => {
    try {
      setIsLoadingDetail(true);
      setShowCourseDetail(true);
      const res = await coursesApi.getById(id);
      setCourseDetail(res.data?.data || null);
    } catch (error) {
      console.error("Error fetching course detail:", error);
      alert("Failed to load course details.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // --- Category CRUD ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsCategoryLoading(true);
      await categoriesApi.create({ name: newCategoryName.trim(), description: "", iconUrl: "" });
      setNewCategoryName("");
      setShowCreateForm(false);
      await fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      setIsCategoryLoading(true);
      await categoriesApi.delete(id);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    } finally {
      setIsCategoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await coursesApi.approve(id);
      fetchData();
      // Refresh modals if open
      if (showAllPending) fetchAllPending(allPendingPage);
      if (showCourseDetail && courseDetail?.id === id) setShowCourseDetail(false);
    } catch (error) {
      console.error("Error approving course:", error);
      alert("Failed to approve course");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await coursesApi.reject(id, reason);
      fetchData();
      if (showAllPending) fetchAllPending(allPendingPage);
      if (showCourseDetail && courseDetail?.id === id) setShowCourseDetail(false);
    } catch (error) {
      console.error("Error rejecting course:", error);
      alert("Failed to reject course");
    }
  };

  const getDifficultyLabel = (level: number | null | undefined) => {
    switch (level) {
      case 0: return 'Beginner';
      case 1: return 'Intermediate';
      case 2: return 'Advanced';
      default: return 'N/A';
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf8f5] py-12 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h1 className="text-4xl font-serif font-bold text-[#2d2d2d]">
            Admin {activeTab === 'overview' ? 'Overview' : 'Coupons'}
          </h1>
          <div className="flex bg-white/50 p-1 rounded-xl border border-gray-100 self-start">
             <button 
               onClick={() => setActiveTab('overview')}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#ff8a80] text-[#2d2d2d] shadow-lg shadow-[#ff8a80]/20' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <PieChart size={18} />
                Overview
             </button>
             <button 
               onClick={() => setActiveTab('coupons')}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'coupons' ? 'bg-[#ff8a80] text-[#2d2d2d] shadow-lg shadow-[#ff8a80]/20' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <Tag size={18} />
                Manage Coupons
             </button>
             <button 
               onClick={() => setActiveTab('transactions')}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-[#ff8a80] text-[#2d2d2d] shadow-lg shadow-[#ff8a80]/20' : 'text-gray-400 hover:text-gray-600'}`}
             >
                <DollarSign size={18} />
                Transactions
             </button>
          </div>
        </div>

        {activeTab === 'coupons' ? (
          <div className="bg-white p-8 border border-[#2d2d2d]/10 rounded-2xl shadow-sm">
             <AdminCouponManager />
          </div>
        ) : activeTab === 'transactions' ? (
          <div className="bg-white border border-[#2d2d2d]/10 rounded-2xl shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif">All Transactions</h3>
                <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoadingTransactions}>
                   {isLoadingTransactions ? "Refreshing..." : "Refresh"}
                </Button>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                      <tr>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ref / Date</th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                         <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                         <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.length > 0 ? transactions.map(txn => (
                         <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="text-sm font-bold text-[#2d2d2d]">{txn.txnRef}</div>
                               <div className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-sm font-medium text-[#2d2d2d]">{txn.userFullName || 'N/A'}</div>
                               <div className="text-xs text-gray-500">{txn.userEmail || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-sm text-gray-600 truncate max-w-[200px]">
                                  {txn.courseTitle || (txn.cartItems?.length > 0 ? `${txn.cartItems[0].courseTitle}${txn.cartItems.length > 1 ? ' + ' + (txn.cartItems.length - 1) + ' more' : ''}` : 'N/A')}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="text-sm font-bold text-[#2d2d2d]">${txn.amount}</div>
                               {txn.discountAmount > 0 && <div className="text-xs text-green-600">-${txn.discountAmount} disk</div>}
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase ${
                                  txn.status === 1 ? 'bg-green-100 text-green-700' :
                                  txn.status === 0 ? 'bg-orange-100 text-orange-700' :
                                  'bg-red-100 text-red-700'
                               }`}>
                                  {txn.status === 1 ? 'Success' : txn.status === 0 ? 'Pending' : 'Failed'}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               {txn.status === 0 && (
                                  <Button size="sm" onClick={() => handleApproveTransaction(txn.txnRef)} className="text-[10px] py-1 h-auto">
                                     Approve
                                  </Button>
                               )}
                            </td>
                         </tr>
                      )) : (
                         <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No transactions found</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
                <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">Total Users</h3>
                <p className="text-4xl font-serif font-bold text-[#2d2d2d]">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
                <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">Total Courses</h3>
                <p className="text-4xl font-serif font-bold text-[#2d2d2d]">{stats.totalCourses}</p>
              </div>
              <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
                <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">Pending Approvals</h3>
                <p className="text-4xl font-serif font-bold text-[#ff8a80]">{stats.pendingApprovals}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Recent Users */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">Recent Users</h2>
                  <Button variant="outline" size="sm" onClick={openAllUsers}>View All</Button>
                </div>
                <div className="bg-white border border-[#2d2d2d]/10">
                  {recentUsers.length > 0 ? recentUsers.map(user => (
                    <div key={user.id} className="p-4 border-b border-[#2d2d2d]/10 flex items-center justify-between last:border-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-[#2d2d2d]">{user.fullName || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{user.email || 'No Email'}</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="p-4 text-center text-gray-500">No recent users</div>}
                </div>
              </div>

              {/* Pending Courses */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">Course Approvals</h2>
                  <Button variant="outline" size="sm" onClick={openAllPending}>View All</Button>
                </div>
                <div className="bg-white border border-[#2d2d2d]/10">
                  {pendingCourses.length > 0 ? pendingCourses.map(course => (
                    <div key={course.id} className="p-4 border-b border-[#2d2d2d]/10 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-[#2d2d2d]">{course.title || 'Untitled Course'}</h3>
                        <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded">PENDING</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">By {course.instructorName || 'Unknown Instructor'} • Submitted recently</p>
                      <div className="flex space-x-2">
                        <Button onClick={() => openCourseDetail(course.id)} size="sm" variant="outline" className="py-1 px-3 text-xs">
                          <Eye className="w-3 h-3 mr-1" /> Details
                        </Button>
                        <Button onClick={() => handleApprove(course.id)} size="sm" variant="primary" className="py-1 px-3 text-xs">Approve</Button>
                        <Button onClick={() => handleReject(course.id)} size="sm" variant="outline" className="py-1 px-3 text-xs">Reject</Button>
                      </div>
                    </div>
                  )) : <div className="p-4 text-center text-gray-500">No pending courses</div>}
                </div>
              </div>
            </div>

            {/* Category Management */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">Manage Categories</h2>
                {!showCreateForm && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                  </Button>
                )}
              </div>

              {showCreateForm && (
                <div className="bg-white p-6 border border-[#2d2d2d]/10 mb-6 shadow-sm">
                  <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                      <input 
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Digital Painting"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#ff8a80] focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCategoryLoading || !newCategoryName.trim()}>
                        {isCategoryLoading ? "Creating..." : "Create Category"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewCategoryName("");
                        }}
                        disabled={isCategoryLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-[#2d2d2d]/10 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 ? categories.map(cat => (
                      <tr key={cat.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d2d]">{cat.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cat.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 hover:text-red-900" disabled={isCategoryLoading}>
                             <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No categories found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========== MODAL: View All Users ========== */}
      <Modal isOpen={showAllUsers} onClose={() => setShowAllUsers(false)} title="All Users">
        {isLoadingAllUsers ? (
          <div className="py-12 text-center text-gray-500">Loading users...</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allUsers.length > 0 ? allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-[#2d2d2d]">{user.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">{user.role || 'N/A'}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={allUsersPage} totalPages={allUsersTotalPages} onPageChange={fetchAllUsers} />
          </>
        )}
      </Modal>

      {/* ========== MODAL: View All Pending Courses ========== */}
      <Modal isOpen={showAllPending} onClose={() => setShowAllPending(false)} title="All Pending Courses">
        {isLoadingAllPending ? (
          <div className="py-12 text-center text-gray-500">Loading courses...</div>
        ) : (
          <>
            <div className="space-y-4">
              {allPending.length > 0 ? allPending.map(course => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-[#2d2d2d]">{course.title || 'Untitled Course'}</h3>
                      <p className="text-sm text-gray-500 mt-1">By {course.instructorName || 'Unknown'} • ${course.price ?? 0}</p>
                    </div>
                    <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded flex-shrink-0">PENDING</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button onClick={() => { setShowAllPending(false); openCourseDetail(course.id); }} size="sm" variant="outline" className="py-1 px-3 text-xs">
                      <Eye className="w-3 h-3 mr-1" /> Details
                    </Button>
                    <Button onClick={() => handleApprove(course.id)} size="sm" variant="primary" className="py-1 px-3 text-xs">Approve</Button>
                    <Button onClick={() => handleReject(course.id)} size="sm" variant="outline" className="py-1 px-3 text-xs">Reject</Button>
                  </div>
                </div>
              )) : <div className="py-8 text-center text-gray-500">No pending courses</div>}
            </div>
            <Pagination page={allPendingPage} totalPages={allPendingTotalPages} onPageChange={fetchAllPending} />
          </>
        )}
      </Modal>

      {/* ========== MODAL: Course Detail ========== */}
      <Modal isOpen={showCourseDetail} onClose={() => { setShowCourseDetail(false); setCourseDetail(null); }} title="Course Details">
        {isLoadingDetail ? (
          <div className="py-12 text-center text-gray-500">Loading course details...</div>
        ) : courseDetail ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {courseDetail.thumbnailUrl && <img src={courseDetail.thumbnailUrl} alt={courseDetail.title} className="w-32 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0" />}
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-[#2d2d2d]">{courseDetail.title}</h3>
                <p className="text-sm text-gray-500 mt-1">By {courseDetail.instructorName || 'Unknown Instructor'}</p>
                <span className="inline-block mt-2 text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded">{courseDetail.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <DollarSign className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="text-lg font-bold text-[#2d2d2d]">${courseDetail.price}</span>
                <p className="text-xs text-gray-500">Price</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <BookOpen className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="text-lg font-bold text-[#2d2d2d]">{courseDetail.sections?.length || 0}</span>
                <p className="text-xs text-gray-500">Sections</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                <span className="text-lg font-bold text-[#2d2d2d]">{courseDetail.totalDurationMinutes || 0}m</span>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="block text-lg font-bold text-[#2d2d2d]">{getDifficultyLabel(courseDetail.difficultyLevel)}</span>
                <p className="text-xs text-gray-500">Difficulty</p>
              </div>
            </div>

            {courseDetail.description && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4">{courseDetail.description}</p>
              </div>
            )}

            {courseDetail.categoryName && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-2">Category</h4>
                <span className="inline-block text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{courseDetail.categoryName}</span>
              </div>
            )}

            {courseDetail.sections && courseDetail.sections.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Curriculum</h4>
                <div className="space-y-3">
                  {courseDetail.sections.map((section: any, sIdx: number) => (
                    <div key={section.id || sIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <span className="font-bold text-sm text-[#2d2d2d]">Section {sIdx + 1}: {section.title}</span>
                      </div>
                      {section.lessons && section.lessons.length > 0 && (
                        <div className="divide-y divide-gray-100">
                          {section.lessons.map((lesson: any, lIdx: number) => (
                            <div key={lesson.id || lIdx} className="px-4 py-2.5 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{lIdx + 1}</span>
                                <span className="text-[#2d2d2d]">{lesson.title}</span>
                              </div>
                              <span className="text-xs text-gray-400">{lesson.durationMinutes || 0}min</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button onClick={() => handleApprove(courseDetail.id)} variant="primary" className="flex-1">Approve Course</Button>
              <Button onClick={() => handleReject(courseDetail.id)} variant="outline" className="flex-1">Reject Course</Button>
            </div>
          </div>
        ) : <div className="py-12 text-center text-gray-500">Course not found</div>}
      </Modal>
    </div>
  );
}