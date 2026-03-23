import { useEffect, useMemo, useState } from 'react';
import { issuesApi } from '../api';

type IssueStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';

interface IssueReport {
  id: string;
  title: string;
  content: string;
  status: IssueStatus;
  resolution?: string;
  createdAt: string;
  updatedAt?: string;
  courseId?: string | null;
  lessonId?: string | null;
  studentId?: string;
}

const STATUS_OPTIONS: IssueStatus[] = ['Open', 'InProgress', 'Resolved', 'Closed'];

const statusPillClasses: Record<IssueStatus, string> = {
  Open: 'bg-amber-100 text-amber-800',
  InProgress: 'bg-sky-100 text-sky-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
  Closed: 'bg-slate-200 text-slate-700'
};

export default function AdminIssueManagement() {
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [resolutionDraft, setResolutionDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<IssueStatus>('Open');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) || null,
    [issues, selectedIssueId]
  );

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    if (!selectedIssue) {
      setResolutionDraft('');
      setStatusDraft('Open');
      return;
    }

    setResolutionDraft(selectedIssue.resolution || '');
    setStatusDraft(selectedIssue.status);
  }, [selectedIssue]);

  const loadIssues = async () => {
    try {
      setIsLoading(true);
      const response = await issuesApi.getOpen();
      const nextIssues = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setIssues(nextIssues);

      if (!selectedIssueId && nextIssues.length > 0) {
        setSelectedIssueId(nextIssues[0].id);
      }
      if (selectedIssueId && !nextIssues.some((issue: IssueReport) => issue.id === selectedIssueId)) {
        setSelectedIssueId(nextIssues[0]?.id || '');
      }
    } catch (error) {
      console.error('Failed to fetch open issues', error);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedIssue) return;

    try {
      setIsSaving(true);
      await issuesApi.updateStatus(selectedIssue.id, {
        status: statusDraft,
        resolution: resolutionDraft.trim() || null
      });
      await loadIssues();
    } catch (error) {
      console.error('Failed to update issue status', error);
      alert('Failed to update issue.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.5fr]">
      <section className="rounded-[28px] border border-[#e5ddd2] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a7e63]">System Queue</p>
            <h2 className="mt-2 text-2xl font-bold text-[#1f2937]">Open platform issues</h2>
          </div>
          <button
            onClick={loadIssues}
            className="rounded-full border border-[#d8ccbf] px-4 py-2 text-sm font-semibold text-[#5f4c3f] transition hover:bg-[#f8f2ec]"
          >
            Refresh
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#6b7280]">
          This queue is for platform-level reports. Course-specific issues should still be reviewed by the instructor on the linked course.
        </p>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-[#e5ddd2] bg-[#fcfaf7] p-6 text-sm text-[#7b6a5e]">
              Loading issues...
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#e5ddd2] bg-[#fcfaf7] p-6 text-sm text-[#7b6a5e]">
              No open platform issues right now.
            </div>
          ) : (
            issues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                  selectedIssueId === issue.id
                    ? 'border-[#8c6c54] bg-[#f8f2ec] shadow-sm'
                    : 'border-[#eadfd3] bg-white hover:border-[#ccb9a5]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#1f2937]">{issue.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#9a7e63]">
                      {issue.courseId ? 'Course issue' : 'System issue'}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusPillClasses[issue.status]}`}>
                    {issue.status}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#6b7280]">{issue.content}</p>
                <p className="mt-3 text-xs text-[#8b7a6d]">{new Date(issue.createdAt).toLocaleString('vi-VN')}</p>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e5ddd2] bg-white p-6 shadow-sm">
        {!selectedIssue ? (
          <div className="flex min-h-[480px] items-center justify-center rounded-[24px] border border-dashed border-[#e5ddd2] bg-[#fcfaf7] p-8 text-center text-sm leading-7 text-[#7b6a5e]">
            Select an issue from the queue to review status and write a resolution note.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a7e63]">Issue Detail</p>
                <h2 className="mt-2 text-3xl font-bold text-[#1f2937]">{selectedIssue.title}</h2>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusPillClasses[selectedIssue.status]}`}>
                {selectedIssue.status}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] bg-[#f8f2ec] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9a7e63]">Reported</p>
                <p className="mt-2 text-sm font-medium text-[#2d2d2d]">{new Date(selectedIssue.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="rounded-[20px] bg-[#f8f2ec] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9a7e63]">Scope</p>
                <p className="mt-2 text-sm font-medium text-[#2d2d2d]">{selectedIssue.courseId ? 'Course-linked report' : 'General platform report'}</p>
              </div>
              <div className="rounded-[20px] bg-[#f8f2ec] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9a7e63]">Student</p>
                <p className="mt-2 text-sm font-medium text-[#2d2d2d] break-all">{selectedIssue.studentId || 'Unknown'}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#eadfd3] bg-[#fffdfa] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7e63]">Report content</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4b5563]">{selectedIssue.content}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <label className="space-y-2">
                <span className="block text-sm font-semibold text-[#5f4c3f]">Status</span>
                <select
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value as IssueStatus)}
                  className="w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-sm font-semibold text-[#5f4c3f]">Resolution note</span>
                <textarea
                  value={resolutionDraft}
                  onChange={(event) => setResolutionDraft(event.target.value)}
                  rows={5}
                  placeholder="Write the admin response or the fix applied for this report."
                  className="w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#efe5da] pt-5">
              <p className="text-sm text-[#7b6a5e]">
                Saving as <span className="font-semibold text-[#5f4c3f]">{statusDraft}</span>
              </p>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full bg-[#1f2937] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
              >
                {isSaving ? 'Saving...' : 'Update issue'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
