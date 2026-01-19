import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function InstructorDashboard() {
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
              $1,240
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
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">156</p>
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
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">4</p>
          </div>

          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase">
                Avg Rating
              </h3>
              <div className="text-yellow-400">★★★★★</div>
            </div>
            <p className="text-3xl font-serif font-bold text-[#2d2d2d]">4.8</p>
          </div>
        </div>

        {/* Course List */}
        <h2 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-6">
          Your Courses
        </h2>
        <div className="bg-white border border-[#2d2d2d]/10 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
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
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200">
                      <img className="h-10 w-10 object-cover" src="https://images.unsplash.com/photo-1513364776144-60967b0f800f" alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Watercolor Wonderland
                      </div>
                      <div className="text-sm text-gray-500">
                        Beginner • Ages 5-7
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  120
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $3,480
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Published
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-[#2d2d2d] hover:text-[#ff8a80] mr-4">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
              {/* More rows would go here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}