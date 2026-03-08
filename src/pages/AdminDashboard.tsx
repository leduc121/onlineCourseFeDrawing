import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usersApi, coursesApi } from '../api';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingApprovals: 0
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch users
      const usersRes = await usersApi.getAll(1, 5); 
      // Fetch courses (all)
      const coursesRes = await coursesApi.getAll(1, 1);
      // Fetch pending courses
      const pendingRes = await coursesApi.getPendingReview(1, 5);
      
      const totalUsers = usersRes.data?.data?.totalCount || 0;
      const totalCourses = coursesRes.data?.data?.totalCount || 0;
      const pendingApprovals = pendingRes.data?.data?.totalCount || 0;

      setStats({
        totalUsers,
        totalCourses,
        pendingApprovals
      });

      setRecentUsers(usersRes.data?.data?.items || []);
      setPendingCourses(pendingRes.data?.data?.items || []);
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await coursesApi.approve(id);
      fetchData(); // Refresh list
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
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error rejecting course:", error);
      alert("Failed to reject course");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf8f5] py-12 flex items-center justify-center">Loading...</div>;
  }

  return <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-[#2d2d2d] mb-12">
          Admin Overview
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">
              Total Users
            </h3>
            <p className="text-4xl font-serif font-bold text-[#2d2d2d]">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">
              Total Courses
            </h3>
            <p className="text-4xl font-serif font-bold text-[#2d2d2d]">{stats.totalCourses}</p>
          </div>
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">
              Pending Approvals
            </h3>
            <p className="text-4xl font-serif font-bold text-[#ff8a80]">{stats.pendingApprovals}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* Recent Users */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">
                Recent Users
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="bg-white border border-[#2d2d2d]/10">
              {recentUsers.length > 0 ? recentUsers.map(user => <div key={user.id} className="p-4 border-b border-[#2d2d2d]/10 flex items-center justify-between last:border-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2d2d2d]">
                        {user.fullName || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email || 'No Email'}
                      </p>
                    </div>
                  </div>
                </div>) : <div className="p-4 text-center text-gray-500">No recent users</div>}
            </div>
          </div>

          {/* Pending Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#2d2d2d]">
                Course Approvals
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="bg-white border border-[#2d2d2d]/10">
              {pendingCourses.length > 0 ? pendingCourses.map(course => <div key={course.id} className="p-4 border-b border-[#2d2d2d]/10 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#2d2d2d]">
                      {course.title || 'Untitled Course'}
                    </h3>
                    <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded">
                      PENDING
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    By {course.instructorName || 'Unknown Instructor'} • Submitted recently
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleApprove(course.id)} size="sm" variant="primary" className="py-1 px-3 text-xs">
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(course.id)} size="sm" variant="outline" className="py-1 px-3 text-xs">
                      Reject
                    </Button>
                  </div>
                </div>) : <div className="p-4 text-center text-gray-500">No pending courses</div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}