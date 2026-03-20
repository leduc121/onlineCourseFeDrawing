import React, { useMemo, useState } from 'react';

export interface TicketMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  studentId?: string;
  instructorId?: string;
  courseId?: string;
  studentSpecialNeeds?: string;
  isUrgent?: boolean;
  messages?: TicketMessage[];
}

interface CourseOption {
  id: string;
  title: string;
  instructorProfileId: string;
  instructorName: string;
}

interface SupportChatProps {
  ticket: SupportTicket;
  currentUserId: string;
  role: 'student' | 'instructor';
  onSendMessage: (ticketId: string, content: string) => Promise<void>;
  onClose?: (ticketId: string) => Promise<void>;
  onStatusChange?: (ticketId: string, status: string) => Promise<void>;
  onPriorityChange?: (ticketId: string, priority: string) => Promise<void>;
}

const statusStyles: Record<string, string> = {
  Open: 'bg-emerald-100 text-emerald-800',
  InProgress: 'bg-blue-100 text-blue-800',
  WaitingOnSupport: 'bg-amber-100 text-amber-800',
  WaitingOnCustomer: 'bg-orange-100 text-orange-800',
  Resolved: 'bg-slate-200 text-slate-700',
  Closed: 'bg-slate-200 text-slate-700'
};

const priorityStyles: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-sky-100 text-sky-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-rose-100 text-rose-800'
};

export const SupportChat: React.FC<SupportChatProps> = ({
  ticket,
  currentUserId,
  role,
  onSendMessage,
  onClose,
  onStatusChange,
  onPriorityChange
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const canModerate = role === 'instructor';
  const isClosed = ticket.status === 'Resolved' || ticket.status === 'Closed';
  const orderedMessages = useMemo(
    () => [...(ticket.messages || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [ticket.messages]
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(ticket.id, newMessage.trim());
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#eadfd3] bg-white shadow-[0_20px_60px_rgba(43,28,18,0.08)]">
      <div className="border-b border-[#efe6dc] bg-[#fbf7f1] px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status] || statusStyles.Open}`}>
                {ticket.status}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority] || priorityStyles.Medium}`}>
                {ticket.priority}
              </span>
              {ticket.isUrgent && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                  Urgent child support
                </span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1f2937]">{ticket.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">{ticket.description}</p>
            </div>
            {ticket.studentSpecialNeeds && (
              <div className="rounded-2xl border border-[#eadfd3] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a7e63]">
                  Special support note
                </p>
                <p className="mt-2 text-sm leading-6 text-[#5f4c3f]">{ticket.studentSpecialNeeds}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canModerate && onPriorityChange && (
              <select
                value={ticket.priority}
                onChange={(e) => onPriorityChange(ticket.id, e.target.value)}
                className="rounded-xl border border-[#d9cbbb] bg-white px-3 py-2 text-sm text-[#2d2d2d]"
              >
                <option value="Low">Low priority</option>
                <option value="Medium">Medium priority</option>
                <option value="High">High priority</option>
                <option value="Urgent">Urgent priority</option>
              </select>
            )}
            {canModerate && onStatusChange && !isClosed && (
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value)}
                className="rounded-xl border border-[#d9cbbb] bg-white px-3 py-2 text-sm text-[#2d2d2d]"
              >
                <option value="Open">Open</option>
                <option value="WaitingOnSupport">Waiting on support</option>
                <option value="WaitingOnCustomer">Waiting on customer</option>
                <option value="InProgress">In progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            )}
            {!isClosed && onClose && (
              <button
                onClick={() => onClose(ticket.id)}
                className="rounded-xl border border-[#d9cbbb] bg-white px-4 py-2 text-sm font-semibold text-[#6b4f3f] transition hover:border-[#b9977f]"
              >
                Close ticket
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fffdfa] px-6 py-5">
        {orderedMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-[#e6d8c9] bg-white/70 p-8 text-center text-sm leading-6 text-[#7b6a5e]">
            No messages yet. Start the conversation when you are ready.
          </div>
        ) : (
          <div className="space-y-4">
            {orderedMessages.map((message) => {
              const isCurrentUser = String(message.senderId) === String(currentUserId);
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xl rounded-[24px] px-4 py-3 shadow-sm ${
                      isCurrentUser
                        ? 'bg-[#1f4ed8] text-white'
                        : 'border border-[#eadfd3] bg-white text-[#2d2d2d]'
                    }`}
                  >
                    <p className="text-sm leading-6">{message.content}</p>
                    <p className={`mt-2 text-[11px] font-medium ${isCurrentUser ? 'text-white/70' : 'text-[#8b7a6d]'}`}>
                      {new Date(message.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isClosed && (
        <form onSubmit={handleSendMessage} className="border-t border-[#efe6dc] bg-white px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={role === 'student' ? 'Describe what you still need help with...' : 'Send a clear next step or response...'}
              className="flex-1 rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm text-[#2d2d2d] outline-none transition focus:border-[#8c6c54]"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="rounded-2xl bg-[#1f2937] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

interface CreateTicketFormProps {
  onSubmit: (data: any) => Promise<void>;
  courses: CourseOption[];
  isLoading?: boolean;
}

export const CreateSupportTicketForm: React.FC<CreateTicketFormProps> = ({
  onSubmit,
  courses,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    courseId: courses[0]?.id || '',
    title: '',
    description: '',
    priority: 'Medium',
    studentSpecialNeeds: '',
    isUrgent: false
  });

  React.useEffect(() => {
    if (!formData.courseId && courses.length > 0) {
      setFormData((prev) => ({ ...prev, courseId: courses[0].id }));
    }
  }, [courses, formData.courseId]);

  const selectedCourse = courses.find((course) => course.id === formData.courseId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    await onSubmit({
      courseId: selectedCourse.id,
      instructorProfileId: selectedCourse.instructorProfileId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      studentSpecialNeeds: formData.studentSpecialNeeds || null,
      isUrgent: formData.isUrgent
    });

    setFormData({
      courseId: selectedCourse.id,
      title: '',
      description: '',
      priority: 'Medium',
      studentSpecialNeeds: '',
      isUrgent: false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#5f4c3f]">Course</label>
        <select
          name="courseId"
          value={formData.courseId}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] bg-white px-4 py-3 text-sm text-[#2d2d2d]"
        >
          {courses.length === 0 && <option value="">No enrolled courses</option>}
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title} - {course.instructorName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5f4c3f]">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Example: Need help with watercolor blending"
          className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5f4c3f]">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Explain what is confusing or what kind of guidance you need."
          className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[#5f4c3f]">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-[#eadfd3] bg-[#faf6ef] px-4 py-3 text-sm text-[#5f4c3f]">
          <input
            type="checkbox"
            checked={formData.isUrgent}
            onChange={(e) => setFormData((prev) => ({ ...prev, isUrgent: e.target.checked }))}
            className="h-4 w-4 rounded border-[#d9cbbb]"
          />
          Student needs urgent, simplified guidance
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5f4c3f]">Special support note</label>
        <textarea
          name="studentSpecialNeeds"
          value={formData.studentSpecialNeeds}
          onChange={handleChange}
          rows={3}
          placeholder="Example: Child cannot read yet, please use simple wording or visual guidance."
          className="mt-1 block w-full rounded-2xl border border-[#d9cbbb] px-4 py-3 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || courses.length === 0}
        className="w-full rounded-2xl bg-[#1f2937] py-3 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
      >
        {isLoading ? 'Creating...' : 'Open Support Ticket'}
      </button>
    </form>
  );
};

interface TicketListProps {
  tickets: SupportTicket[];
  selectedTicketId?: string;
  onSelect: (ticketId: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, selectedTicketId, onSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#2d2d2d]">Conversations</h2>
      {tickets.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#e6d8c9] bg-white p-6 text-sm text-[#7b6a5e]">
          No support tickets yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelect(ticket.id)}
              className={`w-full rounded-[24px] border px-5 py-4 text-left transition ${
                selectedTicketId === ticket.id
                  ? 'border-[#b9977f] bg-[#fff8f1] shadow-sm'
                  : 'border-[#eadfd3] bg-white hover:border-[#d9cbbb]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-[#1f2937]">{ticket.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#6b7280]">{ticket.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[ticket.status] || statusStyles.Open}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8b7a6d]">
                <span>{new Date(ticket.createdAt).toLocaleString('vi-VN')}</span>
                <span className={`rounded-full px-2.5 py-1 font-semibold ${priorityStyles[ticket.priority] || priorityStyles.Medium}`}>
                  {ticket.priority}
                </span>
                {ticket.isUrgent && <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-800">Urgent</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
