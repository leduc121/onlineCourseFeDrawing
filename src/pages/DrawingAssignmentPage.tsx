import React, { useEffect, useState } from 'react';
import { BrushCleaning, FileImage, Sparkles, CheckCircle2, AlertTriangle, Clock3 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import DrawingCanvas from '../components/DrawingCanvas';
import { drawingsApi } from '../api';

interface DrawingSubmission {
  id: string;
  assignmentSubmissionId: string;
  drawingUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export function DrawingAssignmentPage() {
  const { assignmentSubmissionId } = useParams<{ assignmentSubmissionId: string }>();
  const [submission, setSubmission] = useState<DrawingSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentSubmissionId) {
      loadDrawing();
    }
  }, [assignmentSubmissionId]);

  const loadDrawing = async () => {
    if (!assignmentSubmissionId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await drawingsApi.get(assignmentSubmissionId);
      if (response.data) {
        setSubmission(response.data);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Failed to load drawing:', err);
        setError('Failed to load the saved drawing for this assignment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDrawing = async (imageData: string) => {
    if (!assignmentSubmissionId) {
      setError('Assignment submission id is missing.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await drawingsApi.save({
        assignmentSubmissionId,
        drawingBase64: imageData
      });

      if (response.data) {
        setSubmission(response.data);
        setSuccessMessage('Drawing saved successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to save drawing:', err);
      setError(err.response?.data?.message || 'Failed to save drawing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#f7f1e8] px-4 py-24">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#d4c3b4] border-t-[#7c3f2c]" />
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-[#8f7f72]">Loading drawing studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,rgba(243,228,211,0.9),transparent_32%),linear-gradient(180deg,#f8f3ec_0%,#f2eadf_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[36px] border border-[#eadccc] bg-white/70 px-6 py-7 shadow-[0_24px_60px_rgba(32,18,10,0.08)] backdrop-blur-sm md:px-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#eadccc] bg-[#fffaf4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">
                <Sparkles size={12} strokeWidth={1.8} />
                Taste-led workspace
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#201a17] md:text-6xl md:leading-[0.95]">
                    Drawing canvas for polished assignment work.
                  </h1>
                  <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-[#6d6157]">
                    This workspace is built for sketching, refining shapes, and saving a clean draft without breaking the course flow.
                  </p>
                </div>
                <div className="rounded-[28px] border border-[#eadccc] bg-[linear-gradient(180deg,#fffdf8_0%,#f4ede4_100%)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Studio notes</p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#5f544b]">
                    <p>Use the pen for freehand lines, switch to shapes for cleaner construction, and erase only after the structure feels solid.</p>
                    <p>Save a draft before moving to color layering so you keep one clean version for backup.</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-[24px] border border-[#efc6be] bg-[#fff6f3] px-5 py-4 text-[#9a4d38] shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} strokeWidth={1.8} className="mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-[24px] border border-[#d7e6d8] bg-[#f4fbf4] px-5 py-4 text-[#40634a] shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} strokeWidth={1.8} className="mt-0.5" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            <DrawingCanvas
              onSave={handleSaveDrawing}
              isLoading={isSaving}
              initialImage={submission?.drawingUrl}
              submissionId={assignmentSubmissionId}
            />
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-[#eadccc] bg-white/75 p-6 shadow-[0_20px_50px_rgba(32,18,10,0.08)] backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Status</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[24px] border border-[#eadccc] bg-[#fffaf4] p-4">
                  <div className="flex items-center gap-3">
                    <FileImage size={18} strokeWidth={1.8} className="text-[#7c3f2c]" />
                    <div>
                      <p className="text-sm font-semibold text-[#251b16]">Current draft</p>
                      <p className="text-sm text-[#6d6157]">
                        {submission ? 'A saved drawing is loaded into the canvas.' : 'No saved drawing yet for this submission.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#eadccc] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 size={18} strokeWidth={1.8} className="text-[#7c3f2c]" />
                    <div>
                      <p className="text-sm font-semibold text-[#251b16]">Last update</p>
                      <p className="text-sm text-[#6d6157]">
                        {submission?.updatedAt || submission?.createdAt
                          ? new Date(submission.updatedAt || submission.createdAt).toLocaleString('vi-VN')
                          : 'No saves yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#eadccc] bg-[linear-gradient(180deg,#fffdf8_0%,#f4ede4_100%)] p-6 shadow-[0_20px_50px_rgba(32,18,10,0.08)]">
              <div className="flex items-center gap-3">
                <BrushCleaning size={18} strokeWidth={1.8} className="text-[#7c3f2c]" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7f6f61]">Workflow</p>
              </div>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#5f544b]">
                <div className="rounded-[20px] border border-[#eadccc] bg-white px-4 py-3">
                  Block the main silhouette first before polishing details.
                </div>
                <div className="rounded-[20px] border border-[#eadccc] bg-white px-4 py-3">
                  Use shape tools for composition, then switch back to pen for expressive edges.
                </div>
                <div className="rounded-[20px] border border-[#eadccc] bg-white px-4 py-3">
                  Save a draft, then download a copy if you want to archive milestones locally.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default DrawingAssignmentPage;
