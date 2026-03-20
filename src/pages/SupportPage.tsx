import React, { useEffect, useMemo, useState } from 'react';
import { issuesApi, studentProfilesApi, supportApi } from '../api';
import { IssueReportForm, IssueList } from '../components/IssueReport';
import {
  CreateSupportTicketForm,
  SupportChat,
  SupportTicket,
  TicketList
} from '../components/SupportChat';
import { useAuth } from '../contexts/AuthContext';

interface Issue {
  id: string;
  title: string;
  content: string;
  status: string;
  resolution?: string;
  createdAt: string;
}

interface CourseOption {
  id: string;
  title: string;
  instructorProfileId: string;
  instructorName: string;
}

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isStudent = role === 'student';
  const isInstructor = role === 'instructor';

  const [issues, setIssues] = useState<Issue[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'support'>(isStudent ? 'issues' : 'support');
  const [isLoading, setIsLoading] = useState(false);

  const supportHeading = useMemo(() => {
    if (isInstructor) {
      return {
        eyebrow: 'Support Inbox',
        title: 'Respond to student support requests',
        description: 'Review course-specific questions, reply with clear next steps, and close tickets when the learner is unblocked.'
      };
    }

    return {
      eyebrow: 'Support Studio',
      title: 'Report issues or contact the instructor',
      description: 'Students can report platform problems and open a guided support conversation tied to a specific course.'
    };
  }, [isInstructor]);

  useEffect(() => {
    if (!role) return;
    loadPage();
  }, [role]);

  useEffect(() => {
    if (isStudent) {
      setActiveTab('issues');
      return;
    }

    if (isInstructor) {
      setActiveTab('support');
    }
  }, [isInstructor, isStudent]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetail(selectedTicketId);
    } else {
      setSelectedTicket(null);
    }
  }, [selectedTicketId]);

  const loadPage = async () => {
    await Promise.all([
      fetchTickets(),
      isStudent ? fetchIssues() : Promise.resolve(),
      isStudent ? fetchCourses() : Promise.resolve()
    ]);
  };

  const fetchIssues = async () => {
    try {
      const response = await issuesApi.getMy();
      setIssues(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setIssues([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await studentProfilesApi.getMyEnrolledCourses();
      const rawCourses = Array.isArray(response.data?.data) ? response.data.data : [];
      setCourses(
        rawCourses.map((course: any) => ({
          id: course.id,
          title: course.title,
          instructorProfileId: course.instructorProfileId,
          instructorName: course.instructorName
        }))
      );
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      setCourses([]);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = isInstructor
        ? await supportApi.getInstructorTickets()
        : await supportApi.getStudentTickets();
      const nextTickets = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setTickets(nextTickets);

      if (!selectedTicketId && nextTickets.length > 0) {
        setSelectedTicketId(nextTickets[0].id);
      }
      if (selectedTicketId && !nextTickets.some((ticket: SupportTicket) => ticket.id === selectedTicketId)) {
        setSelectedTicketId(nextTickets[0]?.id || '');
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    }
  };

  const fetchTicketDetail = async (ticketId: string) => {
    try {
      const response = await supportApi.getTicketById(ticketId);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Failed to fetch selected ticket:', error);
      setSelectedTicket(null);
    }
  };

  const handleCreateIssue = async (data: any) => {
    setIsLoading(true);
    try {
      await issuesApi.create(data);
      await fetchIssues();
    } catch (error) {
      console.error('Failed to report issue', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await supportApi.createTicket(data);
      await fetchTickets();
      const createdTicketId = response.data?.id;
      if (createdTicketId) {
        setActiveTab('support');
        setSelectedTicketId(createdTicketId);
      }
    } catch (error) {
      console.error('Failed to create support ticket', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (ticketId: string, content: string) => {
    await supportApi.addMessage(ticketId, content);
    await Promise.all([fetchTickets(), fetchTicketDetail(ticketId)]);
  };

  const handleCloseTicket = async (ticketId: string) => {
    await supportApi.closeTicket(ticketId);
    await Promise.all([fetchTickets(), fetchTicketDetail(ticketId)]);
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    await supportApi.updateStatus(ticketId, status);
    await Promise.all([fetchTickets(), fetchTicketDetail(ticketId)]);
  };

  const handlePriorityChange = async (ticketId: string, priority: string) => {
    await supportApi.updatePriority(ticketId, priority);
    await Promise.all([fetchTickets(), fetchTicketDetail(ticketId)]);
  };

  return (
    <div className="min-h-screen bg-[#f7f2eb] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-[#eadfd3] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_rgba(247,242,235,0.88)_55%,_rgba(235,224,212,0.95))] px-6 py-8 shadow-[0_24px_70px_rgba(43,28,18,0.08)] md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7e63]">{supportHeading.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-[#1f2937]">{supportHeading.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6b7280]">{supportHeading.description}</p>
        </section>

        {isStudent && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('issues')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === 'issues'
                  ? 'bg-[#1f2937] text-white'
                  : 'border border-[#d9cbbb] bg-white text-[#5f4c3f]'
              }`}
            >
              Report issue
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === 'support'
                  ? 'bg-[#1f2937] text-white'
                  : 'border border-[#d9cbbb] bg-white text-[#5f4c3f]'
              }`}
            >
              Contact instructor
            </button>
          </div>
        )}

        {isStudent && activeTab === 'issues' && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.5fr]">
            <section className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-[#2d2d2d]">Create issue report</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                Use this for bugs, broken media, access errors, or anything that should go to platform support.
              </p>
              <div className="mt-6">
                <IssueReportForm onSubmit={handleCreateIssue} isLoading={isLoading} courses={courses} />
              </div>
            </section>
            <section className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-sm">
              <IssueList issues={issues} />
            </section>
          </div>
        )}

        {(!isStudent || activeTab === 'support') && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_1.6fr]">
            {isStudent && (
              <section className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#2d2d2d]">Open a support ticket</h2>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  Choose a course, describe the learning block, and note if the child needs simplified, non-reading guidance.
                </p>
                <div className="mt-6">
                  <CreateSupportTicketForm
                    onSubmit={handleCreateTicket}
                    courses={courses}
                    isLoading={isLoading}
                  />
                </div>
              </section>
            )}

            <section className="rounded-[32px] border border-[#eadfd3] bg-white p-6 shadow-sm">
              <TicketList
                tickets={tickets}
                selectedTicketId={selectedTicketId}
                onSelect={(ticketId) => setSelectedTicketId(ticketId)}
              />
            </section>

            <section className="min-h-[520px]">
              {selectedTicket ? (
                <SupportChat
                  ticket={selectedTicket}
                  currentUserId={user?.id || ''}
                  role={isInstructor ? 'instructor' : 'student'}
                  onSendMessage={handleSendMessage}
                  onClose={handleCloseTicket}
                  onStatusChange={isInstructor ? handleStatusChange : undefined}
                  onPriorityChange={isInstructor ? handlePriorityChange : undefined}
                />
              ) : (
                <div className="flex h-full min-h-[520px] items-center justify-center rounded-[32px] border border-dashed border-[#e6d8c9] bg-white p-8 text-center text-sm leading-7 text-[#7b6a5e]">
                  Select a ticket to open the conversation thread.
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
