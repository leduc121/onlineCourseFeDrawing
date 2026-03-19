import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi, progressApi } from '../api';
import { CheckCircle, PlayCircle, ArrowLeft, HelpCircle, FileText, Sparkles } from 'lucide-react';
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
    const completionPercentage = progress?.completionPercentage ?? progress?.progressPercentage ?? 0;

    return (
        <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 p-4 shrink-0 flex items-center gap-4 shadow-sm z-10">
                <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ArrowLeft size={20} />
                </button>
                <div>
                     <h1 className="text-xl font-bold text-[#2d2d2d] leading-none">{course.title}</h1>
                     <div className="flex items-center gap-2 mt-2">
                         <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                         </div>
                         <span className="text-xs font-bold text-gray-500">{completionPercentage}% Complete</span>
                     </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>
                {/* Left: Video Player Area */}
                <div className="flex-1 bg-[#120d0b] flex flex-col overflow-hidden">
                    <div className="relative flex-1 bg-black flex flex-col items-center justify-center overflow-hidden">
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

                    {currentLesson && (
                        <div className="border-t border-[#2b221d] bg-[#171210] px-4 py-4 md:px-6 md:py-5">
                             <div className="max-w-5xl">
                                 <div className="inline-flex items-center gap-2 rounded-full border border-[#3a2d25] bg-[#241b17] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f3dfc7]">
                                     <Sparkles size={12} />
                                     Studio Session
                                 </div>
                                 <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
                                     {currentLesson.title}
                                 </h2>
                                 <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#d8c9ba] md:text-base">
                                     {currentLesson.description || 'Continue the lesson, then open the quiz or assignment from the lesson outline whenever you want.'}
                                 </p>

                                 {(currentLesson.quiz || currentLesson.assignment) && (
                                     <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#3a2d25] bg-[#241b17] px-3 py-2 text-xs font-semibold text-[#f3dfc7]">
                                         <Sparkles size={13} />
                                         Quiz and assignment are available in the lesson outline whenever you want to open them.
                                     </div>
                                 )}
                             </div>
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
                                             const hasActivities = lesson.quiz || lesson.assignment;
                                             return (
                                                  <div key={lesson.id || lIdx} className={`${isSelected ? 'bg-[#f8f4ee]' : 'bg-white'}`}>
                                                      <button
                                                          onClick={() => handleLessonClick(lesson)}
                                                          className={`w-full text-left p-4 hover:bg-indigo-50/50 transition-colors flex gap-3 items-start ${isSelected ? 'bg-[#f8f4ee]' : ''}`}
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

                                                      {isSelected && hasActivities && (
                                                          <div className="px-4 pb-4 pl-12">
                                                              <div className="rounded-[22px] border border-[#e7ddd2] bg-white/90 p-3 shadow-sm">
                                                                  <div className="flex items-center justify-between gap-3">
                                                                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f7f72]">
                                                                          Lesson Challenges
                                                                      </p>
                                                                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef6ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#46607d]">
                                                                          Ready
                                                                      </span>
                                                                  </div>

                                                                  <div className="mt-3 space-y-2">
                                                                      {lesson.quiz && (
                                                                          <button
                                                                              onClick={() => setShowQuiz(true)}
                                                                              className="flex w-full items-start justify-between rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-3 py-3 text-left transition-all hover:border-[#bfd1f1] hover:bg-[#eef5ff]"
                                                                          >
                                                                              <div className="flex gap-3">
                                                                                  <div className="mt-0.5 rounded-xl bg-white p-2 text-[#2563eb] shadow-sm">
                                                                                      <HelpCircle size={15} />
                                                                                  </div>
                                                                                  <div>
                                                                                      <p className="text-sm font-semibold text-[#1f2937]">Knowledge Check Quiz</p>
                                                                                      <p className="mt-1 text-xs leading-relaxed text-[#667085]">
                                                                                          Open it any time after or during the lesson to check your understanding.
                                                                                      </p>
                                                                                  </div>
                                                                              </div>
                                                                              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7b8ba6]">
                                                                                  Open
                                                                              </span>
                                                                          </button>
                                                                      )}

                                                                      {lesson.assignment && (
                                                                          <button
                                                                              onClick={() => setShowAssignment(true)}
                                                                              className="flex w-full items-start justify-between rounded-2xl border border-[#ead8cb] bg-[#fff8f2] px-3 py-3 text-left transition-all hover:border-[#e3c1a9] hover:bg-[#fff1e6]"
                                                                          >
                                                                              <div className="flex gap-3">
                                                                                  <div className="mt-0.5 rounded-xl bg-white p-2 text-[#b45309] shadow-sm">
                                                                                      <FileText size={15} />
                                                                                  </div>
                                                                                  <div>
                                                                                      <p className="text-sm font-semibold text-[#1f2937]">Studio Assignment</p>
                                                                                      <p className="mt-1 text-xs leading-relaxed text-[#7a6557]">
                                                                                          Submit artwork, notes, or continue in the drawing studio whenever you are ready.
                                                                                      </p>
                                                                                  </div>
                                                                              </div>
                                                                              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a6f53]">
                                                                                  Open
                                                                              </span>
                                                                          </button>
                                                                      )}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      )}
                                                  </div>
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
