import { useState, useEffect } from 'react';
import { assignmentsApi, uploadsApi } from '../api';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle, Star, Send, ExternalLink, PenTool } from 'lucide-react';

interface AssignmentDetail {
    id: string;
    lessonId: string;
    title: string;
    instructions: string;
    maxScore: number;
}

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

interface AssignmentPlayerProps {
    assignmentId: string;
    lessonTitle: string;
    onClose: () => void;
    onComplete?: () => void;
}

type ViewState = 'loading' | 'view' | 'submitting' | 'error';

export function AssignmentPlayer({ assignmentId, lessonTitle, onClose, onComplete }: AssignmentPlayerProps) {
    const [state, setState] = useState<ViewState>('loading');
    const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [error, setError] = useState('');

    // Submit form
    const [fileUrl, setFileUrl] = useState('');
    const [studentNotes, setStudentNotes] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            setState('loading');
            // Load assignment detail and existing submission in parallel
            const [asnRes, subRes] = await Promise.all([
                assignmentsApi.getById(assignmentId),
                assignmentsApi.getMySubmission(assignmentId).catch(() => null)
            ]);
            setAssignment(asnRes.data);
            if (subRes?.data) {
                setSubmission(subRes.data);
            }
            setState('view');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load assignment.');
            setState('error');
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const res = await uploadsApi.getPresignedUrl({
                fileName: file.name,
                contentType: file.type || 'application/octet-stream',
                folder: 'assignments-submissions'
            });
            const { uploadUrl } = res.data.data;
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type || 'application/octet-stream' }
            });
            const url = uploadUrl.split('?')[0];
            setFileUrl(url);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!fileUrl) {
            alert('Please upload a file or paste a link first.');
            return;
        }
        try {
            setIsSubmitting(true);
            const res = await assignmentsApi.submit(assignmentId, {
                fileUrl,
                studentNotes: studentNotes || null,
            });
            setSubmission(res.data);
            setFileUrl('');
            setStudentNotes('');
            if (onComplete) onComplete();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to submit.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'Graded': return 'bg-green-50 text-green-600 border-green-200';
            case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const gradePercent = submission?.grade != null && assignment?.maxScore
        ? Math.round((submission.grade / assignment.maxScore) * 100) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a130d]/65 backdrop-blur-md p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-[32px] border border-[#eadbcb] bg-[#fbf7f0] shadow-[0_30px_80px_rgba(29,18,10,0.35)]" style={{ animation: 'slideUp 0.3s ease-out' }}>
                {/* Header */}
                <div className="flex items-center justify-between shrink-0 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_34%),linear-gradient(135deg,#2a1a10,#8f3f10)] px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <PenTool size={24} />
                        <div>
                            <h2 className="font-bold text-lg leading-tight">{assignment?.title || 'Assignment'}</h2>
                            <p className="text-xs text-orange-100/80">{lessonTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition-colors text-sm font-bold">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {state === 'loading' && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Loading assignment...</p>
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

                    {state === 'view' && assignment && (
                        <div className="p-6 space-y-6">
                            {/* Assignment Info */}
                            <div className="rounded-[28px] border border-[#f2c8a8] bg-[linear-gradient(135deg,#fff8f1,#fdf1e6)] p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={18} className="text-orange-500" />
                                    <h3 className="font-bold text-gray-800">Instructions</h3>
                                    <span className="ml-auto text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Max: {assignment.maxScore} pts</span>
                                </div>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{assignment.instructions}</p>
                            </div>

                            {/* Existing submission */}
                            {submission && (
                                <div className={`border rounded-xl p-5 space-y-4 ${statusColor(submission.status)}`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold flex items-center gap-2">
                                            {submission.status === 'Graded' ? (
                                                <><Star size={18} className="text-green-500" /> Graded</>
                                            ) : (
                                                <><Clock size={18} className="text-yellow-500" /> Pending Review</>
                                            )}
                                        </h3>
                                        <span className="text-xs font-medium text-gray-400">
                                            {new Date(submission.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                                            <ExternalLink size={14} /> View Submitted File
                                        </a>
                                    </div>

                                    {submission.studentNotes && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Your Notes</p>
                                            <p className="text-sm text-gray-700 bg-white/80 rounded-lg p-3 border border-gray-200">{submission.studentNotes}</p>
                                        </div>
                                    )}

                                    {submission.status === 'Graded' && (
                                        <div className="bg-white rounded-xl p-4 border border-green-200 space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-3xl font-bold text-green-600">{submission.grade}<span className="text-lg text-gray-400">/{assignment.maxScore}</span></div>
                                                    <div className="text-xs text-gray-400 font-medium">Score</div>
                                                </div>
                                                {gradePercent != null && (
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>Grade</span>
                                                            <span className="font-bold">{gradePercent}%</span>
                                                        </div>
                                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all ${gradePercent >= 70 ? 'bg-green-500' : gradePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${gradePercent}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {submission.instructorFeedback && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Instructor Feedback</p>
                                                    <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3 border border-green-200 whitespace-pre-wrap">{submission.instructorFeedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit new form */}
                            <div className="rounded-[28px] border-2 border-dashed border-[#d9c8ba] bg-white/85 p-5 space-y-4 shadow-sm">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Send size={18} className="text-orange-500" />
                                    {submission ? 'Resubmit Assignment' : 'Submit Your Work'}
                                </h3>

                                {/* File upload */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Upload File</label>
                                    <div className="flex items-center gap-3">
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isUploading ? 'border-orange-300 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/30'}`}>
                                            {isUploading ? (
                                                <><div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" /> Uploading...</>
                                            ) : (
                                                <><Upload size={18} className="text-gray-400" /> <span className="text-sm text-gray-500">Choose file to upload</span></>
                                            )}
                                            <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} disabled={isUploading} />
                                        </label>
                                    </div>
                                    {fileUrl && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> File uploaded successfully</p>}
                                </div>

                                {/* Or paste URL */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Or Paste Link</label>
                                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" placeholder="https://drive.google.com/..." value={fileUrl} onChange={e => setFileUrl(e.target.value)} />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Notes (optional)</label>
                                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400" rows={2} placeholder="Any notes for your instructor..." value={studentNotes} onChange={e => setStudentNotes(e.target.value)} />
                                </div>

                                <button onClick={handleSubmit} disabled={isSubmitting || isUploading || !fileUrl} className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                                    ) : (
                                        <><Send size={18} /> {submission ? 'Resubmit' : 'Submit Assignment'}</>
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
