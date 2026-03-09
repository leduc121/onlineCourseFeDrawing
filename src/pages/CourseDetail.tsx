import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Check, Clock, Users, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoPlayer } from '../components/VideoPlayer';
import { EnrollButton } from '../components/EnrollButton';
import { useAuth } from '../contexts/AuthContext';
import { coursesApi } from '../api';

export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await coursesApi.getById(id);
        if (res.data?.data) {
          const c = res.data.data;
          setCourse({
             id: c.id,
             title: c.title,
             instructor: c.instructorName || 'Unknown Instructor',
             price: c.price,
             rating: 5.0, // Mock or map from response
             reviews: 0,
             students: 0,
             duration: c.totalDurationMinutes ? `${Math.round(c.totalDurationMinutes / 60)} hrs` : 'N/A',
             description: c.description || 'No description available.',
             thumbnailUrl: c.thumbnailUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
             curriculum: c.sections?.map((s: any) => ({
                 title: s.title,
                 duration: 'N/A', // Update with actual structure if lesson durations exist
                 free: false // Update with actual logic
             })) || [],
             features: ['High quality video content', 'Downloadable resources', 'Certificate of completion', 'Lifetime access']
          });
        }
      } catch (error) {
         console.error("Error fetching course detail:", error);
      } finally {
         setIsLoading(false);
      }
    };
    fetchCourseDetails();
  }, [id]);

  if (isLoading) {
      return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">Loading course...</div>;
  }

  if (!course) {
      return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">Course not found.</div>;
  }

  return <div className="min-h-screen bg-[#faf8f5] pb-20">
    {/* Hero Section */}
    <div className="bg-[#2d2d2d] text-[#faf8f5] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center space-x-2 mb-4 text-[#ff8a80]">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold">{course.rating}</span>
              <span className="text-gray-400">
                ({course.reviews} reviews)
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-400 mb-8">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {course.students} students
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {course.duration}
              </div>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {course.curriculum.length} sections
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'student' ? (
                <Button variant="primary" size="lg" onClick={() => { }}>
                  Start Learning
                </Button>
              ) : (
                <>
                  <span className="text-4xl font-serif font-bold text-white">
                    ${course.price}
                  </span>
                  <EnrollButton variant="secondary" size="lg" course={{
                    id: course.id,
                    title: course.title,
                    instructor: course.instructor,
                    price: course.price,
                    thumbnail: course.thumbnailUrl
                  }} />
                </>
              )}
            </div>
          </div>

          {/* Video Preview */}
          <div className="lg:pl-8">
            <div className="border-4 border-white/10 shadow-2xl rounded-lg overflow-hidden">
              <VideoPlayer src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" title="Course Preview" poster={course.thumbnailUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-serif font-bold text-[#2d2d2d] mb-6">
              What you'll learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.features.map((feature: string, idx: number) => <div key={idx} className="flex items-start">
                <Check className="w-5 h-5 text-[#87a878] mr-3 mt-1" />
                <span className="text-gray-700">{feature}</span>
              </div>)}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-serif font-bold text-[#2d2d2d] mb-6">
              Course Curriculum
            </h2>
            <div className="bg-white border border-[#2d2d2d]/10 divide-y divide-[#2d2d2d]/10">
              {course.curriculum.length > 0 ? course.curriculum.map((lesson: any, idx: number) => <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#faf8f5] rounded-full flex items-center justify-center mr-4 text-[#2d2d2d] font-bold text-sm border border-[#2d2d2d]/10">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#2d2d2d]">
                      {lesson.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {lesson.duration}
                    </span>
                  </div>
                </div>
                {lesson.free ? <span className="text-xs font-bold text-[#87a878] bg-[#87a878]/10 px-2 py-1 rounded">
                  PREVIEW
                </span> : <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  LOCKED
                </span>}
              </div>) : (
                <div className="p-4 text-gray-500">No sections added yet.</div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-lg">
            <h3 className="text-xl font-serif font-bold text-[#2d2d2d] mb-4">
              Instructor
            </h3>
            <div className="flex items-center mb-4">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt={course.instructor} className="w-16 h-16 rounded-full object-cover mr-4" />
              <div>
                <p className="font-bold text-[#2d2d2d]">
                  {course.instructor}
                </p>
                <p className="text-sm text-gray-500">
                  Professional Instructor
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Dedicated to teaching high-quality courses.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>;
}