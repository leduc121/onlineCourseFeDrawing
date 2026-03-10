import { useState, useEffect, useRef, useCallback } from 'react';
import { quizzesApi } from '../api';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight, ChevronLeft, HelpCircle, Star, AlertTriangle } from 'lucide-react';

interface Answer {
    id: string;
    questionId: string;
    content: string;
    sortOrder: number;
}

interface Question {
    id: string;
    quizId: string;
    content: string;
    points: number;
    sortOrder: number;
    answers: Answer[];
}

interface QuizDetail {
    id: string;
    lessonId: string;
    title: string;
    passingScore: number;
    timeLimitMinutes: number;
    questions: Question[];
}

interface AnswerResult {
    id: string;
    content: string;
    isCorrect: boolean;
    sortOrder: number;
}

interface QuestionResult {
    id: string;
    content: string;
    points: number;
    sortOrder: number;
    selectedAnswerId: string | null;
    isCorrect: boolean;
    answers: AnswerResult[];
}

interface SubmissionResult {
    id: string;
    quizId: string;
    studentProfileId: string;
    score: number;
    isPassed: boolean;
    timeTakenMinutes: number;
    createdAt: string;
    questionResults?: QuestionResult[];
}

interface QuizPlayerProps {
    quizId: string;
    lessonTitle: string;
    onClose: () => void;
    onComplete?: () => void;
}

type QuizState = 'loading' | 'intro' | 'taking' | 'submitting' | 'result' | 'review' | 'history' | 'error';

export function QuizPlayer({ quizId, lessonTitle, onClose, onComplete }: QuizPlayerProps) {
    const [state, setState] = useState<QuizState>('loading');
    const [quiz, setQuiz] = useState<QuizDetail | null>(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
    const [reviewResult, setReviewResult] = useState<SubmissionResult | null>(null);
    const [error, setError] = useState('');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fetch quiz
    useEffect(() => {
        const load = async () => {
            try {
                const res = await quizzesApi.getById(quizId);
                const data = res.data;
                setQuiz(data);
                setState('intro');
            } catch (e: any) {
                setError(e.response?.data?.message || 'Failed to load quiz.');
                setState('error');
            }
        };
        load();
    }, [quizId]);

    // Timer
    useEffect(() => {
        if (state !== 'taking' || !quiz) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state, quiz]);

    const startQuiz = () => {
        if (!quiz) return;
        setSelectedAnswers({});
        setCurrentQ(0);
        setTimeLeft(quiz.timeLimitMinutes * 60);
        setState('taking');
    };

    const handleSubmit = useCallback(async () => {
        if (!quiz) return;
        if (timerRef.current) clearInterval(timerRef.current);
        setState('submitting');
        try {
            const answers = quiz.questions.map(q => ({
                questionId: q.id,
                answerId: selectedAnswers[q.id] || '',
            })).filter(a => a.answerId);
            const res = await quizzesApi.submit(quiz.id, answers);
            setResult(res.data);
            setState('result');
            if (onComplete) onComplete();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to submit quiz.');
            setState('error');
        }
    }, [quiz, selectedAnswers, onComplete]);

    const loadHistory = async () => {
        try {
            const res = await quizzesApi.getMySubmissions(quizId);
            setSubmissions(res.data || []);
            setState('history');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load submissions.');
            setState('error');
        }
    };

    const loadReview = async (submissionId: string) => {
        try {
            const res = await quizzesApi.getSubmissionDetail(submissionId);
            setReviewResult(res.data);
            setState('review');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load review.');
            setState('error');
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = quiz?.questions.length || 0;

    // Overlay backdrop
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" style={{ animation: 'slideUp 0.3s ease-out' }}>
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <HelpCircle size={24} />
                        <div>
                            <h2 className="font-bold text-lg leading-tight">{quiz?.title || 'Quiz'}</h2>
                            <p className="text-xs text-indigo-200">{lessonTitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {state === 'taking' && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${timeLeft < 60 ? 'bg-red-500/30 text-red-100 animate-pulse' : 'bg-white/20'}`}>
                                <Clock size={16} />
                                {formatTime(timeLeft)}
                            </div>
                        )}
                        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition-colors text-sm font-bold">✕</button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {state === 'loading' && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Loading quiz...</p>
                        </div>
                    )}

                    {state === 'error' && (
                        <div className="p-12 text-center">
                            <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
                            <p className="text-red-600 font-bold text-lg mb-2">Oops!</p>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <button onClick={onClose} className="px-6 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors">Close</button>
                        </div>
                    )}

                    {state === 'intro' && quiz && (
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HelpCircle size={40} className="text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                            <p className="text-gray-500 mb-8">Test your understanding of this lesson</p>

                            <div className="flex justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{quiz.questions.length}</div>
                                    <div className="text-xs text-gray-400 font-medium">Questions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{quiz.timeLimitMinutes}</div>
                                    <div className="text-xs text-gray-400 font-medium">Minutes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{quiz.passingScore}%</div>
                                    <div className="text-xs text-gray-400 font-medium">To Pass</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 items-center">
                                <button onClick={startQuiz} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:scale-105">
                                    Start Quiz
                                </button>
                                <button onClick={loadHistory} className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                                    View Past Attempts
                                </button>
                            </div>
                        </div>
                    )}

                    {state === 'taking' && quiz && (
                        <div className="p-6">
                            {/* Progress bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full" style={{ width: `${((currentQ + 1) / totalQuestions) * 100}%` }} />
                                </div>
                                <span className="text-sm font-bold text-gray-500">{currentQ + 1}/{totalQuestions}</span>
                            </div>

                            {/* Question */}
                            <div className="mb-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">{currentQ + 1}</span>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 leading-relaxed">{quiz.questions[currentQ].content}</h4>
                                        <span className="text-xs text-gray-400 font-medium">{quiz.questions[currentQ].points} point{quiz.questions[currentQ].points !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {quiz.questions[currentQ].answers.map((answer, aIdx) => {
                                        const isSelected = selectedAnswers[quiz.questions[currentQ].id] === answer.id;
                                        return (
                                            <button
                                                key={answer.id}
                                                onClick={() => setSelectedAnswers(prev => ({ ...prev, [quiz.questions[currentQ].id]: answer.id }))}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group ${
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10'
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                                    isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 text-gray-400 group-hover:border-indigo-300'
                                                }`}>
                                                    {String.fromCharCode(65 + aIdx)}
                                                </span>
                                                <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>{answer.content}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Question dots */}
                            <div className="flex flex-wrap gap-2 mb-6 justify-center">
                                {quiz.questions.map((q, i) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQ(i)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            i === currentQ
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                                : selectedAnswers[q.id]
                                                    ? 'bg-indigo-100 text-indigo-600'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                                    disabled={currentQ === 0}
                                    className="flex items-center gap-1 px-4 py-2 text-gray-500 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>

                                {currentQ < totalQuestions - 1 ? (
                                    <button
                                        onClick={() => setCurrentQ(prev => Math.min(totalQuestions - 1, prev + 1))}
                                        className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all"
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all"
                                    >
                                        Submit Quiz ({answeredCount}/{totalQuestions})
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {state === 'submitting' && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Submitting your answers...</p>
                        </div>
                    )}

                    {state === 'result' && result && quiz && (
                        <div className="p-8 text-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
                                {result.isPassed ? (
                                    <Trophy size={48} className="text-green-500" />
                                ) : (
                                    <XCircle size={48} className="text-red-400" />
                                )}
                            </div>

                            <h3 className={`text-2xl font-bold mb-2 ${result.isPassed ? 'text-green-600' : 'text-red-500'}`}>
                                {result.isPassed ? '🎉 Congratulations!' : 'Keep Trying!'}
                            </h3>
                            <p className="text-gray-500 mb-6">{result.isPassed ? 'You passed the quiz!' : `You need ${quiz.passingScore}% to pass.`}</p>

                            <div className="flex justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold ${result.isPassed ? 'text-green-600' : 'text-red-500'}`}>{result.score}%</div>
                                    <div className="text-xs text-gray-400 font-medium">Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-700">{result.timeTakenMinutes}</div>
                                    <div className="text-xs text-gray-400 font-medium">Minutes</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 items-center">
                                <button onClick={() => loadReview(result.id)} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                    <Star size={18} /> Review Answers
                                </button>
                                {!result.isPassed && (
                                    <button onClick={startQuiz} className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2">
                                        <RotateCcw size={18} /> Retry Quiz
                                    </button>
                                )}
                                <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">Close</button>
                            </div>
                        </div>
                    )}

                    {state === 'review' && reviewResult && (
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <button onClick={() => setState(result ? 'result' : 'history')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronLeft size={20} className="text-gray-500" />
                                </button>
                                <h3 className="font-bold text-lg text-gray-800">Answer Review</h3>
                                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${reviewResult.isPassed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                    {reviewResult.score}%
                                </span>
                            </div>

                            <div className="space-y-5">
                                {reviewResult.questionResults?.map((qr, i) => (
                                    <div key={qr.id} className={`p-4 rounded-xl border-2 ${qr.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                                        <div className="flex items-start gap-3 mb-3">
                                            {qr.isCorrect ? <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" /> : <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />}
                                            <div>
                                                <span className="text-xs font-bold text-gray-400">Question {i + 1}</span>
                                                <p className="font-medium text-gray-800">{qr.content}</p>
                                            </div>
                                        </div>
                                        <div className="ml-8 space-y-2">
                                            {qr.answers.map(a => {
                                                const wasSelected = qr.selectedAnswerId === a.id;
                                                const isCorrect = a.isCorrect;
                                                let style = 'bg-white border-gray-200 text-gray-600';
                                                if (isCorrect) style = 'bg-green-100 border-green-300 text-green-700 font-medium';
                                                if (wasSelected && !isCorrect) style = 'bg-red-100 border-red-300 text-red-700 line-through';
                                                return (
                                                    <div key={a.id} className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${style}`}>
                                                        {isCorrect && <CheckCircle size={14} className="text-green-500" />}
                                                        {wasSelected && !isCorrect && <XCircle size={14} className="text-red-400" />}
                                                        {a.content}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {state === 'history' && (
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <button onClick={() => setState('intro')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronLeft size={20} className="text-gray-500" />
                                </button>
                                <h3 className="font-bold text-lg text-gray-800">Past Attempts</h3>
                            </div>

                            {submissions.length === 0 ? (
                                <p className="text-center text-gray-400 py-12">No attempts yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map((sub, i) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => loadReview(sub.id)}
                                            className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    #{submissions.length - i}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-800">{new Date(sub.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="text-xs text-gray-400">{sub.timeTakenMinutes} min</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${sub.isPassed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                    {sub.score}%
                                                </span>
                                                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}</style>
        </div>
    );
}
