import React, { useState, useEffect } from 'react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  studentId?: string;
  instructorId?: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
}

interface SupportChatProps {
  ticket: SupportTicket;
  currentUserId: string;
  onSendMessage: (ticketId: string, content: string) => Promise<void>;
  onClose?: (ticketId: string) => Promise<void>;
}

export const SupportChat: React.FC<SupportChatProps> = ({
  ticket,
  currentUserId,
  onSendMessage,
  onClose
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      await onSendMessage(ticket.id, newMessage);
      setNewMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{ticket.title}</h3>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {ticket.status}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                ticket.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.priority}
              </span>
            </div>
          </div>
          {ticket.status !== 'Resolved' && (
            <button
              onClick={() => onClose?.(ticket.id)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close Ticket
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages?.map(message => (
          <div
            key={message.id}
            className={`flex ${message.senderName === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              message.senderName === currentUserId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      {ticket.status !== 'Resolved' && (
        <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}
    </div>
  );
};

interface CreateTicketFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CreateSupportTicketForm: React.FC<CreateTicketFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ title: '', description: '', priority: 'Medium' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">Create Support Ticket</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Brief description of your issue"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Detailed description of your issue"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
};

export const TicketList: React.FC<{ tickets: SupportTicket[] }> = ({ tickets }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Support Tickets</h2>
      {tickets.length === 0 ? (
        <p className="text-gray-500">No support tickets</p>
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => (
            <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
