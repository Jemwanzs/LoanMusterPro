
import React, { useState } from 'react';
import RecordRepayment from './RecordRepayment';
import InterestPayments from './InterestPayments';
import PrincipalPayments from './PrincipalPayments';

const Transactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('record');

  const tabs = [
    { id: 'record', label: 'Record Loan Repayment' },
    { id: 'interest', label: 'Interest Payments' },
    { id: 'principal', label: 'Principal Payments' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'record':
        return <RecordRepayment />;
      case 'interest':
        return <InterestPayments />;
      case 'principal':
        return <PrincipalPayments />;
      default:
        return <RecordRepayment />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Transactions;