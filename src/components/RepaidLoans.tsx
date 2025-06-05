
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';

interface RepaidLoansProps {
  onViewStatement: (loanNumber: string) => void;
}

const RepaidLoans: React.FC<RepaidLoansProps> = ({ onViewStatement }) => {
  const { state } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');

  const repaidLoans = state.loans
    .filter(loan => loan.status === 'repaid')
    .sort((a, b) => new Date(b.lastRepaymentDate || b.issuanceDate).getTime() - new Date(a.lastRepaymentDate || a.issuanceDate).getTime());

  const filteredLoans = repaidLoans.filter(loan =>
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

  const calculateLoanDuration = (loan: any) => {
    const startDate = new Date(loan.issuanceDate);
    const endDate = new Date(loan.lastRepaymentDate || loan.dueDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fully Repaid Loans</h1>
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {repaidLoans.length} Completed Loans
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
              {searchTerm ? 'No loans found matching your search' : 'No fully repaid loans yet'}
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Loan Info */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{loan.loanNumber}</h3>
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      COMPLETED
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Borrower:</span> {loan.loanee.name}</p>
                    <p><span className="text-gray-600">ID:</span> {loan.loanee.nationalId}</p>
                    <p><span className="text-gray-600">Mobile:</span> {loan.loanee.mobile}</p>
                    <p><span className="text-gray-600">Issue Date:</span> {new Date(loan.issuanceDate).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Final Payment:</span> {loan.lastRepaymentDate ? new Date(loan.lastRepaymentDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Loan Terms</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Principal Amount:</span> {formatCurrency(loan.amount)}</p>
                    <p><span className="text-gray-600">Interest Rate:</span> {loan.interestRate}%</p>
                    <p><span className="text-gray-600">Total Interest:</span> {formatCurrency(loan.totalInterest)}</p>
                    <p><span className="text-gray-600">Total Repaid:</span> 
                      <span className="font-semibold text-green-600 ml-1">
                        {formatCurrency(loan.amount + loan.totalInterest)}
                      </span>
                    </p>
                    <p><span className="text-gray-600">Term:</span> {loan.repaymentPeriodValue} {loan.repaymentPeriod}</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Loan Duration:</span> {calculateLoanDuration(loan)}</p>
                    <p><span className="text-gray-600">Employment:</span> 
                      <span className="capitalize ml-1">{loan.loanee.employmentStatus.replace('-', ' ')}</span>
                    </p>
                    <p><span className="text-gray-600">Expected Due:</span> {new Date(loan.dueDate).toLocaleDateString()}</p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Loan fully repaid
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repayment History Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Repayment History:</span>
                  <button 
                    onClick={() => onViewStatement(loan.loanNumber)}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View Statement
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {repaidLoans.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Repaid Loans Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(repaidLoans.reduce((sum, loan) => sum + loan.amount, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Principal Repaid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(repaidLoans.reduce((sum, loan) => sum + loan.totalInterest, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Interest Collected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(repaidLoans.reduce((sum, loan) => sum + loan.amount + loan.totalInterest, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Amount Collected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">
                {((repaidLoans.reduce((sum, loan) => sum + loan.totalInterest, 0) / 
                   repaidLoans.reduce((sum, loan) => sum + loan.amount, 0)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Avg Interest Return</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepaidLoans;