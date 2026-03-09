import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { coursesApi, instructorProfilesApi } from '../api';

export function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    activeCourses: 0,
    avgRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      // Fetch Profile and Courses in parallel
      const [profileRes, coursesRes] = await Promise.all([
        instructorProfilesApi.getMyProfile().catch(() => null),
        coursesApi.getMyCourses(1, 50)
      ]);

      let earnings = 0;
      if (profileRes?.data?.data) {
        earnings = profileRes.data.data.totalEarnings || 0;
      }

      if (coursesRes.data?.data) {
        const fetchedCourses = coursesRes.data.data.items || [];
        setCourses(fetchedCourses);

        const activeCount = fetchedCourses.filter((c: any) => c.status === 'Published').length;
        setStats({
          totalRevenue: earnings,
          totalStudents: 0, // Backend doesn't provide student count yet
          activeCourses: activeCount,
          avgRating: 0.0 // Backend doesn't provide rating yet
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
          <Link to="/instructor/create-course">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Total Revenue
              </h3>
              <DollarSign className="w-5 h-5 text-[#87a878]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">
              ${stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
            </p>
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
                        course.status === 'PendingReview' ? 'bg-yellow-100 text-yellow-800' :
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