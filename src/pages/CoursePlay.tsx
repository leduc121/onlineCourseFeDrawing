import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi, progressApi } from '../api';
import { CheckCircle, PlayCircle, ArrowLeft, HelpCircle, FileText, Sparkles, Clock, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuizPlayer } from '../components/QuizPlayer';
import { AssignmentPlayer } from '../components/AssignmentPlayer';

export function CoursePlay() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showAssignment, setShowAssignment] = useState(false);

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
             setIsLoading(false);
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
        setShowQuiz(false);
        setShowAssignment(false);
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

    const handleQuizComplete = async () => {
        // Refresh progress after quiz completion
        if (id) {
            try {
                const progRes = await progressApi.getCourseProgress(id);
                setProgress(progRes.data?.data);
            } catch (e) { console.error(e); }
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
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-[#120d0b]/95 via-[#120d0b]/55 to-transparent pointer-events-none">
                             <div className="pointer-events-auto max-w-5xl">
                                 <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f8ebd8] backdrop-blur-md">
                                     <Sparkles size={12} />
                                     Studio Session
                                 </div>
                                 <h2 className="mt-4 text-2xl font-bold text-white drop-shadow-lg md:text-4xl">
                                     {currentLesson.title}
                                 </h2>
                                 <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#efe5dc] drop-shadow-md md:text-base">
                                     {currentLesson.description || 'Continue the lesson, then complete the guided challenge below to lock in what you learned.'}
                                 </p>

                                 {(currentLesson.quiz || currentLesson.assignment) && (
                                     <div className="mt-5 grid max-w-4xl gap-4 md:grid-cols-2">
                                         {currentLesson.quiz && (
                                             <div className="rounded-[28px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(241,245,249,0.88))] p-5 shadow-2xl backdrop-blur-xl">
                                                 <div className="flex items-start justify-between gap-4">
                                                     <div>
                                                         <div className="inline-flex items-center gap-2 rounded-full bg-[#dbeafe] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1d4ed8]">
                                                             <HelpCircle size={12} />
                                                             Knowledge Check
                                                         </div>
                                                         <h3 className="mt-4 text-xl font-bold text-[#111827]">Take Quiz</h3>
                                                         <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                                                             A focused review of this lesson with timed questions and instant scoring.
                                                         </p>
                                                     </div>
                                                     <div className="rounded-2xl bg-[#eff6ff] p-3 text-[#2563eb]">
                                                         <Sparkles size={20} />
                                                     </div>
                                                 </div>
                                                 <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-[#64748b]">
                                                     <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm">
                                                         <Clock size={13} />
                                                         Timed
                                                     </span>
                                                     <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-sm">
                                                         <CheckCircle size={13} />
                                                         Instant result
                                                     </span>
                                                 </div>
                                                 <button
                                                     onClick={() => setShowQuiz(true)}
                                                     className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#1d4ed8] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1e40af] hover:shadow-lg hover:shadow-blue-500/20"
                                                 >
                                                     <HelpCircle size={18} />
                                                     Launch Quiz
                                                 </button>
                                             </div>
                                         )}
                                         {currentLesson.assignment && (
                                             <div className="rounded-[28px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,248,240,0.96),rgba(251,236,221,0.9))] p-5 shadow-2xl backdrop-blur-xl">
                                                 <div className="flex items-start justify-between gap-4">
                                                     <div>
                                                         <div className="inline-flex items-center gap-2 rounded-full bg-[#ffedd5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#c2410c]">
                                                             <PenTool size={12} />
                                                             Studio Task
                                                         </div>
                                                         <h3 className="mt-4 text-xl font-bold text-[#1f2937]">Take Assignment</h3>
                                                         <p className="mt-2 text-sm leading-relaxed text-[#6b4f3d]">
                                                             Submit your artwork, notes, or file link so the instructor can review your work professionally.
                                                         </p>
                                                     </div>
                                                     <div className="rounded-2xl bg-white/75 p-3 text-[#c2410c]">
                                                         <FileText size={20} />
                                                     </div>
                                                 </div>
                                                 <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-[#7c5a45]">
                                                     <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                                                         <FileText size={13} />
                                                         File or link
                                                     </span>
                                                     <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                                                         <CheckCircle size={13} />
                                                         Instructor feedback
                                                     </span>
                                                 </div>
                                                 <button
                                                     onClick={() => setShowAssignment(true)}
                                                     className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#c2410c] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#9a3412] hover:shadow-lg hover:shadow-orange-500/20"
                                                 >
                                                     <FileText size={18} />
                                                     Open Assignment
                                                 </button>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
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
                                                             {lesson.quiz && (
                                                                 <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                                                                     <HelpCircle size={10} /> Quiz
                                                                 </span>
                                                             )}
                                                             {lesson.assignment && (
                                                                 <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold">
                                                                     <FileText size={10} /> Task
                                                                 </span>
                                                             )}
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

            {/* Quiz Modal */}
            {showQuiz && currentLesson?.quiz && (
                <QuizPlayer
                    quizId={currentLesson.quiz.id}
                    lessonTitle={currentLesson.title}
                    onClose={() => setShowQuiz(false)}
                    onComplete={handleQuizComplete}
                />
            )}

            {/* Assignment Modal */}
            {showAssignment && currentLesson?.assignment && (
                <AssignmentPlayer
                    assignmentId={currentLesson.assignment.id}
                    lessonTitle={currentLesson.title}
                    onClose={() => setShowAssignment(false)}
                    onComplete={handleQuizComplete}
                />
            )}
        </div>
    );
}
