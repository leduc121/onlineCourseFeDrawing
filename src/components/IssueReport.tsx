import React, { useState } from 'react';

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

interface CreateIssueFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  courseId?: string;
  lessonId?: string;
}

export const IssueReportForm: React.FC<CreateIssueFormProps> = ({
  onSubmit,
  isLoading = false,
  courseId,
  lessonId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      courseId,
      lessonId
    });
    setFormData({ title: '', content: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">Report an Issue</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Issue Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="What's the problem?"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Provide detailed information about the issue"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Submitting...' : 'Report Issue'}
      </button>
    </form>
  );
};

export const IssueList: React.FC<{ issues: IssueReport[] }> = ({ issues }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Issue Reports</h2>
      {issues.length === 0 ? (
        <p className="text-gray-500">No issues reported</p>
      ) : (
        <div className="space-y-2">
          {issues.map(issue => (
            <div key={issue.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{issue.content}</p>
                  {issue.resolution && (
                    <div className="mt-2 bg-green-50 p-2 rounded text-sm">
                      <p className="font-semibold text-green-900">Resolution:</p>
                      <p className="text-green-800">{issue.resolution}</p>
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  issue.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                  issue.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {issue.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
