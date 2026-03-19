import React, { useEffect, useState } from 'react';
import { postsApi } from '../api';
import { Loader2, CheckCircle2, XCircle, Eye, Calendar, User, Search, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminPostReview: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPendingPosts();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            const response = await postsApi.getPendingReview();
            setPosts(response.data.items);
        } catch (error) {
            toast.error('Không thể tải danh sách bài viết chờ duyệt.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) return;
        try {
            await postsApi.review(id, { approved: true });
            toast.success('Đã duyệt bài viết!');
            fetchPendingPosts();
            setSelectedPost(null);
        } catch (error) {
            toast.error('Lỗi khi duyệt bài.');
        }
    };

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectionReason) return toast.error('Vui lòng nhập lý do từ chối.');
        try {
            await postsApi.review(selectedPost.id, { approved: false, rejectionReason });
            toast.success('Đã từ chối bài viết.');
            setIsRejecting(false);
            setRejectionReason('');
            setSelectedPost(null);
            fetchPendingPosts();
        } catch (error) {
            toast.error('Lỗi khi từ chối bài.');
        }
    };

    const filteredPosts = posts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.authorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-stone-900">Duyệt bài viết</h1>
                    <p className="text-stone-500">Xem xét và phê duyệt nội dung từ giảng viên và nhân viên.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tiêu đề hoặc tác giả..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    {filteredPosts.length > 0 ? filteredPosts.map(post => (
                        <div 
                            key={post.id} 
                            onClick={() => { setSelectedPost(post); setIsRejecting(false); }}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer ${selectedPost?.id === post.id ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                        >
                            <h3 className="font-bold text-stone-900 mb-2 line-clamp-1">{post.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-stone-500">
                                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.authorName}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                            <p className="text-stone-500 text-sm">Không có bài viết chờ duyệt.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {selectedPost ? (
                        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden sticky top-8">
                            <div className="p-8 border-b border-stone-50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-stone-900">Chi tiết bài viết</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleApprove(selectedPost.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Duyệt
                                    </button>
                                    <button 
                                        onClick={() => setIsRejecting(true)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-semibold hover:bg-rose-100 transition-all"
                                    >
                                        <XCircle className="w-4 h-4" /> Từ chối
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                {isRejecting ? (
                                    <form onSubmit={handleReject} className="space-y-4">
                                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex gap-3 text-rose-700 text-sm mb-4">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <p>Vui lòng cung cấp lý do từ chối để tác giả có thể chỉnh sửa lại bài viết.</p>
                                        </div>
                                        <textarea 
                                            required
                                            rows={4}
                                            className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                                            placeholder="Nhập lý do từ chối..."
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                        ></textarea>
                                        <div className="flex gap-2">
                                            <button 
                                                type="submit"
                                                className="px-6 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-all"
                                            >
                                                Xác nhận từ chối
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsRejecting(false)}
                                                className="px-6 py-2 bg-stone-100 text-stone-600 rounded-lg font-semibold hover:bg-stone-200 transition-all"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-8">
                                        {selectedPost.thumbnailUrl && (
                                            <div className="aspect-video rounded-2xl overflow-hidden shadow-sm">
                                                <img src={selectedPost.thumbnailUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <h1 className="text-3xl font-bold text-stone-900">{selectedPost.title}</h1>
                                        <div 
                                            className="prose prose-stone max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200 text-stone-400">
                            <Eye className="w-16 h-16 mb-4 opacity-20" />
                            <p>Chọn một bài viết phía bên trái để xem nội dung.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
