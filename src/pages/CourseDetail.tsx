import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Check, Clock, Users, BookOpen, ChevronDown, ChevronUp, PlayCircle, Lock, FileText, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoPlayer } from '../components/VideoPlayer';
import { EnrollButton } from '../components/EnrollButton';
import { useAuth } from '../contexts/AuthContext';
import { coursesApi } from '../api';

interface LessonData {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  durationMinute: number;
  isTrial: boolean;
  sortOrder: number;
  quiz?: any;
  assignment?: any;
}

interface SectionData {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: LessonData[];
}

export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await coursesApi.getById(id);
        if (res.data?.data) {
          const c = res.data.data;
          // Map sections with their lessons from backend response
          const sections: SectionData[] = c.sections?.map((s: any) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            sortOrder: s.sortOrder,
            lessons: s.lessons?.map((l: any) => ({
              id: l.id,
              title: l.title,
              description: l.description,
              videoUrl: l.videoUrl,
              durationMinute: l.durationMinute,
              isTrial: l.isTrial,
              sortOrder: l.sortOrder,
              quiz: l.quiz,
              assignment: l.assignment,
            })) || [],
          })) || [];

          // Count total lessons
          const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);

          setCourse({
             id: c.id,
             title: c.title,
             instructor: c.instructorName || 'Unknown Instructor',
             price: c.price,
             rating: 5.0,
             reviews: 0,
             students: 0,
             duration: c.totalDurationMinutes ? (c.totalDurationMinutes >= 60 ? `${Math.round(c.totalDurationMinutes / 60)} hrs` : `${c.totalDurationMinutes} min`) : 'N/A',
             description: c.description || 'No description available.',
             thumbnailUrl: c.thumbnailUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
             sections,
             totalLessons,
             features: ['High quality video content', 'Downloadable resources', 'Certificate of completion', 'Lifetime access']
          });

          // Expand first section by default
          if (sections.length > 0) {
            setExpandedSections(new Set([0]));
          }
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

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${minutes} min`;
  };

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
                {course.sections.length} sections • {course.totalLessons} lessons
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
            <p className="text-sm text-gray-500 mb-4">
              {course.sections.length} sections • {course.totalLessons} lessons • {course.duration} total length
            </p>
            <div className="bg-white border border-[#2d2d2d]/10 rounded-lg overflow-hidden">
              {course.sections.length > 0 ? course.sections.map((section: SectionData, sIdx: number) => {
                const isExpanded = expandedSections.has(sIdx);
                const sectionDuration = section.lessons.reduce((sum, l) => sum + l.durationMinute, 0);
                const trialCount = section.lessons.filter(l => l.isTrial).length;

                return <div key={section.id || sIdx} className="border-b border-[#2d2d2d]/10 last:border-b-0">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(sIdx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                      <div>
                        <h4 className="font-semibold text-[#2d2d2d]">
                          {section.title}
                        </h4>
                        {section.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0 ml-4">
                      <span>{section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{formatDuration(sectionDuration)}</span>
                      {trialCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#87a878] font-medium">{trialCount} free</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Section Lessons */}
                  {isExpanded && (
                    <div className="bg-[#faf8f5]/50">
                      {section.lessons.length > 0 ? section.lessons.map((lesson, lIdx) => (
                        <div key={lesson.id || lIdx} className="pl-12 pr-4 py-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors border-t border-[#2d2d2d]/5">
                          <div className="flex items-center gap-3">
                            {lesson.isTrial ? (
                              <PlayCircle className="w-4 h-4 text-[#87a878]" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                            <div>
                              <span className="text-sm text-[#2d2d2d]">{lesson.title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {lesson.quiz && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    <HelpCircle className="w-3 h-3" /> Quiz
                                  </span>
                                )}
                                {lesson.assignment && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                    <FileText className="w-3 h-3" /> Assignment
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="text-xs text-gray-400">
                              {formatDuration(lesson.durationMinute)}
                            </span>
                            {lesson.isTrial ? (
                              <span className="text-[10px] font-bold text-[#87a878] bg-[#87a878]/10 px-2 py-0.5 rounded">
                                PREVIEW
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                LOCKED
                              </span>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="pl-12 pr-4 py-3 text-sm text-gray-400 italic">No lessons in this section.</div>
                      )}
                    </div>
                  )}
                </div>;
              }) : (
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