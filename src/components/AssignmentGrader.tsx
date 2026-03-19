import { useState, useEffect } from 'react';
import { assignmentsApi } from '../api';
import { FileText, CheckCircle, Clock, AlertTriangle, ChevronLeft, Star, ExternalLink, User } from 'lucide-react';

interface Submission {
    id: string;
    assignmentId: string;
    studentProfileId: string;
    fileUrl: string;
    studentNotes: string | null;
    grade: number | null;
    instructorFeedback: string | null;
    status: string; // "Pending" | "Graded"
    createdAt: string;
    updatedAt: string | null;
}

interface AssignmentGraderProps {
    assignmentId: string;
    assignmentTitle: string;
    maxScore: number;
    onClose: () => void;
}

type View = 'list' | 'grade';

export function AssignmentGrader({ assignmentId, assignmentTitle, maxScore, onClose }: AssignmentGraderProps) {
    const [view, setView] = useState<View>('list');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Grading
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<number>(0);
    const [feedback, setFeedback] = useState('');
    const [isGrading, setIsGrading] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, [assignmentId]);

    const loadSubmissions = async () => {
        try {
            setIsLoading(true);
            const res = await assignmentsApi.getSubmissions(assignmentId);
            setSubmissions(res.data || []);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load submissions.');
        } finally {
            setIsLoading(false);
        }
    };

    const openGrade = (sub: Submission) => {
        setSelectedSub(sub);
        setGrade(sub.grade ?? 0);
        setFeedback(sub.instructorFeedback ?? '');
        setView('grade');
    };

    const handleGrade = async () => {
        if (!selectedSub) return;
        try {
            setIsGrading(true);
            await assignmentsApi.grade(selectedSub.id, {
                grade: Number(grade),
                instructorFeedback: feedback || null,
            });
            await loadSubmissions();
            setView('list');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to grade.');
        } finally {
            setIsGrading(false);
        }
    };

    const pendingCount = submissions.filter(s => s.status === 'Pending').length;
    const gradedCount = submissions.filter(s => s.status === 'Graded').length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" style={{ animation: 'slideUp 0.3s ease-out' }}>
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <FileText size={24} />
                        <div>
                            <h2 className="font-bold text-lg leading-tight">{assignmentTitle}</h2>
                            <p className="text-xs text-orange-200">Assignment Submissions • Max Score: {maxScore}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {pendingCount > 0 && (
                            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{pendingCount} pending</span>
                        )}
                        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition-colors text-sm font-bold">✕</button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Loading submissions...</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="p-12 text-center">
                            <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
                            <p className="text-gray-500 mb-6">{error}</p>
                            <button onClick={onClose} className="px-6 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors">Close</button>
                        </div>
                    )}

                    {/* List view */}
                    {!isLoading && !error && view === 'list' && (
                        <div className="p-6">
                            {/* Stats */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                                    <p className="text-2xl font-bold text-gray-800">{submissions.length}</p>
                                    <p className="text-xs font-medium text-gray-400">Total</p>
                                </div>
                                <div className="flex-1 bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
                                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                                    <p className="text-xs font-medium text-yellow-500">Pending</p>
                                </div>
                                <div className="flex-1 bg-green-50 rounded-xl p-4 text-center border border-green-200">
                                    <p className="text-2xl font-bold text-green-600">{gradedCount}</p>
                                    <p className="text-xs font-medium text-green-500">Graded</p>
                                </div>
                            </div>

                            {submissions.length === 0 ? (
                                <p className="text-center text-gray-400 py-12">No submissions yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map((sub) => (
                                        <div key={sub.id} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all hover:shadow-sm ${sub.status === 'Pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-green-200 bg-green-50/30'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 text-sm">Student {sub.studentProfileId.substring(0, 8)}...</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(sub.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {sub.status === 'Graded' ? (
                                                    <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                        {sub.grade}/{maxScore}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                                        <Clock size={12} /> Pending
                                                    </span>
                                                )}
                                                <button onClick={() => openGrade(sub)} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs font-bold rounded-lg hover:shadow-md transition-all">
                                                    {sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grade view */}
                    {view === 'grade' && selectedSub && (
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setView('list')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronLeft size={20} className="text-gray-500" />
                                </button>
                                <h3 className="font-bold text-lg text-gray-800">Grade Submission</h3>
                            </div>

                            {/* Student's submission */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        Student {selectedSub.studentProfileId.substring(0, 8)}...
                                    </p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(selectedSub.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <a href={selectedSub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                                    <ExternalLink size={14} /> View Submitted File
                                </a>

                                {selectedSub.studentNotes && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Student Notes</p>
                                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">{selectedSub.studentNotes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Grading form */}
                            <div className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50/30 space-y-4">
                                <h4 className="font-bold text-orange-700 flex items-center gap-2">
                                    <Star size={18} /> Grading
                                </h4>

                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Score</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min={0} max={maxScore} className="w-24 border border-orange-200 rounded-lg px-3 py-2 text-lg font-bold text-center focus:outline-none focus:border-orange-400 bg-white" value={grade} onChange={e => setGrade(Number(e.target.value))} />
                                            <span className="text-gray-400 font-bold">/ {maxScore}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${(grade / maxScore * 100) >= 70 ? 'bg-green-500' : (grade / maxScore * 100) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (grade / maxScore) * 100)}%` }} />
                                        </div>
                                        <p className="text-xs text-gray-400 text-right mt-1">{Math.round((grade / maxScore) * 100)}%</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Feedback (optional)</label>
                                    <textarea className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white" rows={3} placeholder="Write feedback for the student..." value={feedback} onChange={e => setFeedback(e.target.value)} />
                                </div>

                                <button onClick={handleGrade} disabled={isGrading} className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isGrading ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                    ) : (
                                        <><CheckCircle size={18} /> Save Grade</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}
