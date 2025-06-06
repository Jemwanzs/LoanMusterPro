
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';

const InterestPayments: React.FC = () => {
  const { state } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');

  const interestPayments = state.repayments.filter(repayment => repayment.interestAmount > 0);

  const filteredPayments = interestPayments.filter(payment =>
    payment.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInterestPaid = interestPayments.reduce((sum, payment) => sum + payment.interestAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Interest Payments</h3>
        <div className="text-sm text-gray-600">
          Total Interest Collected: <span className="font-semibold">KES {totalInterestPaid.toLocaleString()}</span>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by loan number or payer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Channel
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.loanNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{payment.payer.name}</div>
                      <div className="text-gray-500">{payment.payer.mobile}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    KES {payment.interestAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.paymentChannel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No interest payments found matching your search' : 'No interest payments recorded yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterestPayments;
