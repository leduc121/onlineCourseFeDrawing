import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'https://onlinecoursebedrawing-mukj.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Interceptor to attach Token
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('editorial_user') || 'null');
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data), // Assuming you have register
    googleLogin: (tokenId: string) => api.post('/auth/google-login', { tokenId }),
};

export const streakApi = {
    getStreak: () => api.get('/Streak'),
    recordVisit: () => api.post('/Streak/visit', {}),
    recordWatch: (minutes: number) => api.post('/Streak/watch', minutes) // Check if backend expects int or object
};

export const adminApi = {
    getUsers: (params?: any) => api.get('/users', { params }),
    getCourses: (params?: any) => api.get('/courses/admin/all', { params }),
    updateCourseStatus: (id: string, status: string, feedBack?: string) =>
        api.patch(`/courses/${id}/status`, { status, feedBack }),
};

export default api;
