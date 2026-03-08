import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CourseCard, CourseProps } from '../components/CourseCard';
import { coursesApi } from '../api';

export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState<CourseProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await coursesApi.getPublished(1, 100);
        if (res.data?.data?.items) {
          const mappedCourses: CourseProps[] = res.data.data.items.map((c: any) => ({
            id: c.id,
            title: c.title,
            instructor: c.instructorName || 'Unknown Instructor',
            price: c.price,
            rating: 5.0, // Defaults or calculate properly if provided by backend
            students: 0,
            duration: c.totalDurationMinutes ? `${Math.round(c.totalDurationMinutes / 60)} hrs` : 'N/A',
            image: c.thumbnailUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            ageGroup: 'Kids', // Example mapping
            category: c.categoryName || 'General'
          }));
          setCourses(mappedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    // Simplify age filtering for now since backend may not have ageGroup
    const matchesAge = selectedAge === 'all' || course.ageGroup.includes(selectedAge);
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

        {isLoading ? (
          <div className="text-center py-20">Loading courses...</div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>;
}