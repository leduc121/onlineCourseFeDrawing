import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface PostCardProps {
    post: {
        id: string;
        title: string;
        content: string;
        thumbnailUrl?: string;
        authorName: string;
        createdAt: string;
    };
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    // Strip HTML tags for summary
    const summary = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
    const date = new Date(post.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-stone-100 group">
            {post.thumbnailUrl && (
                <div className="aspect-video overflow-hidden">
                    <img 
                        src={post.thumbnailUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            )}
            <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.authorName}</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-600 transition-colors">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-stone-600 mb-4 line-clamp-3">
                    {summary}
                </p>
                <Link 
                    to={`/posts/${post.id}`}
                    className="inline-flex items-center gap-2 text-amber-600 font-semibold hover:gap-3 transition-all"
                >
                    Đọc tiếp <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};
