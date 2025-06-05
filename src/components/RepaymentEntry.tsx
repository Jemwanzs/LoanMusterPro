import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Repayment } from '../context/LoanContext';

const RepaymentEntry: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    principalAmount: '',
    interestAmount: '',
    payer: {
      name: '',
      nationalId: '',
      mobile: ''
    },
    paymentChannel: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const runningLoans = (state.loans || []).filter(loan => loan.status === 'running');
  
  const filteredLoans = runningLoans.filter(loan => 
    loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.loanee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLoanData = runningLoans.find(loan => loan.loanNumber === selectedLoan);

  const formatNumberWithCommas = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumberFromString = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedLoan) newErrors.loan = 'Please select a loan';
    if (!formData.principalAmount && !formData.interestAmount) {
      newErrors.amount = 'Enter principal or interest amount';
    }
    if (!formData.payer.name) newErrors.payerName = 'Payer name is required';
    if (!formData.payer.nationalId) newErrors.payerNationalId = 'Payer National ID is required';
    if (!formData.payer.mobile) newErrors.payerMobile = 'Payer mobile is required';
    if (!formData.paymentChannel) newErrors.paymentChannel = 'Payment channel is required';

    // Validate amounts don't exceed balances
    if (selectedLoanData) {
      const principalAmount = parseNumberFromString(formData.principalAmount);
      const interestAmount = parseNumberFromString(formData.interestAmount);
      
      if (principalAmount > selectedLoanData.principalBalance) {
        newErrors.principalAmount = 'Amount exceeds principal balance';
      }
      if (interestAmount > selectedLoanData.interestBalance) {
        newErrors.interestAmount = 'Amount exceeds interest balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const newRepayment: Repayment = {
      id: Date.now().toString(),
      loanNumber: selectedLoan,
      date: formData.date,
      principalAmount: parseNumberFromString(formData.principalAmount),
      interestAmount: parseNumberFromString(formData.interestAmount),
      payer: formData.payer,
      paymentChannel: formData.paymentChannel
    };

    dispatch({ type: 'ADD_REPAYMENT', payload: newRepayment });
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      principalAmount: '',
      interestAmount: '',
      payer: {
        name: '',
        nationalId: '',
        mobile: ''
      },
      paymentChannel: ''
    });
    setSelectedLoan('');
    setSearchTerm('');
    
    alert('Repayment recorded successfully!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', 'KES ');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Record Repayment</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Loan Selection */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Loan</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Loan Number or Loanee Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Search loans..."
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredLoans.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {searchTerm ? 'No loans found matching your search' : 'No running loans available'}
              </p>
            ) : (
              filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoan(loan.loanNumber)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedLoan === loan.loanNumber
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{loan.loanNumber}</h3>
                      <p className="text-sm text-gray-600">{loan.loanee.name}</p>
                      <p className="text-sm text-gray-500">ID: {loan.loanee.nationalId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Principal Balance</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(loan.principalBalance)}</p>
                      <p className="text-sm text-gray-600 mt-1">Interest Balance</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(loan.interestBalance)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {errors.loan && <p className="text-red-500 text-sm mt-1">{errors.loan}</p>}
        </div>

        {/* Repayment Details */}
        {selectedLoanData && (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Repayment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({
                      ...formData,
                      date: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Principal Amount (KES)
                  </label>
                  <input
                    type="text"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      principalAmount: formatNumberWithCommas(e.target.value)
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.principalAmount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {formatCurrency(selectedLoanData.principalBalance)}
                  </p>
                  {errors.principalAmount && <p className="text-red-500 text-sm mt-1">{errors.principalAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Amount (KES)
                  </label>
                  <input
                    type="text"
                    value={formData.interestAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      interestAmount: formatNumberWithCommas(e.target.value)
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.interestAmount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {formatCurrency(selectedLoanData.interestBalance)}
                  </p>
                  {errors.interestAmount && <p className="text-red-500 text-sm mt-1">{errors.interestAmount}</p>}
                </div>
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            {/* Payer Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer Name
                  </label>
                  <input
                    type="text"
                    value={formData.payer.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      payer: { ...formData.payer, name: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.payerName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.payerName && <p className="text-red-500 text-sm mt-1">{errors.payerName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer National ID
                  </label>
                  <input
                    type="text"
                    value={formData.payer.nationalId}
                    onChange={(e) => setFormData({
                      ...formData,
                      payer: { ...formData.payer, nationalId: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.payerNationalId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12345678"
                  />
                  {errors.payerNationalId && <p className="text-red-500 text-sm mt-1">{errors.payerNationalId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.payer.mobile}
                    onChange={(e) => setFormData({
                      ...formData,
                      payer: { ...formData.payer, mobile: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.payerMobile ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+254 700 000 000"
                  />
                  {errors.payerMobile && <p className="text-red-500 text-sm mt-1">{errors.payerMobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Channel
                  </label>
                  <input
                    type="text"
                    value={formData.paymentChannel}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentChannel: e.target.value
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      errors.paymentChannel ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="M-Pesa, Bank Transfer, Cash, etc."
                  />
                  {errors.paymentChannel && <p className="text-red-500 text-sm mt-1">{errors.paymentChannel}</p>}
                </div>
              </div>
            </div>

            {/* Summary */}
            {(formData.principalAmount || formData.interestAmount) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Payment:</span>
                    <p className="font-semibold">
                      KES {(parseNumberFromString(formData.principalAmount) + parseNumberFromString(formData.interestAmount)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">New Principal Balance:</span>
                    <p className="font-semibold">
                      KES {(selectedLoanData.principalBalance - parseNumberFromString(formData.principalAmount)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">New Interest Balance:</span>
                    <p className="font-semibold">
                      KES {(selectedLoanData.interestBalance - parseNumberFromString(formData.interestAmount)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={!selectedLoan}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Record Repayment
          </button>
        </div>
      </form>
    </div>
  );
};

export default RepaymentEntry;