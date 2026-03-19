import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WeeklyStreak } from '../components/WeeklyStreak';
import { StudyScheduleManager } from '../components/StudyScheduleManager';
import { studentProfilesApi, paymentsApi } from '../api';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newKid, setNewKid] = useState({ name: '', email: '', password: '' });
  const [selectedKidDetails, setSelectedKidDetails] = useState<any | null>(null);
  const [selectedKidCourses, setSelectedKidCourses] = useState<any[]>([]);
  const [isLoadingKidCourses, setIsLoadingKidCourses] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch children
      const kidsRes = await studentProfilesApi.getMyStudents();
      if (kidsRes.data?.data) {
        setChildren(kidsRes.data.data);
      }
      // Fetch order history
      const txRes = await paymentsApi.getMyTransactions();
      if (txRes.data?.data) {
        setTransactions(txRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch customer dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    const verifyAndFetch = async () => {
      if (sessionId) {
        try {
          setIsLoading(true);
          await paymentsApi.verifySession(sessionId);
          // Remove session_id from URL without reloading
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.pathname);
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      }
      fetchDashboardData();
    };

    verifyAndFetch();
  }, []);

  const handleAddKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await studentProfilesApi.registerStudent({
        email: newKid.email,
        password: newKid.password,
        fullName: newKid.name
      });
      alert('Child account created successfully!');
      setIsModalOpen(false);
      setNewKid({ name: '', email: '', password: '' });
      fetchDashboardData(); // Refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create child account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKidClick = async (kid: any) => {
    setSelectedKidDetails(kid);
    setIsLoadingKidCourses(true);
    setSelectedKidCourses([]);
    try {
      const res = await studentProfilesApi.getEnrolledCourses(kid.id);
      if (res.data?.data) {
        setSelectedKidCourses(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch kid courses", err);
    } finally {
      setIsLoadingKidCourses(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf8f5] py-12 flex justify-center text-[#2d2d2d] font-bold">Loading...</div>;
  }


  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#2d2d2d]">
              My Studio
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Ready to create?
            </p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/membership')}
            >
              Upgrade Membership
            </Button>
          </div>
          <div className="flex space-x-4">
            <div className="bg-white px-6 py-3 border border-[#2d2d2d]/10 text-center">
              <span className="block text-2xl font-bold text-[#ff8a80]">2</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Courses
              </span>
            </div>
            <div className="bg-white px-6 py-3 border border-[#2d2d2d]/10 text-center">
              <span className="block text-2xl font-bold text-[#87a878]">
                12
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Hours
              </span>
            </div>
          </div>
        </div>

        {/* <WeeklyStreak /> moved to Kid Details */}

        {/* Kids Management Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">
              Manage Kids & Assignments
            </h2>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
              + Add New Kid Account
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(kid => (
              <div 
                key={kid.id} 
                className="bg-white p-6 rounded-xl border-2 border-[#2d2d2d]/10 flex items-center gap-4 cursor-pointer hover:border-[#ff8a80] transition-colors"
                onClick={() => handleKidClick(kid)}
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.id}`}
                  alt="Kid Avatar"
                  className="w-16 h-16 rounded-full bg-yellow-50"
                />
                <div>
                  <h3 className="font-bold text-lg text-[#2d2d2d]">{kid.studentFullName || "Student"}</h3>
                  <p className="text-sm text-gray-500 mb-2">Joined: {new Date(kid.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs bg-[#E0F2F1] text-[#00695C] px-2 py-1 rounded-full font-bold">
                      Active
                    </span>
                    <button 
                      className="text-xs text-[#5D5FEF] font-bold hover:underline" 
                      onClick={(e) => { e.stopPropagation(); navigate(`/courses?childId=${kid.id}`); }}
                    >
                      Get Courses
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Child Trigger Card */}
            <div onClick={() => setIsModalOpen(true)} className="bg-white p-6 rounded-xl border border-[#2d2d2d]/10 flex items-center gap-4 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <span className="text-2xl">+</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-600">Add Child</h3>
                <p className="text-sm text-gray-400">Create account for your kid</p>
              </div>
            </div>
          </div>
        </div>


        <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
          Order History
        </h2>
        <div className="bg-white border border-[#2d2d2d]/10 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                    {tx.txnRef?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2d2d2d]">
                    {tx.courseTitle || (tx.cartItems && tx.cartItems.length > 0 ? tx.cartItems[0].courseTitle : 'Unknown')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2d2d2d]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'Success' || tx.status === 1 ? 'bg-green-100 text-green-800' : 
                      tx.status === 'Pending' || tx.status === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.status === 'Success' || tx.status === 1 ? 'Completed' : 
                       tx.status === 'Pending' || tx.status === 0 ? 'Pending' : 
                       tx.status === 'Failed' || tx.status === 2 ? 'Failed' : tx.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Kid Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#2d2d2d]"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-2">Add New Child Account</h2>
              <p className="text-gray-500 mb-6 text-sm">Create a student login for your child to access assigned courses.</p>
              <form onSubmit={handleAddKid} className="space-y-4">
                <Input 
                  label="Kid's Name" 
                  required 
                  value={newKid.name} 
                  onChange={e => setNewKid({...newKid, name: e.target.value})} 
                />
                <Input 
                  label="Kid's Login Email" 
                  type="email" 
                  required 
                  value={newKid.email} 
                  onChange={e => setNewKid({...newKid, email: e.target.value})} 
                  placeholder="kid@example.com"
                />
                <Input 
                  label="Login Password" 
                  type="password" 
                  required 
                  value={newKid.password} 
                  onChange={e => setNewKid({...newKid, password: e.target.value})} 
                />
                <div className="pt-4">
                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Kid Details Modal */}
        {selectedKidDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-hidden flex flex-col">
              <button 
                onClick={() => setSelectedKidDetails(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#2d2d2d]"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center mb-6 shrink-0">
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedKidDetails.id}`}
                    alt="Kid Avatar"
                    className="w-20 h-20 rounded-full bg-yellow-50 mb-3 border-2 border-[#ff8a80]"
                />
                <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">{selectedKidDetails.studentFullName}</h2>
                <p className="text-gray-500 text-sm">{selectedKidDetails.studentEmail}</p>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-0.5">Joined Date</p>
                    <p className="font-bold text-[#2d2d2d]">{new Date(selectedKidDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-0.5">Enrolled</p>
                    <p className="font-bold text-[#2d2d2d]">{selectedKidDetails.enrollmentCount || 0} Course(s)</p>
                  </div>
                </div>

                <div className="space-y-6">
                    <WeeklyStreak 
                        studentName={selectedKidDetails.studentFullName.split(' ')[0]}
                        currentStreak={selectedKidDetails.currentStreak || 0}
                        visitsCount={selectedKidDetails.currentStreak > 0 ? 1 : 0} // Simple mapping for now
                        showSchedule={false} // We have a separate manager below
                    />

                    <StudyScheduleManager 
                        studentProfileId={selectedKidDetails.id}
                        studentName={selectedKidDetails.studentFullName.split(' ')[0]}
                    />

                    <h4 className="font-bold text-[#2d2d2d] mb-3 flex items-center gap-2">
                        Tiến độ học tập
                    </h4>
                </div>
                  {isLoadingKidCourses ? (
                    <div className="text-center py-8 text-gray-400 text-sm italic">Loading courses...</div>
                  ) : selectedKidCourses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedKidCourses.map(course => (
                        <div key={course.id} className="bg-white border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                          <img src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80'} className="w-12 h-10 object-cover rounded" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#2d2d2d] line-clamp-1">{course.title}</p>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1">
                              <div className="bg-[#87a878] h-full rounded-full" style={{ width: `${course.progress || 0}%` }} />
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-gray-400 shrink-0">{course.progress || 0}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400">No courses assigned to {selectedKidDetails.studentFullName.split(' ')[0]} yet.</p>
                      <button 
                        onClick={() => navigate('/courses')} 
                        className="text-xs text-[#ff8a80] font-bold mt-2 hover:underline"
                      >
                        Explore Catalog
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 shrink-0 mt-4 border-t border-gray-100">
                  <Button 
                    onClick={() => navigate('/courses')} 
                    className="w-full"
                  >
                    Tìm thêm khóa học cho {selectedKidDetails.studentFullName.split(' ')[0]}
                  </Button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}