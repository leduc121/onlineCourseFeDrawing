import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5176/api';

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
    login: (data: any) => api.post('/Auth/login', data),
    register: (data: any) => api.post('/Auth/register', data), // Assuming you have register
    googleLogin: (tokenId: string) => api.post('/Auth/google-login', { tokenId }),
};

export const streakApi = {
    getStreak: () => api.get('/Streak'),
    recordVisit: () => api.post('/Streak/visit', {}),
    recordWatch: (minutes: number) => api.post('/Streak/watch', minutes) // Check if backend expects int or object
};

export default api;
