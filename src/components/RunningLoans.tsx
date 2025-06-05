import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Edit, Eye } from 'lucide-react';
import EditLoan from './EditLoan';

interface RunningLoansProps {
  onViewStatement: (loanNumber: string) => void;
}

const RunningLoans: React.FC<RunningLoansProps> = ({ onViewStatement }) => {
  const { state } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLoan, setEditingLoan] = useState<any>(null);

  const runningLoans = state.loans
    .filter(loan => loan.status === 'running')
    .sort((a, b) => new Date(a.issuanceDate).getTime() - new Date(b.issuanceDate).getTime());

  const filteredLoans = runningLoans.filter(loan =>
    loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.loanee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.loanee.nationalId.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', 'KES ');
  };

  const isOverdue = (loan: any) => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return today > dueDate;
  };

  const getRepaymentStatus = (loan: any) => {
    if (!loan.lastRepaymentDate) return 'No payments made';
    
    const lastPayment = new Date(loan.lastRepaymentDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24));
    
    let expectedDays;
    switch (loan.repaymentPeriod) {
      case 'weeks':
        expectedDays = 7;
        break;
      case 'days':
        expectedDays = 1;
        break;
      case 'months':
      default:
        expectedDays = 30;
        break;
    }
    
    if (daysDiff > expectedDays) {
      return `${daysDiff} days since last payment`;
    }
    
    return `Last payment: ${daysDiff} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Running Loans</h1>
        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
          {runningLoans.length} Active Loans
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Loans
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Search by loan number, name, or ID..."
            />
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No loans found matching your search' : 'No running loans available'}
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                isOverdue(loan) ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              {isOverdue(loan) && (
                <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-800 text-sm font-medium flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    OVERDUE - Payment expected by {new Date(loan.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Loan Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{loan.loanNumber}</h3>
                    {isOverdue(loan) && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Borrower:</span> {loan.loanee.name}</p>
                    <p><span className="text-gray-600">ID:</span> {loan.loanee.nationalId}</p>
                    <p><span className="text-gray-600">Mobile:</span> {loan.loanee.mobile}</p>
                    <p><span className="text-gray-600">Issue Date:</span> {new Date(loan.issuanceDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Due Date:</span> {new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Financial Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Original Amount:</span> {formatCurrency(loan.amount)}</p>
                    <p><span className="text-gray-600">Interest Rate:</span> {loan.interestRate}%</p>
                    <p><span className="text-gray-600">Total Interest:</span> {formatCurrency(loan.totalInterest)}</p>
                    <p><span className="text-gray-600">Expected Repayment:</span> {formatCurrency(loan.expectedRepaymentAmount)}</p>
                    <p><span className="text-gray-600">Period:</span> {loan.repaymentPeriodValue} {loan.repaymentPeriod}</p>
                  </div>
                </div>

                {/* Balance Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Current Balance</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Principal Balance:</span> 
                      <span className="font-semibold text-blue-600 ml-1">{formatCurrency(loan.principalBalance)}</span>
                    </p>
                    <p><span className="text-gray-600">Interest Balance:</span> 
                      <span className="font-semibold text-green-600 ml-1">{formatCurrency(loan.interestBalance)}</span>
                    </p>
                    <p><span className="text-gray-600">Total Outstanding:</span> 
                      <span className="font-semibold text-gray-900 ml-1">
                        {formatCurrency(loan.principalBalance + loan.interestBalance)}
                      </span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">{getRepaymentStatus(loan)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Actions:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingLoan(loan)}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => onViewStatement(loan.loanNumber)}
                      className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Statement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {runningLoans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(runningLoans.reduce((sum, loan) => sum + loan.principalBalance, 0))}
              </p>
              <p className="text-sm text-gray-600">Outstanding Principal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(runningLoans.reduce((sum, loan) => sum + loan.interestBalance, 0))}
              </p>
              <p className="text-sm text-gray-600">Outstanding Interest</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(runningLoans.reduce((sum, loan) => sum + loan.principalBalance + loan.interestBalance, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Outstanding</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {runningLoans.filter(loan => isOverdue(loan)).length}
              </p>
              <p className="text-sm text-gray-600">Overdue Loans</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Loan Modal */}
      {editingLoan && (
        <EditLoan 
          loan={editingLoan} 
          onClose={() => setEditingLoan(null)} 
        />
      )}
    </div>
  );
};

export default RunningLoans;