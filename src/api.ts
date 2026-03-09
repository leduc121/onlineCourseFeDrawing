import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5215/api';

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

export const usersApi = {
    getAll: (pageIndex = 1, pageSize = 10) => api.get(`/Users?pageIndex=${pageIndex}&pageSize=${pageSize}`),
};

export const coursesApi = {
    getAll: (pageIndex = 1, pageSize = 10) => api.get(`/Courses?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    getPendingReview: (pageIndex = 1, pageSize = 10) => api.get(`/Courses/pending-review?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    approve: (id: string) => api.post(`/Courses/${id}/approve`),
    reject: (id: string, reason: string) => api.post(`/Courses/${id}/reject`, { RejectionReason: reason }),
    getPublished: (pageIndex = 1, pageSize = 10) => api.get(`/Courses/published?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    getById: (id: string) => api.get(`/Courses/${id}`),
    getMyCourses: (pageIndex = 1, pageSize = 10) => api.get(`/Courses/my-courses?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    createFull: (data: any) => api.post('/Courses', data),
    update: (id: string, data: any) => api.put(`/Courses/${id}`, data),
    updateSections: (id: string, data: any) => api.patch(`/Courses/${id}/sections`, data),
    delete: (id: string) => api.delete(`/Courses/${id}`),
    submitForReview: (id: string) => api.post(`/Courses/${id}/submit-for-review`),
    publish: (id: string) => api.post(`/Courses/${id}/publish`),
};

export const categoriesApi = {
    getAll: (pageIndex = 1, pageSize = 100) => api.get(`/Categories?pageIndex=${pageIndex}&pageSize=${pageSize}`)
};

export const cartApi = {
    getCart: () => api.get('/cart'),
    addItem: (data: any) => api.post('/cart/items', data),
    removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
    clearCart: () => api.delete('/cart'),
    checkout: (data: any) => api.post('/cart/checkout', data)
};

export const studentProfilesApi = {
    register: (data: any) => api.post('/student-profiles', data),
    getMyStudents: () => api.get('/student-profiles'),
    getById: (id: string) => api.get(`/student-profiles/${id}`),
    getEnrolledCourses: (id: string) => api.get(`/student-profiles/${id}/courses`),
    getMyEnrolledCourses: () => api.get('/student-profiles/my-courses')
};

export default api;
