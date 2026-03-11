import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5215/api';
export const HUB_URL = 'http://localhost:5215/notificationHub';

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
    register: (data: any) => api.post('/Auth/register', data),
    googleLogin: (tokenId: string) => api.post('/Auth/google-login', { tokenId }),
    getMe: () => api.get('/Auth/me'),
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
    getAll: (pageIndex = 1, pageSize = 100) => api.get(`/Categories?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    create: (data: any) => api.post('/Categories', data),
    update: (id: string, data: any) => api.put(`/Categories/${id}`, data),
    delete: (id: string) => api.delete(`/Categories/${id}`)
};

export const studentProfilesApi = {
    getMyStudents: () => api.get(`/student-profiles`),
    registerStudent: (data: any) => api.post('/student-profiles', data),
    getById: (id: string) => api.get(`/student-profiles/${id}`),
    register: (data: any) => api.post('/student-profiles', data),
    getEnrolledCourses: (id: string) => api.get(`/student-profiles/${id}/courses`),
    getMyEnrolledCourses: () => api.get('/student-profiles/my-courses')
};

export const instructorProfilesApi = {
    getAll: (pageIndex = 1, pageSize = 10) => api.get(`/InstructorProfiles?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    getById: (id: string) => api.get(`/InstructorProfiles/${id}`),
    getMyProfile: () => api.get('/InstructorProfiles/my-profile'),
    create: (data: any) => api.post('/InstructorProfiles', data),
    update: (data: any) => api.put('/InstructorProfiles', data),
};

export const paymentsApi = {
    getMyTransactions: () => api.get('/payments/my-transactions'),
    createCheckoutSession: (data: any) => api.post('/payments/create-checkout-session', data),
    verifySession: (sessionId: string) => api.get(`/payments/verify-session/${sessionId}`),
};

export const cartApi = {
    getCart: () => api.get('/cart'),
    addItem: (data: any) => api.post('/cart/items', data),
    removeItem: (id: string) => api.delete(`/cart/items/${id}`),
    updateItem: (id: string, data: any) => api.patch(`/cart/items/${id}`, data),
    clearCart: () => api.delete('/cart'),
    checkout: (data: any) => api.post('/cart/checkout', data),
};

export const uploadsApi = {
    getPresignedUrl: (data: { fileName: string, contentType: string, folder: string }) => api.post('/Uploads/presigned-url', data),
};

export const progressApi = {
    startCourse: (courseId: string) => api.post(`/Progress/courses/${courseId}/start`),
    getCourseProgress: (courseId: string) => api.get(`/Progress/courses/${courseId}`),
    markLessonComplete: (lessonId: string) => api.post(`/Progress/lessons/${lessonId}/complete`),
    updateLastAccessedLesson: (courseId: string, lessonId: string) => api.patch(`/Progress/courses/${courseId}/last-accessed-lesson/${lessonId}`)
};

export const postsApi = {
    getAll: (pageIndex = 1, pageSize = 10) => api.get(`/Posts?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    getById: (id: string) => api.get(`/Posts/${id}`),
    getPendingReview: (pageIndex = 1, pageSize = 10) => api.get(`/Posts/pending-review?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    getMyPosts: (pageIndex = 1, pageSize = 10) => api.get(`/Posts/my-posts?pageIndex=${pageIndex}&pageSize=${pageSize}`),
    create: (data: any) => api.post('/Posts', data),
    update: (id: string, data: any) => api.put(`/Posts/${id}`, data),
    delete: (id: string) => api.delete(`/Posts/${id}`),
    submitForReview: (id: string) => api.post(`/Posts/${id}/submit-for-review`),
    review: (id: string, data: { approved: boolean, rejectionReason?: string }) => api.post(`/Posts/${id}/review`, data),
};

export default api;
