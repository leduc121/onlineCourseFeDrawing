import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WeeklyStreak } from '../components/WeeklyStreak';
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
    fetchDashboardData();
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

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf8f5] py-12 flex justify-center text-[#2d2d2d] font-bold">Loading...</div>;
  }

  const myCourses = [{
    id: '1',
    title: 'Watercolor Wonderland',
    progress: 65,
    nextLesson: 'Mixing Purple and Orange',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }, {
    id: '2',
    title: 'Fun with Clay',
    progress: 10,
    nextLesson: 'Making a pinch pot',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }];
  return <div className="min-h-screen bg-[#faf8f5] py-12">
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
            variant="outline"
            className="mt-4 border-purple-600 text-purple-600 hover:bg-purple-50"
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

      <WeeklyStreak />

      {/* Kids Management Section (New) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">
            Manage Kids & Assignments
          </h2>
          <Button variant="outline" size="sm">
            + Add New Kid Account
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map(kid => (
            <div 
              key={kid.id} 
              className="bg-white p-6 rounded-xl border-2 border-[#2d2d2d]/10 flex items-center gap-4 cursor-pointer hover:border-[#ff8a80] transition-colors"
              onClick={() => setSelectedKidDetails(kid)}
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
                    onClick={(e) => { e.stopPropagation(); navigate('/courses'); }}
                  >
                    Get Courses
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Kid Button */}
          <div onClick={() => setIsModalOpen(true)} className="bg-white p-6 rounded-xl border border-[#2d2d2d]/10 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
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
        Continue Learning
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {myCourses.map(course => <div key={course.id} className="bg-white border border-[#2d2d2d]/10 p-6 flex items-center space-x-6 hover:shadow-lg transition-shadow">
          <div className="w-32 h-24 flex-shrink-0 bg-gray-200">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-[#2d2d2d] text-lg mb-1">
              {course.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Next: {course.nextLesson}
            </p>
            <div className="w-full bg-gray-100 h-2 rounded-full mb-3">
              <div className="bg-[#ff8a80] h-full rounded-full" style={{
                width: `${course.progress}%`
              }} />
            </div>
            <Button size="sm" variant="outline" className="w-full">
              <PlayCircle className="w-4 h-4 mr-2" /> Continue
            </Button>
          </div>
        </div>)}
      </div>

      <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
        Order History
      </h2>
      <div className="bg-white border border-[#2d2d2d]/10 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tx.courseTitle || (tx.cartItems && tx.cartItems.length > 0 ? tx.cartItems[0].courseTitle : 'Unknown')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${tx.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tx.status === 'Completed' || tx.status === 1 ? 'bg-green-100 text-green-800' : 
                    tx.status === 'Pending' || tx.status === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.status === 1 ? 'Completed' : tx.status === 0 ? 'Pending' : 'Failed'}
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
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setSelectedKidDetails(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#2d2d2d]"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center mb-6">
              <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedKidDetails.id}`}
                  alt="Kid Avatar"
                  className="w-24 h-24 rounded-full bg-yellow-50 mb-4"
              />
              <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">{selectedKidDetails.studentFullName}</h2>
              <p className="text-gray-500 text-sm">{selectedKidDetails.studentEmail}</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Joined Date</p>
                <p className="font-medium text-[#2d2d2d]">{new Date(selectedKidDetails.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Enrolled Courses</p>
                <p className="font-medium text-[#2d2d2d]">{selectedKidDetails.enrollmentCount || 0}</p>
              </div>
              <div className="pt-4 text-center">
                <Button 
                   onClick={() => navigate('/courses')} 
                   className="w-full"
                >
                  Browse Courses for {selectedKidDetails.studentFullName}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>;
}