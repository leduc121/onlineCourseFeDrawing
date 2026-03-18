import { useState } from 'react';
import WithdrawalsManagement from '../components/WithdrawalsManagement';

type TabType = 'withdrawals' | 'users' | 'courses' | 'reports';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('withdrawals');

  const tabs: { label: string; value: TabType }[] = [
    { label: 'Withdrawals', value: 'withdrawals' },
    { label: 'Users', value: 'users' },
    { label: 'Courses', value: 'courses' },
    { label: 'Reports', value: 'reports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage platform content and withdrawals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'withdrawals' && <WithdrawalsManagement />}
        {activeTab === 'users' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Users management coming soon...</p>
          </div>
        )}
        {activeTab === 'courses' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Courses management coming soon...</p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Reports coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
