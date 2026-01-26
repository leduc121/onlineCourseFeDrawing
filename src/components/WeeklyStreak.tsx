import React, { useState } from 'react';
import { Flame, Info, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';

export function WeeklyStreak() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data
    const currentStreak = 0;
    const minutesWatched = 0;
    const minutesGoal = 30;
    const visitsCount = 1;
    const visitsGoal = 1;
    const currentWeek = "25 thg 1 - 31";

    // Calculate progress for the ring (simplified)
    const progressPercent = ((Math.min(minutesWatched, minutesGoal) / minutesGoal) + (Math.min(visitsCount, visitsGoal) / visitsGoal)) / 2 * 100;

    const circleCircumference = 2 * Math.PI * 24; // r=24
    const strokeDashoffset = circleCircumference - (progressPercent / 100) * circleCircumference;

    return (
        <div className="space-y-6 mb-12">
            {/* Main Streak Card */}
            <div className="bg-white border border-[#2d2d2d]/10 p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold text-[#2d2d2d] mb-2">
                        Bắt đầu một chuỗi hàng tuần
                    </h3>
                    <p className="text-gray-600">
                        Đã xong một vòng rồi! Bây giờ, hãy xem (các) khóa học của bạn.
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    {/* Flame Icon & Streak Count */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
                        </div>
                        <div className="text-left">
                            <span className="block text-lg font-bold text-[#2d2d2d] leading-none">
                                {currentStreak} tuần
                            </span>
                            <span className="text-sm text-gray-500">Chuỗi hiện tại</span>
                        </div>
                    </div>

                    {/* Progress Ring & Stats */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="24"
                                    stroke="#e5e7eb"
                                    strokeWidth="6"
                                    fill="transparent"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="24"
                                    stroke="#10b981"
                                    strokeWidth="6"
                                    fill="transparent"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className={`w-2 h-2 rounded-full ${minutesWatched >= minutesGoal ? 'bg-[#ff8a80]' : 'bg-[#ff8a80]'}`}></span>
                                <span className="font-medium text-[#2d2d2d]">{minutesWatched}/{minutesGoal} phút khóa học</span>
                                <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-[#2d2d2d] transition-colors ml-1">
                                    <Info size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className={`w-2 h-2 rounded-full ${visitsCount >= visitsGoal ? 'bg-[#10b981]' : 'bg-[#10b981]'}`}></span>
                                <span className="font-medium text-[#2d2d2d]">{visitsCount}/{visitsGoal} lượt truy cập</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 pl-4">
                                <span>{currentWeek}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Card */}
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
                        <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 px-6 font-medium transition-colors">
                            Bắt đầu
                        </Button>
                        <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-transparent px-0 font-medium">
                            Hủy bỏ
                        </Button>
                    </div>
                </div>
            </div>

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
