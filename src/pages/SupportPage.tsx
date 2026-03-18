import React, { useState, useEffect } from 'react';
import { issuesApi, supportApi } from '../api';
import { IssueReportForm, IssueList } from '../components/IssueReport';
import {
  CreateSupportTicketForm,
  SupportChat,
  TicketList,
} from '../components/SupportChat';

interface Issue {
  id: string;
  title: string;
  content: string;
  status: string;
  resolution?: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

export const SupportPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'support'>('issues');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
    fetchTickets();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await issuesApi.getAll();
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await supportApi.getStudentTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const handleCreateIssue = async (data: any) => {
    setIsLoading(true);
    try {
      await issuesApi.create(data);
      fetchIssues();
      alert('Issue reported successfully!');
    } catch (error) {
      alert('Failed to report issue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (data: any) => {
    setIsLoading(true);
    try {
      await supportApi.createTicket(data);
      fetchTickets();
      alert('Support ticket created!');
    } catch (error) {
      alert('Failed to create support ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (ticketId: string, content: string) => {
    try {
      await supportApi.addMessage(ticketId, content);
      // Refresh selected ticket
      if (selectedTicket) {
        const response = await supportApi.getTicketById(selectedTicket.id);
        setSelectedTicket(response.data);
      }
      fetchTickets();
    } catch (error) {
      alert('Failed to send message');
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await supportApi.closeTicket(ticketId);
      fetchTickets();
      setSelectedTicket(null);
      alert('Ticket closed');
    } catch (error) {
      alert('Failed to close ticket');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Support Center</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'issues'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Report Issue
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Support Tickets
          </button>
        </div>

        {/* Content */}
        {activeTab === 'issues' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <IssueReportForm onSubmit={handleCreateIssue} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-2">
              <IssueList issues={issues} />
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-2xl font-bold">Create New Ticket</h2>
                <CreateSupportTicketForm
                  onSubmit={handleCreateTicket}
                  isLoading={isLoading}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <SupportChat
                  ticket={selectedTicket}
                  currentUserId=""
                  onSendMessage={handleSendMessage}
                  onClose={handleCloseTicket}
                />
              ) : (
                <TicketList tickets={tickets} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
