import React, { useEffect, useState } from 'react';
import { bankAccountsApi, instructorProfilesApi, withdrawalsApi } from '../api';
import {
  BankAccountForm,
  BankAccountList,
} from '../components/BankAccountManager';
import {
  RequestWithdrawalForm,
  WithdrawalHistory,
} from '../components/WithdrawalManager';

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  accountType: string;
  isVerified: boolean;
  isDefault: boolean;
}

interface WithdrawalRequest {
  id: string;
  bankAccountId?: string;
  amount: number;
  status: string;
  bankAccountNumber?: string;
  bankName?: string;
  processingFee?: number;
  createdAt?: string;
}

export const PaymentManagementPage: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeTab, setActiveTab] = useState<'bank' | 'withdrawal'>('bank');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const accounts = await fetchBankAccounts();
    await Promise.all([
      fetchWithdrawalRequests(accounts),
      fetchWithdrawableAmount(),
      fetchInstructorRevenue()
    ]);
  };

  const fetchBankAccounts = async (): Promise<BankAccount[]> => {
    try {
      const response = await bankAccountsApi.getAll();
      const accounts = Array.isArray(response.data) ? response.data : [];
      setBankAccounts(accounts);
      setError('');
      return accounts;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bank accounts');
      return [];
    }
  };

  const fetchWithdrawalRequests = async (accounts: BankAccount[] = bankAccounts) => {
    try {
      const response = await withdrawalsApi.getAll();
      const requests = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const mappedRequests = requests.map((request: any) => {
        const matchedAccount = accounts.find(account => account.id === request.bankAccountId);

        return {
          id: request.id,
          bankAccountId: request.bankAccountId,
          amount: Number(request.amount || 0),
          status: String(request.status || 'Pending'),
          bankAccountNumber: request.bankAccount?.accountNumber || matchedAccount?.accountNumber || '',
          bankName: request.bankAccount?.bankName || matchedAccount?.bankName || '',
          processingFee: Number(request.processingFee || 0),
          createdAt: request.createdAt || request.requestedAt || ''
        };
      });

      setWithdrawalRequests(mappedRequests);
    } catch (err) {
      console.error('Failed to fetch withdrawal requests', err);
      setWithdrawalRequests([]);
    }
  };

  const fetchWithdrawableAmount = async () => {
    try {
      const response = await withdrawalsApi.getWithdrawableAmount();
      const amount = response.data?.data?.amount || 0;
      setWithdrawableAmount(amount);
    } catch (err) {
      console.error('Failed to fetch withdrawable amount', err);
    }
  };

  const fetchInstructorRevenue = async () => {
    try {
      const response = await instructorProfilesApi.getMyProfile();
      setTotalRevenue(response.data?.data?.totalEarnings || 0);
    } catch (err) {
      console.error('Failed to fetch instructor revenue', err);
      setTotalRevenue(0);
    }
  };

  const pendingWithdrawalAmount = withdrawalRequests
    .filter(request => !['Completed', 'Rejected'].includes(request.status))
    .reduce((sum, request) => sum + request.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Payment Management</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'bank'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'withdrawal'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Withdrawals
          </button>
        </div>

        <button
          onClick={() => loadData()}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
        >
          Refresh Data
        </button>

        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BankAccountForm onSuccess={() => fetchBankAccounts()} />
            </div>
            <div>
              <BankAccountList accounts={bankAccounts} onRefresh={() => fetchBankAccounts()} />
            </div>
          </div>
        )}

        {activeTab === 'withdrawal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Earnings</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                  </p>
                </div>
                <div className="bg-blue-50 p-5 rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-blue-700 uppercase">Current Balance</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawableAmount)}
                  </p>
                </div>
                <div className="bg-amber-50 p-5 rounded-lg shadow">
                  <h3 className="text-sm font-semibold text-amber-700 uppercase">Pending Requests</h3>
                  <p className="text-2xl font-bold text-amber-600 mt-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingWithdrawalAmount)}
                  </p>
                </div>
              </div>

              <RequestWithdrawalForm
                withdrawableAmount={withdrawableAmount}
                bankAccounts={bankAccounts}
                onSubmit={async (data) => {
                  try {
                    await withdrawalsApi.create(data);
                    await loadData();
                  } catch (err) {
                    console.error('Failed to create withdrawal', err);
                  }
                }}
              />
            </div>
            <div>
              <WithdrawalHistory requests={withdrawalRequests} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagementPage;
