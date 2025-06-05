
import React, { useState } from 'react';
import { useLoanContext, generateLoanNumber } from '../context/LoanContext';
import { Plus, Search } from 'lucide-react';

const LoanIssuance: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoanee, setSelectedLoanee] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    loanType: state.settings.loanTypes[0] || '',
    repaymentPeriod: 'months' as 'months' | 'weeks' | 'days',
    repaymentPeriodValue: '',
    interestRate: state.settings.defaultInterestRate.toString(),
    issuanceDate: new Date().toISOString().split('T')[0]
  });

  const filteredLoanees = state.loanees.filter(loanee =>
    loanee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loanee.nationalId.includes(searchTerm) ||
    loanee.mobile.includes(searchTerm)
  );

  const selectLoanee = (loanee: any) => {
    setSelectedLoanee(loanee);
    setSearchTerm('');
  };

  const clearLoanee = () => {
    setSelectedLoanee(null);
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLoanee) {
      alert('Please select a loanee');
      return;
    }

    const amount = parseFloat(formData.amount);
    const interestRate = parseFloat(formData.interestRate);
    const totalInterest = (amount * interestRate) / 100;

    // Calculate due date
    const issuanceDate = new Date(formData.issuanceDate);
    const repaymentPeriodValue = parseInt(formData.repaymentPeriodValue);
    let dueDate = new Date(issuanceDate);

    if (formData.repaymentPeriod === 'months') {
      dueDate.setMonth(dueDate.getMonth() + repaymentPeriodValue);
    } else if (formData.repaymentPeriod === 'weeks') {
      dueDate.setDate(dueDate.getDate() + (repaymentPeriodValue * 7));
    } else {
      dueDate.setDate(dueDate.getDate() + repaymentPeriodValue);
    }

    // Generate loan number using settings
    const loanNumber = generateLoanNumber(
      state.nextLoanNumber, 
      state.settings.loanNumberPrefix, 
      state.settings.loanNumberSuffix
    );

    const loan = {
      id: Date.now().toString(),
      loanNumber,
      issuanceDate: formData.issuanceDate,
      amount,
      loanType: formData.loanType,
      repaymentPeriod: formData.repaymentPeriod,
      repaymentPeriodValue,
      dueDate: dueDate.toISOString().split('T')[0],
      expectedRepaymentAmount: amount + totalInterest,
      interestRate,
      totalInterest,
      principalBalance: amount,
      interestBalance: totalInterest,
      loanee: {
        name: selectedLoanee.name,
        nationalId: selectedLoanee.nationalId,
        mobile: selectedLoanee.mobile,
        email: selectedLoanee.email,
        employmentStatus: selectedLoanee.employmentStatus
      },
      status: 'running' as const
    };

    dispatch({ type: 'ADD_LOAN', payload: loan });

    // Reset form
    setFormData({
      amount: '',
      loanType: state.settings.loanTypes[0] || '',
      repaymentPeriod: 'months',
      repaymentPeriodValue: '',
      interestRate: state.settings.defaultInterestRate.toString(),
      issuanceDate: new Date().toISOString().split('T')[0]
    });
    setSelectedLoanee(null);

    alert(`Loan ${loanNumber} issued successfully!`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Issue New Loan</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loanee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Loanee *
            </label>
            {selectedLoanee ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div>
                  <p className="font-medium text-green-900">{selectedLoanee.name}</p>
                  <p className="text-sm text-green-700">ID: {selectedLoanee.nationalId} | Mobile: {selectedLoanee.mobile}</p>
                </div>
                <button
                  type="button"
                  onClick={clearLoanee}
                  className="text-green-600 hover:text-green-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                {searchTerm && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredLoanees.length > 0 ? (
                      filteredLoanees.map((loanee) => (
                        <div
                          key={loanee.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectLoanee(loanee)}
                        >
                          <p className="font-medium text-gray-900">{loanee.name}</p>
                          <p className="text-sm text-gray-600">ID: {loanee.nationalId} | Mobile: {loanee.mobile}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">
                        No loanees found. Add loanees in Settings → Loanees.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter loan amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Type *
              </label>
              <select
                required
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {state.settings.loanTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter interest rate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuance Date *
              </label>
              <input
                type="date"
                required
                max={today}
                value={formData.issuanceDate}
                onChange={(e) => setFormData({ ...formData, issuanceDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repayment Period *
              </label>
              <select
                required
                value={formData.repaymentPeriod}
                onChange={(e) => setFormData({ ...formData, repaymentPeriod: e.target.value as 'months' | 'weeks' | 'days' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repayment Period Value *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.repaymentPeriodValue}
                onChange={(e) => setFormData({ ...formData, repaymentPeriodValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={`Number of ${formData.repaymentPeriod}`}
              />
            </div>
          </div>

          {/* Loan Summary */}
          {formData.amount && formData.interestRate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Loan Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Principal Amount</p>
                  <p className="font-medium">KES {parseFloat(formData.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Interest ({formData.interestRate}%)</p>
                  <p className="font-medium">KES {((parseFloat(formData.amount) * parseFloat(formData.interestRate)) / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Expected</p>
                  <p className="font-medium">KES {(parseFloat(formData.amount) + (parseFloat(formData.amount) * parseFloat(formData.interestRate)) / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Next Loan Number</p>
                  <p className="font-medium">{generateLoanNumber(state.nextLoanNumber, state.settings.loanNumberPrefix, state.settings.loanNumberSuffix)}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedLoanee}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Issue Loan
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoanIssuance;