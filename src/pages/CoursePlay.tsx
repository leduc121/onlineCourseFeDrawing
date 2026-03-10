import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi, progressApi } from '../api';
import { CheckCircle, PlayCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function CoursePlay() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                // Fetch course details for curriculum
                const courseRes = await coursesApi.getById(id);
                const courseData = courseRes.data?.data;
                setCourse(courseData);

                // Fetch progress
                try {
                    const progRes = await progressApi.getCourseProgress(id);
                    setProgress(progRes.data?.data);
                    
                    // Set current lesson
                    if (progRes.data?.data && progRes.data.data.lastAccessedLessonId && courseData?.sections) {
                         let found = null;
                         for(const section of courseData.sections) {
                             const l = section.lessons?.find((x: any) => x.id === progRes.data.data.lastAccessedLessonId);
                             if(l) found = l;
                         }
                         if(found) setCurrentLesson(found);
                    }
                } catch (e: any) {
                    if(e.response?.status === 404 || e.response?.status === 400 || !e.response) {
                        try {
                            const startRes = await progressApi.startCourse(id);
                            setProgress(startRes.data?.data);
                        } catch (startErr) {
                            console.error("Failed to start course. Maybe not enrolled?", startErr);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load course or progress", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.role === 'student') {
             fetchInitialData();
        } else {
             setIsLoading(false); // If not student, we will show "Access Denied" below or something else
        }
    }, [id, user]);

    useEffect(() => {
        // Fallback to first lesson if not set
        if (!currentLesson && course?.sections?.[0]?.lessons?.[0]) {
            setCurrentLesson(course.sections[0].lessons[0]);
        }
    }, [course, currentLesson]);

    const handleLessonClick = async (lesson: any) => {
        setCurrentLesson(lesson);
        if (id && lesson.id) {
             progressApi.updateLastAccessedLesson(id, lesson.id).catch(console.error);
        }
    };

    const handleVideoEnd = async () => {
        if (!currentLesson?.id) return;
        try {
            await progressApi.markLessonComplete(currentLesson.id);
            if(id) {
                const progRes = await progressApi.getCourseProgress(id);
                setProgress(progRes.data?.data);
            }
        } catch (error) {
            console.error("Failed to mark complete", error);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-bold text-gray-500">Loading learning environment...</div>;
    if (user?.role !== 'student') return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-bold text-gray-500">Access Denied. Only students can access the learning player.</div>;
    if (!course) return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-bold text-gray-500">Course not found.</div>;

    const completedIds = progress?.completedLessonIds || [];

    return (
        <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 p-4 shrink-0 flex items-center gap-4 shadow-sm z-10">
                <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ArrowLeft size={20} />
                </button>
                <div>
                     <h1 className="text-xl font-bold text-[#2d2d2d] leading-none">{course.title}</h1>
                     {progress && (
                         <div className="flex items-center gap-2 mt-2">
                             <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress.completionPercentage || 0}%` }} />
                             </div>
                             <span className="text-xs font-bold text-gray-500">{progress.completionPercentage || 0}% Complete</span>
                         </div>
                     )}
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
                {/* Left: Video Player Area */}
                <div className="flex-1 bg-black flex flex-col items-center relative overflow-hidden">
                    {currentLesson?.videoUrl ? (
                         <div className="w-full h-full flex flex-col justify-center items-center bg-black">
                              <video 
                                 key={currentLesson.id}
                                 src={currentLesson.videoUrl} 
                                 className="w-full max-h-full object-contain"
                                 controls
                                 autoPlay
                                 onEnded={handleVideoEnd}
                              />
                         </div>
                    ) : (
                         <div className="text-white text-center p-8 m-auto">
                             <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                             <p className="font-bold text-xl text-gray-400">Select a lesson with video to start learning</p>
                         </div>
                    )}
                    
                    {currentLesson && (
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                             <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{currentLesson.title}</h2>
                             <p className="text-gray-300 text-sm max-w-3xl drop-shadow-md">{currentLesson.description}</p>
                        </div>
                    )}
                    
                    {/* Mark complete manually if video is not available */}
                    {currentLesson && !currentLesson.videoUrl && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <button onClick={handleVideoEnd} className="bg-[#5D5FEF] text-white px-6 py-3 rounded-full font-bold hover:bg-[#4a4cc7] transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                                <CheckCircle size={20} />
                                Mark Lesson Complete
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Curriculum Sidebar */}
                <div className="w-full lg:w-96 bg-white shrink-0 border-l border-gray-200 flex flex-col h-full overflow-hidden">
                     <div className="p-6 pb-4 border-b border-gray-100 shadow-sm z-10 shrink-0">
                         <h3 className="text-lg font-black text-[#2d2d2d]">Course Content</h3>
                     </div>
                     <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pb-20">
                         {course.sections?.map((section: any, sIdx: number) => (
                              <div key={section.id || sIdx} className="bg-white">
                                   <div className="p-4 bg-gray-50 border-y border-gray-100 sticky top-0 z-10">
                                       <h4 className="font-bold text-[#2d2d2d] text-sm uppercase tracking-wider text-gray-500">Section {sIdx + 1}: {section.title}</h4>
                                   </div>
                                   <div className="divide-y divide-gray-50">
                                       {section.lessons?.map((lesson: any, lIdx: number) => {
                                            const isSelected = currentLesson?.id === lesson.id;
                                            const isCompleted = completedIds.includes(lesson.id);
                                            return (
                                                 <button 
                                                     key={lesson.id || lIdx}
                                                     onClick={() => handleLessonClick(lesson)}
                                                     className={`w-full text-left p-4 hover:bg-indigo-50/50 transition-colors flex gap-3 items-start ${isSelected ? 'bg-indigo-50/80' : ''}`}
                                                 >
                                                     <div className="shrink-0 mt-0.5">
                                                         {isCompleted ? (
                                                             <CheckCircle size={20} className="text-[#6BCB77] fill-[#6BCB77]/20" />
                                                         ) : (
                                                             <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-[#5D5FEF]' : 'border-gray-300'}`} />
                                                         )}
                                                     </div>
                                                     <div className="flex-1">
                                                         <h5 className={`font-medium text-sm ${isSelected ? 'text-[#5D5FEF] font-bold' : 'text-[#2d2d2d]'}`}>
                                                             {lIdx + 1}. {lesson.title}
                                                         </h5>
                                                         <div className="flex gap-2 items-center mt-1 text-xs font-bold text-gray-400">
                                                             <span>{lesson.durationMinute || 0} min</span>
                                                         </div>
                                                     </div>
                                                 </button>
                                            )
                                       })}
                                   </div>
                              </div>
                         ))}
                     </div>
                </div>
            </div>
        </div>
    );
}
