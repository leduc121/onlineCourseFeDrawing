import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsApi } from '../api';
import { Loader2, Calendar, User, ArrowLeft, Share2 } from 'lucide-react';

export const PostDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                const response = await postsApi.getById(id);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching post detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-stone-900 mb-4">Không tìm thấy bài viết</h2>
                <Link to="/posts" className="text-amber-600 font-semibold hover:underline">Quay lại danh sách</Link>
            </div>
        );
    }

    const date = new Date(post.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link 
                to="/posts" 
                className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 mb-8 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại danh sách
            </Link>

            {post.thumbnailUrl && (
                <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-sm">
                    <img 
                        src={post.thumbnailUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-stone-500 border-b border-stone-100 pb-8">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-600/60" />
                        <span className="font-medium text-stone-700">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-600/60" />
                        <span>{date}</span>
                    </div>
                    <button className="flex items-center gap-2 hover:text-amber-600 transition-colors ml-auto">
                        <Share2 className="w-5 h-5" />
                        <span>Chia sẻ</span>
                    </button>
                </div>
            </div>

            <div 
                className="prose prose-stone prose-lg max-w-none prose-headings:text-stone-900 prose-amber"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </article>
    );
};
