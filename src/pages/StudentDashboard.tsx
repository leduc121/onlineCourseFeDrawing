import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Award, Clock, Heart, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mock assigned courses data
const ASSIGNED_COURSES = [
    {
        id: 1,
        title: "Drawing Service - Gói Cơ Bản",
        thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop",
        progress: 35,
        lessons: 12,
        duration: "2h 30m",
        color: "#FF6B6B"
    },
    {
        id: 2,
        title: "Màu Nước Cho Bé",
        thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb39279c15?q=80&w=2070&auto=format&fit=crop",
        progress: 0,
        lessons: 8,
        duration: "1h 45m",
        color: "#4D96FF"
    }
];

export function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FFFBE6] p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border-4 border-white">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img
                                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=kid"}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full border-4 border-[#FF6B6B] bg-[#FFF0F0] shadow-md"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-[#FFD93D] p-2 rounded-full border-4 border-white">
                                <Sparkles size={20} className="text-white fill-white" />
                            </div>
                        </div>

                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2"
                            >
                                <span className="bg-[#5D5FEF]/10 text-[#5D5FEF] px-4 py-1 rounded-full text-sm font-black uppercase tracking-wider">
                                    Level 2 Artist
                                </span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black text-[#2d2d2d] tracking-tight mt-2">
                                Hi, {user?.name}!
                            </h1>
                            <p className="text-gray-400 font-bold text-lg flex items-center gap-2">
                                Let's make some magic today! ✨
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 self-stretch md:self-auto">
                        <div className="flex-1 md:flex-none flex flex-col items-center justify-center bg-[#FFF0F0] px-6 py-3 rounded-3xl border-b-8 border-[#FF6B6B] hover:translate-y-1 transition-transform cursor-default">
                            <Star className="text-[#FF6B6B] fill-[#FF6B6B] mb-1" size={32} />
                            <span className="font-black text-[#FF6B6B] text-2xl">120</span>
                            <span className="text-xs font-bold text-[#FF6B6B]/60 uppercase">Stars</span>
                        </div>
                        <div className="flex-1 md:flex-none flex flex-col items-center justify-center bg-[#F0F7FF] px-6 py-3 rounded-3xl border-b-8 border-[#4D96FF] hover:translate-y-1 transition-transform cursor-default">
                            <Award className="text-[#4D96FF] mb-1" size={32} />
                            <span className="font-black text-[#4D96FF] text-2xl">Silver</span>
                            <span className="text-xs font-bold text-[#4D96FF]/60 uppercase">League</span>
                        </div>
                    </div>
                </header>

                {/* Daily Quest Banner */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] rounded-[2.5rem] p-8 text-white shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="fill-yellow-300 text-yellow-300" />
                                <span className="font-bold text-yellow-100 uppercase tracking-widest text-sm">Daily Quest</span>
                            </div>
                            <h2 className="text-3xl font-black mb-2">Complete "Drawing Basics" Lesson 3</h2>
                            <p className="text-white/80 font-medium">Reward: +50 Stars & specific badge!</p>
                        </div>
                        <button className="bg-white text-[#FF6B6B] px-8 py-3 rounded-full font-black text-lg shadow-lg hover:bg-yellow-50 transition-colors">
                            Start Now
                        </button>
                    </div>
                </motion.div>

                {/* Course Grid */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <Heart className="text-[#5D5FEF] fill-[#5D5FEF]" size={28} />
                        <h2 className="text-3xl font-black text-[#2d2d2d]">My Courses</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ASSIGNED_COURSES.map((course) => (
                            <motion.div
                                key={course.id}
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-indigo-100/50 group cursor-pointer border-4 border-white hover:border-[#5D5FEF] transition-colors"
                                onClick={() => navigate(`/course/${course.id}`)}
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#2d2d2d] flex items-center gap-1 shadow-sm">
                                        <Clock size={14} className="text-[#5D5FEF]" />
                                        {course.duration}
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 text-white">
                                        <div className="inline-block bg-[#5D5FEF] px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1">
                                            Course
                                        </div>
                                        <h3 className="text-xl font-black leading-tight shadow-sm">
                                            {course.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between text-sm font-bold text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span className="text-[#5D5FEF]">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden">
                                        <div
                                            className="bg-[#6BCB77] h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>

                                    <button className="w-full bg-[#faf8f5] text-[#2d2d2d] py-4 rounded-2xl font-black text-lg group-hover:bg-[#5D5FEF] group-hover:text-white transition-colors flex items-center justify-center gap-2">
                                        <Play className="fill-current" size={20} />
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Ask Parent Card */}
                        <motion.div
                            whileHover={{ scale: 1.02, rotate: 2 }}
                            className="border-4 border-dashed border-[#E0E7FF] bg-white/30 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center hover:bg-white hover:border-[#5D5FEF] transition-all cursor-pointer group"
                        >
                            <div className="w-20 h-20 bg-[#F0F7FF] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-4xl">🎁</span>
                            </div>
                            <h3 className="text-xl font-black text-gray-400 group-hover:text-[#5D5FEF] transition-colors">Unlock New Skills</h3>
                            <p className="text-sm text-gray-400 mt-2 font-medium px-4">Ask your parents to add more fun courses to your library!</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
