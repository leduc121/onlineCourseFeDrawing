import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to headers
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh on 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });
              const { accessToken } = response.data;
              localStorage.setItem('token', accessToken);
              
              // Retry original request
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(error.config);
            } catch (err) {
              // Refresh failed, logout user
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Bank Accounts
  async createBankAccount(data: any) {
    return this.client.post('/bankaccounts', data);
  }

  async getBankAccounts() {
    return this.client.get('/bankaccounts');
  }

  async getBankAccount(id: string) {
    return this.client.get(`/bankaccounts/${id}`);
  }

  async updateBankAccount(id: string, data: any) {
    return this.client.put(`/bankaccounts/${id}`, data);
  }

  async deleteBankAccount(id: string) {
    return this.client.delete(`/bankaccounts/${id}`);
  }

  async setDefaultBankAccount(id: string) {
    return this.client.post(`/bankaccounts/${id}/setdefault`);
  }

  // Withdrawals
  async requestWithdrawal(data: any) {
    return this.client.post('/withdrawals', data);
  }

  async getWithdrawalRequests() {
    return this.client.get('/withdrawals');
  }

  async getWithdrawalRequest(id: string) {
    return this.client.get(`/withdrawals/${id}`);
  }

  async approveWithdrawal(id: string) {
    return this.client.post(`/withdrawals/${id}/approve`);
  }

  async rejectWithdrawal(id: string, reason: string) {
    return this.client.post(`/withdrawals/${id}/reject`, { reason });
  }

  async getWithdrawableAmount() {
    return this.client.get('/withdrawals/withdrawable-amount');
  }

  // Support Tickets
  async createSupportTicket(data: any) {
    return this.client.post('/support/tickets', data);
  }

  async getSupportTickets() {
    return this.client.get('/support/tickets/instructor');
  }

  async getStudentTickets() {
    return this.client.get('/support/tickets/student');
  }

  async getSupportTicket(id: string) {
    return this.client.get(`/support/tickets/${id}`);
  }

  async updateTicketStatus(id: string, status: string) {
    return this.client.put(`/support/tickets/${id}/status`, { status });
  }

  async addTicketMessage(ticketId: string, content: string) {
    return this.client.post(`/support/tickets/${ticketId}/messages`, { content });
  }

  async closeTicket(id: string) {
    return this.client.post(`/support/tickets/${id}/close`);
  }

  // Issues
  async createIssueReport(data: any) {
    return this.client.post('/issues', data);
  }

  async getIssueReports() {
    return this.client.get('/issues');
  }

  async getIssueReport(id: string) {
    return this.client.get(`/issues/${id}`);
  }

  async updateIssueStatus(id: string, status: string, resolution?: string) {
    return this.client.put(`/issues/${id}/status`, { status, resolution });
  }

  // Bundles
  async getBundles() {
    return this.client.get('/bundles');
  }

  async getBundle(id: string) {
    return this.client.get(`/bundles/${id}`);
  }

  async createBundle(data: any) {
    return this.client.post('/bundles', data);
  }

  async updateBundle(id: string, data: any) {
    return this.client.put(`/bundles/${id}`, data);
  }

  // Course Stages
  async getCourseStages(courseId: string) {
    return this.client.get(`/coursestages?courseId=${courseId}`);
  }

  async createCourseStage(courseId: string, data: any) {
    return this.client.post('/coursestages', { ...data, courseId });
  }

  async updateCourseStage(id: string, data: any) {
    return this.client.put(`/coursestages/${id}`, data);
  }

  async addStageMilestone(stageId: string, data: any) {
    return this.client.post(`/coursestages/${stageId}/milestones`, data);
  }

  // Prerequisites
  async checkCanEnroll(courseId: string) {
    return this.client.get(`/prerequisites/check?courseId=${courseId}`);
  }

  async getPrerequisites(courseId: string) {
    return this.client.get(`/prerequisites?courseId=${courseId}`);
  }

  async addPrerequisite(courseId: string, data: any) {
    return this.client.post(`/prerequisites?courseId=${courseId}`, data);
  }

  // Drawings
  async saveDrawing(submissionId: string, drawingBase64: string) {
    return this.client.post('/drawing/save', {
      assignmentSubmissionId: submissionId,
      drawingBase64,
    });
  }

  async getDrawing(submissionId: string) {
    return this.client.get(`/drawing/${submissionId}`);
  }

  async deleteDrawing(drawingId: string) {
    return this.client.delete(`/drawing/${drawingId}`);
  }

  // External Payments
  async getActivePaymentProviders() {
    return this.client.get('/externalpayments/providers/active');
  }

  async createExternalTransaction(data: any) {
    return this.client.post('/externalpayments/transactions', data);
  }

  async getExternalTransaction(id: string) {
    return this.client.get(`/externalpayments/transactions/${id}`);
  }
}

export const api = new ApiClient();
export default api;
