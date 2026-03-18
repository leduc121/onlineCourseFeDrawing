import React, { useState } from 'react';
import { bankAccountsApi } from '../api';

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  accountType: string;
  isVerified: boolean;
  isDefault: boolean;
}

interface BankAccountFormProps {
  onSuccess?: () => void;
}

export const BankAccountForm: React.FC<BankAccountFormProps> = ({
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankName: '',
    accountHolder: '',
    accountType: 'Checking',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await bankAccountsApi.create(formData);
      setSuccess('Bank account added successfully!');
      setFormData({ accountNumber: '', bankName: '', accountHolder: '', accountType: 'Checking' });
      setTimeout(() => {
        setSuccess('');
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add bank account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add Bank Account</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
          <input
            type="text"
            name="accountHolder"
            value={formData.accountHolder}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 border p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 border p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account Number</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 border p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account Type</label>
          <select
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 border p-2"
          >
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Business">Business</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Adding...' : 'Add Account'}
        </button>
      </form>
    </div>
  );
};

export const BankAccountList: React.FC<{ accounts: BankAccount[]; onRefresh?: () => void }> = ({
  accounts,
  onRefresh
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetDefault = async (id: string) => {
    setIsLoading(true);
    setError('');
    try {
      await bankAccountsApi.setDefault(id);
      onRefresh?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set default account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    setIsLoading(true);
    setError('');
    try {
      await bankAccountsApi.delete(id);
      onRefresh?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bank Accounts</h2>
      {error && <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>}
      {accounts.length === 0 ? (
        <p className="text-gray-500">No bank accounts added yet</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accounts.map(account => (
            <div key={account.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{account.bankName}</p>
                <p className="text-sm text-gray-600">Account: ...{account.accountNumber.slice(-4)}</p>
                <p className="text-sm text-gray-600">Type: {account.accountType}</p>
                {account.isDefault && <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">Default</span>}
                {!account.isVerified && <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-2 ml-2">Pending Verification</span>}
              </div>
              <div className="space-x-2">
                {!account.isDefault && (
                  <button
                    onClick={() => handleSetDefault(account.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(account.id)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
