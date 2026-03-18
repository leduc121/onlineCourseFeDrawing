import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5215/api';
export const HUB_URL = 'http://localhost:5215/notificationHub';

type StoredUser = {
    token?: string;
    refreshToken?: string;
    [key: string]: any;
};

const getStoredUser = (): StoredUser | null => {
    try {
        return JSON.parse(localStorage.getItem('editorial_user') || 'null');
    } catch {
        return null;
    }
};

const setStoredUser = (user: StoredUser) => {
    localStorage.setItem('editorial_user', JSON.stringify(user));
};

const clearStoredUser = () => {
    localStorage.removeItem('editorial_user');
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Interceptor to attach Token
api.interceptors.request.use((config) => {
    const user = getStoredUser();
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as any;

        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url?.includes('/Auth/refresh-token')) {
            clearStoredUser();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        const user = getStoredUser();
        if (!user?.refreshToken) {
            clearStoredUser();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!refreshPromise) {
            refreshPromise = axios
                .post(`${API_URL}/Auth/refresh-token`, {
                    refreshToken: user.refreshToken
                })
                .then((response) => {
                    const refreshData = response.data?.data;
                    const newAccessToken = refreshData?.accessToken;
                    const newRefreshToken = refreshData?.refreshToken;

                    if (!newAccessToken || !newRefreshToken) {
                        throw new Error('Invalid refresh token response');
                    }

                    setStoredUser({
                        ...user,
                        token: newAccessToken,
                        refreshToken: newRefreshToken
                    });

                    return newAccessToken;
                })
                .catch((refreshError) => {
                    clearStoredUser();
                    window.location.href = '/login';
                    throw refreshError;
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        const newAccessToken = await refreshPromise;
        if (!newAccessToken) {
            return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
    }
);

export const authApi = {
    login: (data: any) => api.post('/Auth/login', data),
    register: (data: any) => api.post('/Auth/register', data),
    googleLogin: (tokenId: string) => api.post('/Auth/google-login', { tokenId }),
    getMe: () => api.get('/Auth/me'),
    refreshToken: (refreshToken: string) => api.post('/Auth/refresh-token', { refreshToken }),
    logout: () => api.post('/Auth/logout'),
};

export const studySchedulesApi = {
    getByStudent: (studentProfileId: string) => api.get(`/study-schedules/student/${studentProfileId}`),
    create: (data: any) => api.post('/study-schedules', data),
    delete: (id: string) => api.delete(`/study-schedules/${id}`),
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
    getAllTransactions: () => api.get('/payments/all'),
    approveTransaction: (txnRef: string) => api.post(`/payments/${txnRef}/approve`),
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

export const assignmentsApi = {
    getById: (id: string) => api.get(`/Assignments/${id}`),
    submit: (id: string, data: any) => api.post(`/Assignments/${id}/submit`, data),
    getMySubmission: (id: string) => api.get(`/Assignments/${id}/my-submission`),
    getSubmissions: (id: string) => api.get(`/Assignments/${id}/submissions`),
    grade: (submissionId: string, data: any) => api.post(`/Assignments/submissions/${submissionId}/grade`, data),
};

export const quizzesApi = {
    getById: (id: string) => api.get(`/Quizzes/${id}`),
    submit: (id: string, answers: any[]) => api.post(`/Quizzes/${id}/submit`, answers),
    getMySubmissions: (quizId: string) => api.get(`/Quizzes/${quizId}/submissions`),
    getSubmissionDetail: (submissionId: string) => api.get(`/Quizzes/submissions/${submissionId}`),
};

export const couponsApi = {
    getAll: () => api.get('/Coupons'),
    getById: (id: string) => api.get(`/Coupons/${id}`),
    create: (data: any) => api.post('/Coupons', data),
    update: (id: string, data: any) => api.put(`/Coupons/${id}`, data),
    delete: (id: string) => api.delete(`/Coupons/${id}`),
    validate: (code: string, courseId?: string) => api.post('/Coupons/validate', { code, courseId }),
};

// Bank Accounts
export const bankAccountsApi = {
    getAll: () => api.get('/BankAccounts'),
    getById: (id: string) => api.get(`/BankAccounts/${id}`),
    create: (data: any) => api.post('/BankAccounts', data),
    update: (id: string, data: any) => api.put(`/BankAccounts/${id}`, data),
    delete: (id: string) => api.delete(`/BankAccounts/${id}`),
    setDefault: (id: string) => api.post(`/BankAccounts/${id}/setdefault`),
    verify: (id: string) => api.post(`/BankAccounts/${id}/verify`),
};

// Withdrawals
export const withdrawalsApi = {
    getAll: () => api.get('/Withdrawals'),
    getById: (id: string) => api.get(`/Withdrawals/${id}`),
    create: (data: any) => api.post('/Withdrawals', data),
    approve: (id: string) => api.post(`/Withdrawals/${id}/approve`),
    reject: (id: string, reason: string) => api.post(`/Withdrawals/${id}/reject`, { reason }),
    process: (id: string) => api.post(`/Withdrawals/${id}/process`),
    complete: (id: string, externalTransactionId: string) => api.post(`/Withdrawals/${id}/complete`, { externalTransactionId }),
    getWithdrawableAmount: () => api.get('/Withdrawals/withdrawable-amount'),
    getPending: () => api.get('/Withdrawals/pending'),
};

// Support Tickets
export const supportApi = {
    createTicket: (data: any) => api.post('/Support/tickets', data),
    getInstructorTickets: () => api.get('/Support/tickets/instructor'),
    getStudentTickets: () => api.get('/Support/tickets/student'),
    getTicketById: (id: string) => api.get(`/Support/tickets/${id}`),
    updateStatus: (id: string, status: string) => api.put(`/Support/tickets/${id}/status`, { status }),
    updatePriority: (id: string, priority: string) => api.put(`/Support/tickets/${id}/priority`, { priority }),
    addMessage: (ticketId: string, content: string) => api.post(`/Support/tickets/${ticketId}/messages`, { content }),
    getMessages: (ticketId: string) => api.get(`/Support/tickets/${ticketId}/messages`),
    closeTicket: (id: string) => api.post(`/Support/tickets/${id}/close`),
};

// Issues
export const issuesApi = {
    getAll: () => api.get('/Issues'),
    getById: (id: string) => api.get(`/Issues/${id}`),
    create: (data: any) => api.post('/Issues', data),
    updateStatus: (id: string, data: any) => api.put(`/Issues/${id}/status`, data),
    getByStudent: (studentId: string) => api.get(`/Issues/student/${studentId}`),
    getByCourse: (courseId: string) => api.get(`/Issues/course/${courseId}`),
};

// Bundles
export const bundlesApi = {
    getAll: () => api.get('/Bundles'),
    getById: (id: string) => api.get(`/Bundles/${id}`),
    create: (data: any) => api.post('/Bundles', data),
    update: (id: string, data: any) => api.put(`/Bundles/${id}`, data),
    addCourse: (bundleId: string, courseId: string) => api.post(`/Bundles/${bundleId}/courses`, { courseId }),
    removeCourse: (bundleId: string, courseId: string) => api.delete(`/Bundles/${bundleId}/courses/${courseId}`),
    getCourses: (bundleId: string) => api.get(`/Bundles/${bundleId}/courses`),
};

// Course Stages
export const courseStagesApi = {
    getAll: (courseId: string) => api.get(`/CourseStages?courseId=${courseId}`),
    getById: (id: string) => api.get(`/CourseStages/${id}`),
    create: (data: any) => api.post('/CourseStages', data),
    update: (id: string, data: any) => api.put(`/CourseStages/${id}`, data),
    delete: (id: string) => api.delete(`/CourseStages/${id}`),
    getMilestones: (stageId: string) => api.get(`/CourseStages/${stageId}/milestones`),
    addMilestone: (stageId: string, data: any) => api.post(`/CourseStages/${stageId}/milestones`, data),
    getProgress: (stageId: string) => api.get(`/CourseStages/${stageId}/progress`),
};

// Prerequisites
export const prerequisitesApi = {
    check: (courseId: string) => api.get(`/Prerequisites/check?courseId=${courseId}`),
    getAll: (courseId: string) => api.get(`/Prerequisites?courseId=${courseId}`),
    add: (courseId: string, data: any) => api.post(`/Prerequisites?courseId=${courseId}`, data),
    remove: (id: string) => api.delete(`/Prerequisites/${id}`),
    hasCompleted: (courseId: string) => api.get(`/Prerequisites/completed?courseId=${courseId}`),
};

// Drawings
export const drawingsApi = {
    save: (data: any) => api.post('/Drawing/save', data),
    get: (submissionId: string) => api.get(`/Drawing/${submissionId}`),
    delete: (id: string) => api.delete(`/Drawing/${id}`),
};

// External Payments
export const externalPaymentsApi = {
    getProviders: () => api.get('/ExternalPayments/providers'),
    getActiveProviders: () => api.get('/ExternalPayments/providers/active'),
    getProvider: (id: string) => api.get(`/ExternalPayments/providers/${id}`),
    createProvider: (data: any) => api.post('/ExternalPayments/providers', data),
    updateProvider: (id: string, data: any) => api.put(`/ExternalPayments/providers/${id}`, data),
    createTransaction: (data: any) => api.post('/ExternalPayments/transactions', data),
    getTransaction: (id: string) => api.get(`/ExternalPayments/transactions/${id}`),
    updateTransactionStatus: (id: string, status: string) => api.post(`/ExternalPayments/transactions/${id}/status`, { status }),
};

export default api;
