import { useState, useEffect } from 'react';
import { withdrawalsApi } from '../api';

interface Withdrawal {
  id: string;
  instructorProfileId: string;
  bankAccountId: string;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  externalTransactionId?: string;
  instructorProfile?: {
    user?: {
      fullName: string;
      email: string;
    };
  };
}

export default function WithdrawalsManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load pending withdrawals
  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await withdrawalsApi.getPending();
      setWithdrawals(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load withdrawals');
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await withdrawalsApi.approve(id);
      setSuccessMessage('Withdrawal approved successfully');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'Approved' } : w))
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      await withdrawalsApi.reject(id, rejectReason);
      setSuccessMessage('Withdrawal rejected successfully');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'Rejected' } : w))
      );
      setRejectingId(null);
      setRejectReason('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject withdrawal');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await withdrawalsApi.process(id);
      setSuccessMessage('Withdrawal marked as processing');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'Processing' } : w))
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process withdrawal');
    }
  };

  const handleComplete = async (id: string, txnId: string) => {
    if (!txnId.trim()) {
      setError('Please provide external transaction ID');
      return;
    }

    try {
      await withdrawalsApi.complete(id, txnId);
      setSuccessMessage('Withdrawal completed successfully');
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'Completed' } : w))
      );
      setProcessingId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete withdrawal');
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterStatus === 'all') return true;
    return w.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-blue-100 text-blue-800',
    Processing: 'bg-purple-100 text-purple-800',
    Completed: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Withdrawals</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button
          onClick={loadWithdrawals}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading withdrawals...</p>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No withdrawals found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {withdrawal.instructorProfile?.user?.fullName || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {withdrawal.instructorProfile?.user?.email || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">
                      {withdrawal.amount?.toLocaleString('vi-VN')} VND
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[withdrawal.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(withdrawal.requestedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                    {withdrawal.status === 'Pending' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleApprove(withdrawal.id)}
                          className="w-full px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(withdrawal.id)}
                          className="w-full px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {withdrawal.status === 'Approved' && (
                      <button
                        onClick={() => handleProcess(withdrawal.id)}
                        className="w-full px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Mark Processing
                      </button>
                    )}

                    {withdrawal.status === 'Processing' && (
                      <button
                        onClick={() => setProcessingId(withdrawal.id)}
                        className="w-full px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                      >
                        Complete
                      </button>
                    )}

                    {withdrawal.status === 'Completed' && (
                      <p className="text-xs text-green-600 font-medium">✓ Completed</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Reject Withdrawal</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {processingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Complete Withdrawal</h3>
            <input
              type="text"
              placeholder="Enter external transaction ID..."
              id="txnId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setProcessingId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const txnId = (document.getElementById('txnId') as HTMLInputElement)
                    .value;
                  handleComplete(processingId, txnId);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
