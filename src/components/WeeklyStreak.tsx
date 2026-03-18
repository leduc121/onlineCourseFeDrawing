import React, { useState } from 'react';
import { Flame, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

interface WeeklyStreakProps {
    studentName?: string;
    currentStreak: number;
    minutesGoal?: number;
    minutesWatched?: number;
    visitsCount?: number;
    visitsGoal?: number;
    showSchedule?: boolean;
    onScheduleClick?: () => void;
}

export function WeeklyStreak({
    studentName,
    currentStreak = 0,
    minutesGoal = 30,
    minutesWatched = 0,
    visitsCount = 0,
    visitsGoal = 1,
    showSchedule = true,
    onScheduleClick
}: WeeklyStreakProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate progress for the ring (weighted: 50% for visits, 50% for minutes)
    const minutesProgress = (Math.min(minutesWatched, minutesGoal) / minutesGoal);
    const visitsProgress = (Math.min(visitsCount, visitsGoal) / visitsGoal);
    const progressPercent = ((minutesProgress + visitsProgress) / 2) * 100;

    // Get current week string
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Monday
    const end = new Date(now.setDate(now.getDate() - now.getDay() + 7)); // Sunday
    const weekStr = `${start.getDate()} thg ${start.getMonth() + 1} - ${end.getDate()}`;

    return (
        <div className="space-y-6">
            {/* Main Streak Card */}
            <div className="bg-white border border-[#2d2d2d]/10 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-serif font-bold text-[#2d2d2d] mb-1">
                        {studentName ? `Chuỗi học của ${studentName}` : 'Bắt đầu chuỗi học tập'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {progressPercent >= 100 
                          ? 'Tuyệt vời! Bạn đã đạt mục tiêu tuần.' 
                          : 'Duy trì thói quen học mỗi ngày nhé!'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                    {/* Flame Icon & Streak Count */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Flame className={`w-7 h-7 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                        </div>
                        <div className="text-left">
                            <span className="block text-base font-bold text-[#2d2d2d] leading-none">
                                {currentStreak} tuần
                            </span>
                            <span className="text-[12px] text-gray-500">Chuỗi hiện tại</span>
                        </div>
                    </div>

                    {/* Progress Ring & Stats */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="#e5e7eb"
                                    strokeWidth="5"
                                    fill="transparent"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="#10b981"
                                    strokeWidth="5"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 22}
                                    strokeDashoffset={(2 * Math.PI * 22) - (progressPercent / 100) * (2 * Math.PI * 22)}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-[13px] text-gray-600">
                                <span className={`w-2 h-2 rounded-full ${minutesWatched >= minutesGoal ? 'bg-[#ff8a80]' : 'bg-gray-200'}`}></span>
                                <span className="font-medium text-[#2d2d2d]">{minutesWatched}/{minutesGoal} phút học</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-gray-600">
                                <span className={`w-2 h-2 rounded-full ${visitsCount >= visitsGoal ? 'bg-[#10b981]' : 'bg-gray-200'}`}></span>
                                <span className="font-medium text-[#2d2d2d]">{visitsCount}/{visitsGoal} lượt truy cập</span>
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                                {weekStr}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Card - Conditional */}
            {showSchedule && (
                <div className="bg-white border border-[#2d2d2d]/10 p-6 rounded-lg shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="shrink-0 pt-1">
                        <Clock className="w-6 h-6 text-[#2d2d2d]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#2d2d2d] mb-2">Lên lịch thời gian học</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-4xl">
                            Học một chút mỗi ngày sẽ giúp bạn tích lũy kiến thức. Nghiên cứu cho thấy rằng những học viên biến việc học thành thói quen sẽ có nhiều khả năng đạt được mục tiêu hơn. Hãy dành thời gian để học và nhận lời nhắc bằng cách sử dụng trình lên lịch học tập.
                        </p>
                        <div className="flex gap-4">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={onScheduleClick}
                                className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 px-6 font-medium transition-colors"
                            >
                                Bắt đầu
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-xl shadow-xl p-8 max-w-xl w-full"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-bold text-[#2d2d2d] mb-4">
                                Giới thiệu về chuỗi thành tích học tập
                            </h3>
                            <p className="text-gray-600 mb-8">
                                Hoàn thành cả vòng truy cập và vòng số phút đã xem để duy trì chuỗi hàng tuần của bạn.
                            </p>

                            <div className="space-y-6 mb-8">
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#2d2d2d] text-base mb-1">Để hoàn thành vòng xem</h4>
                                        <p className="text-gray-600">Xem video khóa học 30 phút.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#2d2d2d] text-base mb-1">Để hoàn thành vòng truy cập</h4>
                                        <p className="text-gray-600">Mở ứng dụng hoặc trang web mỗi tuần một lần</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 bg-gray-50 -mx-8 -mb-8 p-8 mt-4">
                                <h4 className="font-bold text-[#2d2d2d] text-base mb-2">Bản cập nhật dữ liệu</h4>
                                <p className="text-sm text-gray-600">
                                    Số phút bạn đã xem được cập nhật ba lần mỗi ngày. Hãy quay lại sau vài giờ để xem tiến độ của bạn.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
