import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';
import { notificationsApi, HUB_URL } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

interface Notification {
    id: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationPopover() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const connectionRef = useRef<HubConnection | null>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const res = await notificationsApi.getAll(user.id);
            if (Array.isArray(res.data)) {
                setNotifications(res.data);
            } else if (res.data?.data && Array.isArray(res.data.data)) {
                setNotifications(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        fetchNotifications();

        // Setup SignalR
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => {
                    const stored = localStorage.getItem('editorial_user');
                    const u = stored ? JSON.parse(stored) : null;
                    return u?.token || "";
                }
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connection.on("NewNotification", (notif: Notification) => {
            console.log("Real-time notification received:", notif);
            setNotifications(prev => [notif, ...prev]);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("SignalR Connected.");
                // Join user-specific group
                await connection.invoke("JoinGroup", user.id);
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
            }
        };

        startConnection();
        connectionRef.current = connection;

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, [user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await notificationsApi.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const markAllRead = async () => {
        if (!user?.id) return;
        try {
            await notificationsApi.markAllRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    };

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-[#ff8a80] transition-colors rounded-full hover:bg-gray-100"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#ff6b6b] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-[#2d2d2d] flex items-center gap-2">
                                <Bell size={18} className="text-[#ff8a80]" />
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs font-bold text-[#ff8a80] hover:underline flex items-center gap-1"
                                >
                                    <Check size={14} />
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {isLoading && notifications.length === 0 ? (
                                <div className="py-12 text-center text-gray-400 text-sm italic">
                                    Loading...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 flex gap-3 transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
                                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                                        >
                                            <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${notif.isRead ? 'bg-transparent' : 'bg-[#ff8a80]'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-600' : 'text-[#2d2d2d] font-bold'}`}>
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                        <Clock size={12} />
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                    {notif.link && (
                                                        <Link
                                                            to={notif.link}
                                                            className="text-[10px] font-black text-[#ff8a80] uppercase tracking-wider flex items-center gap-1 hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsOpen(false);
                                                            }}
                                                        >
                                                            View
                                                            <ExternalLink size={12} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End of notices</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
