import React, { useEffect, useState } from 'react';

interface WithdrawalRequest {
  id: string;
  bankAccountId?: string;
  amount: number;
  status: string;
  bankAccountNumber?: string;
  bankName?: string;
  processingFee?: number;
  createdAt?: string;
  approvedAt?: string;
}

interface RequestWithdrawalFormProps {
  withdrawableAmount: number;
  bankAccounts: any[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const RequestWithdrawalForm: React.FC<RequestWithdrawalFormProps> = ({
  withdrawableAmount,
  bankAccounts,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    bankAccountId: bankAccounts[0]?.id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!formData.bankAccountId && bankAccounts.length > 0) {
      setFormData(prev => ({
        ...prev,
        bankAccountId: bankAccounts[0].id
      }));
    }
  }, [bankAccounts, formData.bankAccountId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount);

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amount > withdrawableAmount) {
      const maxFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawableAmount);
      newErrors.amount = `Cannot exceed withdrawable amount (${maxFormatted})`;
    }

    if (!formData.bankAccountId) {
      newErrors.bankAccountId = 'Bank account is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      amount: parseFloat(formData.amount),
      bankAccountId: formData.bankAccountId
    });
    setFormData({ amount: '', bankAccountId: bankAccounts[0]?.id || '' });
  };

  const amount = parseFloat(formData.amount) || 0;
  const processingFee = amount * 0.02;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold">Request Withdrawal</h2>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Withdrawable Amount</p>
        <p className="text-2xl font-bold text-blue-600">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawableAmount)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount to Withdraw</label>
        <div className="mt-1 relative">
          <span className="absolute left-3 top-2 text-gray-500">VND</span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="1"
            min="0"
            placeholder="0"
            className={`block w-full rounded-md border p-2 pl-12 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Bank Account</label>
        <select
          name="bankAccountId"
          value={formData.bankAccountId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        >
          {bankAccounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.bankName} - ...{String(account.accountNumber || '').slice(-4)}
            </option>
          ))}
        </select>
        {errors.bankAccountId && <p className="text-red-600 text-sm mt-1">{errors.bankAccountId}</p>}
      </div>

      {amount > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount:</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Processing Fee (2%):</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(processingFee)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>You'll receive:</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount - processingFee)}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || bankAccounts.length === 0}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Processing...' : 'Request Withdrawal'}
      </button>
    </form>
  );
};

export const WithdrawalHistory: React.FC<{ requests: WithdrawalRequest[] }> = ({ requests }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Withdrawal History</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No withdrawal requests</p>
      ) : (
        <div className="space-y-2">
          {requests.map(request => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{formatCurrency(request.amount)}</p>
                  <p className="text-sm text-gray-600">
                    {request.bankName || 'Bank account'}
                    {request.bankAccountNumber ? ` - ...${request.bankAccountNumber.slice(-4)}` : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Processing fee: {formatCurrency(request.processingFee || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    request.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString('vi-VN') : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
