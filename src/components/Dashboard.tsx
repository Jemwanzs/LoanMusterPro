import React from 'react';
import { useLoanContext } from '../context/LoanContext';

const Dashboard: React.FC = () => {
  const { state } = useLoanContext();
  const { loans, repayments } = state;

  // Calculate summary statistics
  const runningLoans = (loans || []).filter(loan => loan.status === 'running');
  const repaidLoans = (loans || []).filter(loan => loan.status === 'repaid');
  
  const totalPrincipalIssued = (loans || []).reduce((sum, loan) => sum + loan.amount, 0);
  const totalInterestCharged = (loans || []).reduce((sum, loan) => sum + loan.totalInterest, 0);
  const totalOutstandingPrincipal = runningLoans.reduce((sum, loan) => sum + loan.principalBalance, 0);
  const totalOutstandingInterest = runningLoans.reduce((sum, loan) => sum + loan.interestBalance, 0);
  
  const totalPrincipalReceived = (repayments || []).reduce((sum, repayment) => sum + repayment.principalAmount, 0);
  const totalInterestReceived = (repayments || []).reduce((sum, repayment) => sum + repayment.interestAmount, 0);

  const recentLoans = (loans || []).slice(-3).reverse();

  // Calculate overdue loans
  const overdueLoans = runningLoans.filter(loan => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return today > dueDate;
  });

  // Calculate best performing loan types - now using actual loan types
  const loanTypePerformance = (loans || []).reduce((acc, loan) => {
    const loanType = loan.loanType || 'Unknown';
    if (!acc[loanType]) {
      acc[loanType] = { count: 0, totalAmount: 0, repaid: 0 };
    }
    acc[loanType].count++;
    acc[loanType].totalAmount += loan.amount;
    if (loan.status === 'repaid') {
      acc[loanType].repaid++;
    }
    return acc;
  }, {} as Record<string, { count: number; totalAmount: number; repaid: number }>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', 'KES ');
  };

  const summaryCards = [
    {
      title: 'Total Principal Issued',
      value: formatCurrency(totalPrincipalIssued),
      icon: '💰',
      color: 'bg-blue-500',
      change: `${(loans || []).length} loans`
    },
    {
      title: 'Total Interest Charged',
      value: formatCurrency(totalInterestCharged),
      icon: '📈',
      color: 'bg-green-500',
      change: 'All time'
    },
    {
      title: 'Outstanding Principal',
      value: formatCurrency(totalOutstandingPrincipal),
      icon: '⏳',
      color: 'bg-orange-500',
      change: `${runningLoans.length} active loans`
    },
    {
      title: 'Outstanding Interest',
      value: formatCurrency(totalOutstandingInterest),
      icon: '🔄',
      color: 'bg-purple-500',
      change: 'Interest due'
    },
    {
      title: 'Principal Collected',
      value: formatCurrency(totalPrincipalReceived),
      icon: '✅',
      color: 'bg-teal-500',
      change: `${(repayments || []).length} payments`
    },
    {
      title: 'Interest Collected',
      value: formatCurrency(totalInterestReceived),
      icon: '💎',
      color: 'bg-indigo-500',
      change: 'Revenue earned'
    }
  ];
  //return (
    //<div className="space-y-6">
      //<div className="flex items-center justify-between">
        //<div>
          //<h1 className="text-2xl font-bold text-gray-900">
            //<span 
              //className="font-bold"
              //style={{ color: `hsl(var(--brand-primary))` }}
            //>
              //{state.settings.companyName}
            //</span>
            //{' '}Dashboard
          //</h1>
          //<p className="text-gray-600 mt-1 text-sm">
            //{new Date().toLocaleDateString('en-US', { 
              //weekday: 'long', 
              //year: 'numeric', 
              //month: 'long', 
              //day: 'numeric' 
            //})}
          //</p>
        //</div>
        //{overdueLoans.length > 0 && (
          //<div className="bg-red-100 border border-red-300 rounded-lg p-3">
            //<p className="text-red-800 font-medium text-sm">⚠️ {overdueLoans.length} overdue loans</p>
          //</div>
        //)}
      //</div>
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span 
                  className="font-bold"
                  style={{ color: `hsl(var(--brand-primary))` }}
                >
                  {state.settings.companyName}
                </span>
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            {overdueLoans.length > 0 && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-800 font-medium text-sm">⚠️ {overdueLoans.length} overdue loans</p>
              </div>
            )}
          </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`${card.color} rounded-lg p-3 text-white text-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Portfolio Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Running Loans</span>
              <span className="font-semibold text-orange-600">{runningLoans.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Fully Repaid Loans</span>
              <span className="font-semibold text-green-600">{repaidLoans.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Overdue Loans</span>
              <span className="font-semibold text-red-600">{overdueLoans.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Total Loanees</span>
              <span className="font-semibold text-gray-900">{(state.loanees || []).length}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600 text-sm">Portfolio Value</span>
              <span className="font-semibold" style={{ color: `hsl(var(--brand-primary))` }}>
                {formatCurrency(totalPrincipalIssued + totalInterestCharged)}
              </span>
            </div>
          </div>
        </div>

        {/* Best Performing Loan Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Loan Performance by Type</h2>
          {Object.keys(loanTypePerformance).length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(loanTypePerformance).map(([type, data]) => (
                <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{type}</p>
                    <p className="text-xs text-gray-600">{data.count} loans • {formatCurrency(data.totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 text-sm">
                      {data.count > 0 ? Math.round((data.repaid / data.count) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500">repaid</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Loans */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Last 3 Loans Issued</h2>
          {recentLoans.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">No loans issued yet</p>
          ) : (
            <div className="space-y-3">
              {recentLoans.map((loan) => (
                <div key={loan.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{loan.loanNumber}</p>
                    <p className="text-xs text-gray-600">{loan.loanee.name}</p>
                    <p className="text-xs text-gray-500">{new Date(loan.issuanceDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{formatCurrency(loan.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      loan.status === 'running' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {totalPrincipalIssued > 0 
                ? ((totalPrincipalReceived / totalPrincipalIssued) * 100).toFixed(1)
                : '0'
              }%
            </p>
            <p className="text-xs text-gray-600">Collection Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">
              {(loans || []).length > 0 
                ? ((repaidLoans.length / (loans || []).length) * 100).toFixed(1)
                : '0'
              }%
            </p>
            <p className="text-xs text-gray-600">Loan Completion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(totalOutstandingPrincipal + totalOutstandingInterest)}
            </p>
            <p className="text-xs text-gray-600">Total Outstanding</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">
              {totalInterestCharged > 0 
                ? ((totalInterestReceived / totalInterestCharged) * 100).toFixed(1)
                : '0'
              }%
            </p>
            <p className="text-xs text-gray-600">Interest Collection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;