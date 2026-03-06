import React, { useEffect, useState } from 'react';
import { Users, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { adminApi } from '../api';

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, coursesRes] = await Promise.all([
        adminApi.getUsers({ limit: 5 }),
        adminApi.getCourses({ limit: 10 })
      ]);
      setUsers(usersRes.data.data?.data || usersRes.data.data || []);
      setCourses(coursesRes.data.data?.data || coursesRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveCourse = async (id: string, isApprove: boolean) => {
    try {
      await adminApi.updateCourseStatus(id, isApprove ? 'APPROVED' : 'REJECTED', isApprove ? undefined : 'Declined by admin');
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Failed to update course', err);
      alert('Failed to update course status');
    }
  };

  const pendingCourses = courses.filter((c: any) => c.status === 'PENDING');

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
              {users.length > 0 ? users.length + '+' : '---'}
            </p>
          </div>
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">
              Total Courses
            </h3>
            <p className="text-4xl font-serif font-bold text-[#2d2d2d]">{courses.length > 0 ? courses.length : '---'}</p>
          </div>
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <h3 className="text-gray-500 text-sm uppercase font-medium mb-2">
              Pending Approvals
            </h3>
            <p className="text-4xl font-serif font-bold text-[#ff8a80]">{pendingCourses.length}</p>
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
            <div className="bg-white border border-[#2d2d2d]/10 max-h-[400px] overflow-y-auto">
              {loading ? <p className="p-4 text-center">Loading...</p> : users.map(u => <div key={u.userId} className="p-4 border-b border-[#2d2d2d]/10 flex items-center justify-between last:border-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2d2d2d]">
                        {u.fullName || 'No Name'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-600">
                    {u.role?.roleName || 'Customer'}
                  </span>
                </div>)}
              {!loading && users.length === 0 && <p className="p-4 text-center text-gray-500">No recent users.</p>}
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
            <div className="bg-white border border-[#2d2d2d]/10 max-h-[400px] overflow-y-auto">
              {loading ? <p className="p-4 text-center">Loading...</p> : pendingCourses.map(c => <div key={c.courseId} className="p-4 border-b border-[#2d2d2d]/10 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#2d2d2d] truncate mr-2" title={c.title}>
                      {c.title || 'Untitled Course'}
                    </h3>
                    <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded">
                      PENDING
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 truncate">
                    By {c.instructor?.fullName || 'Unknown'} • {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleApproveCourse(c.courseId, true)} size="sm" variant="primary" className="py-1 px-3 text-xs">
                      Approve
                    </Button>
                    <Button onClick={() => handleApproveCourse(c.courseId, false)} size="sm" variant="outline" className="py-1 px-3 text-xs">
                      Reject
                    </Button>
                  </div>
                </div>)}
              {!loading && pendingCourses.length === 0 && <p className="p-4 text-center text-gray-500">No courses pending approval.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}