import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CourseCard, CourseProps } from '../components/CourseCard';
// Mock Data
const MOCK_COURSES: CourseProps[] = [{
  id: '1',
  title: 'Watercolor Wonderland: Basics for Kids',
  instructor: 'Ms. Lan Anh',
  price: 29,
  rating: 4.8,
  students: 120,
  duration: '4 weeks',
  image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ageGroup: '5-7',
  category: 'Watercolor'
}, {
  id: '2',
  title: 'Digital Art Heroes: Character Design',
  instructor: 'Mr. Minh Tuan',
  price: 49,
  rating: 4.9,
  students: 85,
  duration: '6 weeks',
  image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ageGroup: '8-10',
  category: 'Digital Art'
}, {
  id: '3',
  title: 'Sketching Nature: Outdoor Adventures',
  instructor: 'Ms. Thu Ha',
  price: 35,
  rating: 4.7,
  students: 200,
  duration: '5 weeks',
  image: 'https://images.unsplash.com/photo-1515462277126-2dd0c162007a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ageGroup: '11-13',
  category: 'Drawing'
}, {
  id: '4',
  title: 'Acrylic Magic: Painting Landscapes',
  instructor: 'Mr. Hoang',
  price: 45,
  rating: 4.6,
  students: 150,
  duration: '6 weeks',
  image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ageGroup: '8-10',
  category: 'Acrylic'
}, {
  id: '5',
  title: 'Fun with Clay: Sculpting Basics',
  instructor: 'Ms. Mai',
  price: 39,
  rating: 4.9,
  students: 95,
  duration: '4 weeks',
  image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ageGroup: '5-7',
  category: 'Sculpture'
}, {
  id: '6',
  title: 'Anime Style Drawing Masterclass',
  instructor: 'Mr. Ken',
  price: 55,
  rating: 4.8,
  students: 300,
  duration: '8 weeks',
  image: 'https://images.unsplash.com/photo-1560131914-15949d21226b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ageGroup: '11-13',
  category: 'Drawing'
}];
export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = selectedAge === 'all' || course.ageGroup === selectedAge;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesAge && matchesCategory;
  });
  return <div className="min-h-screen bg-[#faf8f5] pb-20">
      {/* Header */}
      <div className="bg-[#2d2d2d] text-[#faf8f5] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Explore Our Art Courses
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover the perfect class for your young artist, from watercolors
            to digital design.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filters */}
        <div className="bg-white p-6 shadow-xl border border-[#2d2d2d]/10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search courses or instructors..." className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] focus:border-[#2d2d2d] focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div>
              <select className="w-full px-4 py-3 border-2 border-[#e5e5e5] focus:border-[#2d2d2d] focus:outline-none bg-white" value={selectedAge} onChange={e => setSelectedAge(e.target.value)}>
                <option value="all">All Ages</option>
                <option value="5-7">Ages 5-7</option>
                <option value="8-10">Ages 8-10</option>
                <option value="11-13">Ages 11-13</option>
              </select>
            </div>
            <div>
              <select className="w-full px-4 py-3 border-2 border-[#e5e5e5] focus:border-[#2d2d2d] focus:outline-none bg-white" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Watercolor">Watercolor</option>
                <option value="Drawing">Drawing</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Acrylic">Acrylic</option>
                <option value="Sculpture">Sculpture</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}
        </div>

        {filteredCourses.length === 0 && <div className="text-center py-20">
            <p className="text-xl text-gray-500 font-serif">
              No courses found matching your criteria.
            </p>
            <button onClick={() => {
          setSearchTerm('');
          setSelectedAge('all');
          setSelectedCategory('all');
        }} className="mt-4 text-[#ff8a80] font-medium hover:underline">
              Clear all filters
            </button>
          </div>}
      </div>
    </div>;
}