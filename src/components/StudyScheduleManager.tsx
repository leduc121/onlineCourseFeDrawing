import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { studySchedulesApi } from '../api';

interface StudyScheduleManagerProps {
    studentProfileId: string;
    studentName: string;
}

const DAYS = [
    { value: 0, label: 'Chủ Nhật' },
    { value: 1, label: 'Thứ Hai' },
    { value: 2, label: 'Thứ Ba' },
    { value: 3, label: 'Thứ Tư' },
    { value: 4, label: 'Thứ Năm' },
    { value: 5, label: 'Thứ Sáu' },
    { value: 6, label: 'Thứ Bảy' },
];

export function StudyScheduleManager({ studentProfileId, studentName }: StudyScheduleManagerProps) {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        dayOfWeek: 1,
        startTime: '19:00',
        endTime: '20:00'
    });

    const fetchSchedules = async () => {
        try {
            setIsLoading(true);
            const res = await studySchedulesApi.getByStudent(studentProfileId);
            if (res.data?.data) {
                setSchedules(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch schedules:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [studentProfileId]);

    const handleAdd = async () => {
        try {
            await studySchedulesApi.create({
                studentProfileId,
                dayOfWeek: Number(newSchedule.dayOfWeek),
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime
            });
            setIsAdding(false);
            fetchSchedules();
        } catch (err) {
            alert("Không thể thêm lịch học. Vui lòng kiểm tra lại.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa lịch học này?")) return;
        try {
            await studySchedulesApi.delete(id);
            fetchSchedules();
        } catch (err) {
            alert("Không thể xóa lịch học.");
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#2d2d2d]" />
                    <h4 className="font-bold text-[#2d2d2d]">Lịch học của {studentName}</h4>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-[#ff8a80] hover:text-[#ff7060] text-sm font-bold flex items-center gap-1"
                >
                    <Plus size={16} /> {isAdding ? 'Hủy' : 'Thêm lịch'}
                </button>
            </div>

            <div className="p-4">
                {isAdding && (
                    <div className="mb-6 p-4 bg-[#fff8f7] rounded-lg border border-[#ff8a80]/20 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Ngày trong tuần</label>
                                <select 
                                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm"
                                    value={newSchedule.dayOfWeek}
                                    onChange={e => setNewSchedule({...newSchedule, dayOfWeek: Number(e.target.value)})}
                                >
                                    {DAYS.map(day => (
                                        <option key={day.value} value={day.value}>{day.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Bắt đầu</label>
                                    <input 
                                        type="time" 
                                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm"
                                        value={newSchedule.startTime}
                                        onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Kết thúc</label>
                                    <input 
                                        type="time" 
                                        className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm"
                                        value={newSchedule.endTime}
                                        onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button size="sm" className="w-full" onClick={handleAdd}>Lưu lịch học</Button>
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-4 text-gray-400 text-sm">Đang tải...</div>
                ) : schedules.length > 0 ? (
                    <div className="space-y-2">
                        {schedules.map(ss => (
                            <div key={ss.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-white border border-gray-100 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold text-gray-400 leading-none">THỨ</span>
                                        <span className="text-sm font-black text-[#2d2d2d] leading-none mt-1">{ss.dayOfWeek === 0 ? 'CN' : ss.dayOfWeek + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#2d2d2d]">
                                            {DAYS.find(d => d.value === ss.dayOfWeek)?.label}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={10} /> {ss.startTime} - {ss.endTime}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(ss.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-sm text-gray-400">Chưa có lịch học nào được thiết lập.</p>
                        <p className="text-[10px] text-gray-300 mt-1 uppercase font-bold tracking-wider">Tạo thói quen tốt cho bé ngay hôm nay!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
