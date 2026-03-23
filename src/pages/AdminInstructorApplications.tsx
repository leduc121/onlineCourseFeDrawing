import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, FileText, Loader2, Search, User, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { instructorApplicationsApi } from '../api';

type InstructorApplication = {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  bio?: string | null;
  expertise?: string | null;
  avatarUrl?: string | null;
  certificateUrls: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewNotes?: string | null;
  createdAt: string;
};

export function AdminInstructorApplications() {
  const [applications, setApplications] = useState<InstructorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<InstructorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const response = await instructorApplicationsApi.getPending();
      const items = response.data?.data || [];
      setApplications(items);
      setSelectedApplication((current) => {
        if (current) {
          return items.find((item: InstructorApplication) => item.id === current.id) || items[0] || null;
        }
        return items[0] || null;
      });
    } catch (error) {
      console.error('Failed to load instructor applications:', error);
      toast.error('Failed to load instructor applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (approved: boolean) => {
    if (!selectedApplication) {
      return;
    }

    if (!approved && !reviewNotes.trim()) {
      toast.error('Enter review notes before rejecting.');
      return;
    }

    try {
      setIsSubmitting(true);
      await instructorApplicationsApi.review(selectedApplication.id, {
        approved,
        reviewNotes: reviewNotes.trim() || undefined
      });
      toast.success(approved ? 'Instructor approved.' : 'Instructor application rejected.');
      setReviewNotes('');
      setIsRejecting(false);
      await fetchPendingApplications();
    } catch (error) {
      console.error('Failed to review instructor application:', error);
      toast.error('Failed to review instructor application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApplications = applications.filter((application) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return true;
    }

    return (
      application.fullName.toLowerCase().includes(keyword) ||
      application.email.toLowerCase().includes(keyword) ||
      (application.expertise || '').toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Instructor Applications</h1>
          <p className="text-stone-500">Review pending instructor requests and supporting documents.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email, expertise..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {filteredApplications.length > 0 ? filteredApplications.map((application) => (
            <div
              key={application.id}
              onClick={() => {
                setSelectedApplication(application);
                setIsRejecting(false);
                setReviewNotes('');
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedApplication?.id === application.id ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-200'}`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-bold text-stone-900 line-clamp-1">{application.fullName}</h3>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  {application.status}
                </span>
              </div>
              <p className="text-sm text-stone-600 line-clamp-1">{application.email}</p>
              <p className="text-xs text-stone-500 mt-2 line-clamp-2">{application.expertise || 'No expertise provided yet.'}</p>
            </div>
          )) : (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">No pending instructor applications.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedApplication ? (
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden sticky top-8">
              <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedApplication.avatarUrl ? (
                    <img
                      src={selectedApplication.avatarUrl}
                      alt={selectedApplication.fullName}
                      className="w-16 h-16 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                      <User className="w-7 h-7 text-stone-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">{selectedApplication.fullName}</h2>
                    <p className="text-sm text-stone-500">{selectedApplication.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setIsRejecting(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {isRejecting && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                    <div className="flex gap-3 text-rose-700 text-sm mb-4">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>Add review notes so the applicant knows what to improve.</p>
                    </div>
                    <textarea
                      rows={4}
                      className="w-full p-4 rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                      placeholder="Enter rejection reason..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleReview(false)}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-all disabled:opacity-50"
                      >
                        Confirm rejection
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRejecting(false);
                          setReviewNotes('');
                        }}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-stone-100 text-stone-600 rounded-lg font-semibold hover:bg-stone-200 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-3">Bio</h3>
                  <p className="text-stone-600 leading-7">{selectedApplication.bio || 'No professional bio provided.'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-3">Expertise</h3>
                  <p className="text-stone-600 leading-7">{selectedApplication.expertise || 'No expertise provided.'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-stone-500" />
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Supporting Documents</h3>
                  </div>
                  {selectedApplication.certificateUrls?.length ? (
                    <div className="space-y-3">
                      {selectedApplication.certificateUrls.map((url, index) => (
                        <div key={url} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900">Document {index + 1}</p>
                            <p className="text-xs text-stone-500 truncate">{url}</p>
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900 shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500">No documents uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200 text-stone-400">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>Select an application on the left to review details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
