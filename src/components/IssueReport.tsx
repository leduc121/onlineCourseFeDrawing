import React, { useEffect, useState } from 'react';

interface IssueReport {
  id: string;
  title: string;
  content: string;
  status: string;
  resolution?: string;
  createdAt: string;
  courseId?: string;
  lessonId?: string;
}

interface CourseOption {
  id: string;
  title: string;
}

interface CreateIssueFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  courseId?: string;
  lessonId?: string;
  courses?: CourseOption[];
}

export const IssueReportForm: React.FC<CreateIssueFormProps> = ({
  onSubmit,
  isLoading = false,
  courseId,
  lessonId,
  courses = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: courseId || ''
  });

  useEffect(() => {
    if (!formData.courseId && courseId) {
      setFormData((prev) => ({ ...prev, courseId }));
    }
  }, [courseId, formData.courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: formData.title,
      content: formData.content,
      courseId: formData.courseId || courseId || undefined,
      lessonId
    });
    setFormData((prev) => ({
      ...prev,
      title: '',
      content: ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {courses.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[#5f4c3f]">Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
          >
            <option value="">General platform issue</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#5f4c3f]">Issue title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Example: Video freezes at minute 02:10"
          className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5f4c3f]">Description</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe what happened, where it happened, and what you expected instead."
          className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-[#8c6c54] py-3 text-sm font-semibold text-white transition hover:bg-[#755845] disabled:cursor-not-allowed disabled:bg-[#c7b5a5]"
      >
        {isLoading ? 'Submitting...' : 'Report Issue'}
      </button>
    </form>
  );
};

export const IssueList: React.FC<{ issues: IssueReport[] }> = ({ issues }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#2d2d2d]">Issue reports</h2>
      {issues.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#e6d8c9] bg-white p-6 text-sm text-[#7b6a5e]">
          No issues reported yet.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="rounded-[24px] border border-[#eadfd3] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#1f2937]">{issue.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">{issue.content}</p>
                  {issue.resolution && (
                    <div className="mt-3 rounded-2xl bg-[#eef6ef] px-4 py-3 text-sm text-[#25603d]">
                      <p className="font-semibold">Resolution</p>
                      <p className="mt-1">{issue.resolution}</p>
                    </div>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    issue.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : issue.status === 'InProgress'
                        ? 'bg-blue-100 text-blue-800'
                        : issue.status === 'Open'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {issue.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-[#8b7a6d]">{new Date(issue.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
