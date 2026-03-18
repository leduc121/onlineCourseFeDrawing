import React, { useEffect, useState } from 'react';
import { postsApi, uploadsApi } from '../api';
import { Loader2, Plus, Edit2, Trash2, Send, Save, X, ImageIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const ManagePost: React.FC = () => {
    const { } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', content: '', thumbnailUrl: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMyPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchMyPosts = async () => {
        try {
            const response = await postsApi.getMyPosts();
            setPosts(response.data.items);
        } catch (error) {
            toast.error('Không thể tải bài viết của bạn.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (post: any) => {
        setSelectedPost(post);
        setFormData({ title: post.title, content: post.content, thumbnailUrl: post.thumbnailUrl || '' });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setSelectedPost(null);
        setFormData({ title: '', content: '', thumbnailUrl: '' });
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedPost) {
                await postsApi.update(selectedPost.id, formData);
                toast.success('Cập nhật bài viết thành công!');
            } else {
                await postsApi.create(formData);
                toast.success('Tạo bài viết mới thành công!');
            }
            setIsEditing(false);
            fetchMyPosts();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu bài viết.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        try {
            await postsApi.delete(id);
            toast.success('Xóa bài viết thành công!');
            fetchMyPosts();
        } catch (error) {
            toast.error('Không thể xóa bài viết.');
        }
    };

    const handleSubmitForReview = async (id: string) => {
        try {
            await postsApi.submitForReview(id);
            toast.success('Đã gửi bài viết cho Admin duyệt.');
            fetchMyPosts();
        } catch (error) {
            toast.error('Lỗi khi gửi duyệt bài viết.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            toast.loading('Đang tải ảnh lên...', { id: 'upload' });
            const { data } = await uploadsApi.getPresignedUrl({
                fileName: file.name,
                contentType: file.type,
                folder: 'posts'
            });

            const uploadUrl = data.data.uploadUrl;
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            const s3Url = uploadUrl.split('?')[0];
            setFormData(prev => ({ ...prev, thumbnailUrl: s3Url }));
            toast.success('Tải ảnh thành công!', { id: 'upload' });
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên.', { id: 'upload' });
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    const StatusBadge = ({ status, reason }: { status: string, reason?: string }) => {
        switch (status) {
            case 'Draft': return <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> Bản nháp</span>;
            case 'PendingReview': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold"><Send className="w-3.5 h-3.5" /> Chờ duyệt</span>;
            case 'Published': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Đã đăng</span>;
            case 'Rejected': return (
                <div className="group relative">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold cursor-help">
                        <AlertCircle className="w-3.5 h-3.5" /> Bị từ chối
                    </span>
                    {reason && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-rose-200 rounded-lg shadow-xl text-xs text-rose-600 w-64 z-10 invisible group-hover:visible transition-all">
                            <strong>Lý do:</strong> {reason}
                        </div>
                    )}
                </div>
            );
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Quản lý bài viết</h1>
                    <p className="text-stone-500">Tạo và quản lý các bài chia sẻ của bạn.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-all font-semibold"
                >
                    <Plus className="w-5 h-5" /> Viết bài mới
                </button>
            </div>

            {isEditing ? (
                <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-50">
                        <h2 className="text-2xl font-bold text-stone-900">{selectedPost ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h2>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-stone-50 rounded-full"><X className="w-6 h-6 text-stone-400" /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Tiêu đề</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                        placeholder="VD: Bí quyết học vẽ cho người mới bắt đầu..."
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Nội dung (HTML hoặc văn bản)</label>
                                    <textarea 
                                        required
                                        rows={12}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono"
                                        placeholder="Nội dung bài viết của bạn..."
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Ảnh bìa</label>
                                    <div className="relative aspect-video bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden group">
                                        {formData.thumbnailUrl ? (
                                            <>
                                                <img src={formData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer bg-white text-stone-900 px-4 py-2 rounded-lg font-semibold text-sm">Thay đổi</label>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-10 h-10 text-stone-300 mb-2" />
                                                <span className="text-sm text-stone-400">Tải ảnh lên</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <p className="mt-2 text-xs text-stone-400">Định dạng khuyên dùng: 16:9, tối đa 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-stone-50">
                            <button 
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-all disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                                Lưu lại
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {posts.length > 0 ? posts.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-6 group">
                            <div className="w-32 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                                {post.thumbnailUrl && <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-stone-900 text-lg group-hover:text-amber-600 transition-colors">{post.title}</h3>
                                    <StatusBadge status={post.status} reason={post.rejectionReason} />
                                </div>
                                <p className="text-stone-500 text-sm italic">Ngày tạo: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {(post.status === 'Draft' || post.status === 'Rejected') && (
                                    <button 
                                        onClick={() => handleSubmitForReview(post.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-all"
                                        title="Gửi Admin duyệt"
                                    >
                                        <Send className="w-4 h-4" /> Gửi duyệt
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleEdit(post)}
                                    className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                    title="Chỉnh sửa"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    title="Xóa"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                            <p className="text-stone-500">Bạn chưa có bài viết nào.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
