import React from 'react';
import { PlayCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
export function CustomerDashboard() {
  const {
    user
  } = useAuth();
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
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Oct 24, 2023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Watercolor Wonderland
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $29.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Oct 20, 2023
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fun with Clay
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $39.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}