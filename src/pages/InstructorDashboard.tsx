import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { coursesApi, instructorProfilesApi, withdrawalsApi } from '../api';

export function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    withdrawableAmount: 0,
    totalStudents: 0,
    activeCourses: 0,
    avgRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      // Fetch Profile and Courses in parallel
      const [profileRes, coursesRes, withdrawableRes] = await Promise.all([
        instructorProfilesApi.getMyProfile().catch(() => null),
        coursesApi.getMyCourses(1, 50),
        withdrawalsApi.getWithdrawableAmount().catch(() => null)
      ]);

      let earnings = 0;
      let withdrawable = 0;
      let totalStudents = 0;
      
      if (profileRes?.data?.data) {
        earnings = profileRes.data.data.totalEarnings || 0;
        withdrawable = profileRes.data.data.withdrawableEarnings || 0;
      }

      if (withdrawableRes?.data?.data?.amount !== undefined) {
        withdrawable = withdrawableRes.data.data.amount || 0;
      }

      if (coursesRes.data?.data) {
        const fetchedCourses = coursesRes.data.data.items || [];
        setCourses(fetchedCourses);

        const activeCount = fetchedCourses.filter((c: any) => c.status === 'Published').length;
        // Calculate total students by summing enrollments from all courses
        totalStudents = fetchedCourses.reduce((sum: number, course: any) => {
          return sum + (course.enrollmentCount || 0);
        }, 0);
        
        setStats({
          totalRevenue: earnings,
          withdrawableAmount: withdrawable,
          totalStudents: totalStudents,
          activeCourses: activeCount,
          avgRating: 0.0
        });
      }
    } catch (error) {
      console.error("Error fetching instructor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesApi.delete(id);
        fetchMyCourses();
      } catch (error) {
        console.error("Error deleting course", error);
        alert("Failed to delete course.");
      }
    }
  };

  const handlePublish = async (id: string) => {
    if (confirm('Are you sure you want to publish this course to the public catalog?')) {
      try {
        await coursesApi.publish(id);
        alert('Course published successfully!');
        fetchMyCourses();
      } catch (error: any) {
        console.error('Failed to publish course', error);
        alert(error.response?.data?.message || 'Failed to publish course.');
      }
    }
  };

  return <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#2d2d2d]">
              Instructor Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your courses and track your students' progress.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchMyCourses()}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 text-sm font-medium"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link to="/instructor/create-course">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Create New Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Total Earnings
              </h3>
              <DollarSign className="w-5 h-5 text-[#87a878]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
            </p>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> All time earnings after platform fee
            </p>
          </div>

          <div className="bg-blue-50 p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-blue-600 uppercase">
                Current Balance
              </h3>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-serif font-bold text-blue-700">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.withdrawableAmount)}
            </p>
            <p className="text-sm text-blue-500 mt-2">Remaining after platform fee and withdrawal requests</p>
          </div>

          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Total Students
              </h3>
              <Users className="w-5 h-5 text-[#7eb8da]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">{stats.totalStudents}</p>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +5 new today
            </p>
          </div>

          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Active Courses
              </h3>
              <BookOpen className="w-5 h-5 text-[#ff8a80]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">{stats.activeCourses}</p>
          </div>

          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Avg Rating
              </h3>
              <div className="text-yellow-400">★★★★★</div>
            </div>
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">{stats.avgRating}</p>
          </div>
        </div>

        {/* Course List */}
        <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
          Your Courses
        </h2>
        <div className="bg-white border border-[#2d2d2d]/10 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading courses...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.length > 0 ? courses.map((course: any) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200">
                          <img className="h-10 w-10 object-cover" src={course.thumbnailUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f"} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.categoryName || 'General'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${course.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.status === 'Published' ? 'bg-green-100 text-green-800' :
                        course.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        course.status === 'PendingReview' ? 'bg-yellow-100 text-yellow-800' :
                        course.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {course.status === 'Approved' && (
                        <button onClick={() => handlePublish(course.id)} className="text-green-600 hover:text-green-900 font-bold mr-4">
                          Publish
                        </button>
                      )}
                      <Link to={`/course/${course.id}`} className="text-[#2d2d2d] hover:text-[#ff8a80] mr-4">
                        View
                      </Link>
                      <Link to={`/instructor/edit-course/${course.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </Link>
                      {course.status === 'Approved' && (
                        <button onClick={() => handlePublish(course.id)} className="text-green-600 hover:text-green-900 mr-4 font-semibold">
                          Publish
                        </button>
                      )}
                      <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      You haven't created any courses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>;
}
