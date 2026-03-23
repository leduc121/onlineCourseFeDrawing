import { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, FilePlus2, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { instructorApplicationsApi, uploadsApi } from '../api';

type InstructorApplication = {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewNotes?: string | null;
  bio?: string | null;
  expertise?: string | null;
  avatarUrl?: string | null;
  certificateUrls?: string[];
  createdAt?: string;
  reviewedAt?: string | null;
};

type UploadingFile = {
  name: string;
  status: 'uploading' | 'done' | 'error';
};

export function InstructorApplicationPage() {
  const [application, setApplication] = useState<InstructorApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCertificates, setIsUploadingCertificates] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    avatarUrl: '',
    certificateUrls: [] as string[]
  });

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setIsLoading(true);
        const response = await instructorApplicationsApi.getMy();
        const items = response.data?.data || [];
        const latest = items[0] || null;
        setApplication(latest);

        if (latest && latest.status === 'Rejected') {
          setFormData({
            bio: latest.bio || '',
            expertise: latest.expertise || '',
            avatarUrl: latest.avatarUrl || '',
            certificateUrls: latest.certificateUrls || []
          });
        }
      } catch (error) {
        console.error('Failed to load instructor application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, []);

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const response = await uploadsApi.getPresignedUrl({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      folder
    });

    const uploadUrl = response.data?.data?.uploadUrl;
    if (!uploadUrl) {
      throw new Error('Presigned URL not returned.');
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status ${uploadResponse.status}`);
    }

    return uploadUrl.split('?')[0];
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const avatarUrl = await uploadFile(file, 'instructor-avatars');
      setFormData((current) => ({
        ...current,
        avatarUrl
      }));
      toast.success('Avatar uploaded successfully.');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const existingCount = formData.certificateUrls.length;
    if (existingCount + files.length > 10) {
      toast.error('You can upload up to 10 certificate files.');
      return;
    }

    setIsUploadingCertificates(true);
    setUploadingFiles((current) => [
      ...current,
      ...files.map((file) => ({ name: file.name, status: 'uploading' as const }))
    ]);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        try {
          const fileUrl = await uploadFile(file, 'instructor-certificates');
          uploadedUrls.push(fileUrl);
          setUploadingFiles((current) =>
            current.map((item) =>
              item.name === file.name && item.status === 'uploading'
                ? { ...item, status: 'done' }
                : item
            )
          );
        } catch (error) {
          console.error('Failed to upload certificate:', error);
          setUploadingFiles((current) =>
            current.map((item) =>
              item.name === file.name && item.status === 'uploading'
                ? { ...item, status: 'error' }
                : item
            )
          );
          toast.error(`Failed to upload ${file.name}.`);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((current) => ({
          ...current,
          certificateUrls: [...current.certificateUrls, ...uploadedUrls]
        }));
        toast.success(`Uploaded ${uploadedUrls.length} certificate file(s).`);
      }
    } finally {
      setIsUploadingCertificates(false);
    }
  };

  const handleRemoveCertificate = (urlToRemove: string) => {
    setFormData((current) => ({
      ...current,
      certificateUrls: current.certificateUrls.filter((url) => url !== urlToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.certificateUrls.length === 0) {
      toast.error('Upload at least one certificate or supporting document.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        bio: formData.bio || null,
        expertise: formData.expertise || null,
        avatarUrl: formData.avatarUrl || null,
        certificateUrls: formData.certificateUrls
      };

      const response = await instructorApplicationsApi.submit(payload);
      setApplication(response.data?.data);
      toast.success('Instructor application submitted. Please wait for admin review.');
    } catch (error: any) {
      console.error('Failed to submit instructor application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit instructor application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">Loading application...</div>;
  }

  const canSubmit = !application || application.status === 'Rejected';

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-[#2d2d2d]/10 shadow-sm p-8">
          <h1 className="text-3xl font-serif font-bold text-[#2d2d2d] mb-2">Apply as Instructor</h1>
          <p className="text-gray-600 mb-8">
            Submit your teaching profile and supporting documents. Admin review happens in the dashboard, while n8n handles notifications.
          </p>

          {application && (
            <div className="mb-8 p-4 border border-gray-200 bg-gray-50">
              <p className="text-sm font-bold text-[#2d2d2d]">Latest Status: {application.status}</p>
              {application.reviewNotes && (
                <p className="text-sm text-gray-600 mt-2">Review notes: {application.reviewNotes}</p>
              )}
              {application.status === 'Approved' && (
                <p className="text-sm text-green-700 mt-2">Your application was approved. Log in again to refresh your role.</p>
              )}
              {application.status === 'Pending' && (
                <p className="text-sm text-blue-700 mt-2">Your application is waiting for admin review.</p>
              )}
            </div>
          )}

          {canSubmit ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="border border-dashed border-gray-300 rounded-lg p-5 bg-[#faf8f5]">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#2d2d2d]">Profile avatar</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload one image for the instructor profile avatar.
                    </p>
                  </div>
                  <label className="inline-flex">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar || isSubmitting}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] text-white rounded-md cursor-pointer hover:bg-[#444] transition-colors">
                      {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      Upload avatar
                    </span>
                  </label>
                </div>

                {formData.avatarUrl ? (
                  <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={formData.avatarUrl}
                        alt="Instructor avatar"
                        className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#2d2d2d]">Avatar uploaded</p>
                        <p className="text-xs text-gray-500 truncate">{formData.avatarUrl}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((current) => ({ ...current, avatarUrl: '' }))}
                      className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No avatar uploaded yet.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-2">Professional Bio</label>
                <textarea
                  className="w-full min-h-32 rounded-md border border-gray-300 px-3 py-2"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your teaching background..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-2">Expertise</label>
                <textarea
                  className="w-full min-h-24 rounded-md border border-gray-300 px-3 py-2"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="Watercolor, illustration, sketching..."
                />
              </div>

              <div className="border border-dashed border-gray-300 rounded-lg p-5 bg-[#faf8f5]">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#2d2d2d] flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Certificates and supporting documents
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload PDF, image, or document files. Maximum 10 files.
                    </p>
                  </div>
                  <label className="inline-flex">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                      onChange={handleCertificateUpload}
                      disabled={isUploadingCertificates || isUploadingAvatar || isSubmitting}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] text-white rounded-md cursor-pointer hover:bg-[#444] transition-colors">
                      {isUploadingCertificates ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      Upload files
                    </span>
                  </label>
                </div>

                {uploadingFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {uploadingFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center gap-2 text-sm text-gray-600">
                        {file.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {file.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {file.status === 'error' && <FilePlus2 className="w-4 h-4 text-rose-600" />}
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {formData.certificateUrls.length > 0 ? (
                  <div className="space-y-3">
                    {formData.certificateUrls.map((url, index) => (
                      <div key={url} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#2d2d2d]">Document {index + 1}</p>
                          <p className="text-xs text-gray-500 truncate">{url}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertificate(url)}
                            className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No files uploaded yet.</p>
                )}
              </div>

              <Button type="submit" isLoading={isSubmitting} disabled={isUploadingCertificates || isUploadingAvatar}>
                Submit Application
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
