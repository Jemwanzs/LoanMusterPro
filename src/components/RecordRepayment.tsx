
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Repayment } from '../context/LoanContext';
import { Search } from 'lucide-react';

const RecordRepayment: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [formData, setFormData] = useState({
    loanNumber: '',
    date: new Date().toISOString().split('T')[0],
    principalAmount: '',
    interestAmount: '',
    paymentChannel: '',
    notes: ''
  });

  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loanSearchTerm, setLoanSearchTerm] = useState('');
  const [showLoanSearch, setShowLoanSearch] = useState(false);

  const runningLoans = state.loans.filter(loan => loan.status === 'running');
  const filteredLoans = runningLoans.filter(loan =>
    loan.loanNumber.toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
    loan.loanee.name.toLowerCase().includes(loanSearchTerm.toLowerCase()) ||
    loan.loanee.nationalId.includes(loanSearchTerm)
  );

  const formatNumberWithCommas = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumberFromString = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const selectLoan = (loan: any) => {
    setSelectedLoan(loan);
    setFormData({
      ...formData,
      loanNumber: loan.loanNumber
    });
    setShowLoanSearch(false);
    setLoanSearchTerm('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.loanNumber) newErrors.loanNumber = 'Loan number is required';
    if (!formData.date) newErrors.date = 'Payment date is required';
    if (!formData.principalAmount && !formData.interestAmount) {
      newErrors.amount = 'Either principal or interest amount is required';
    }
    if (!formData.paymentChannel) newErrors.paymentChannel = 'Payment channel is required';

    // Check if payment date is in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.date > today) {
      newErrors.date = 'Payment date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const principalAmount = parseNumberFromString(formData.principalAmount);
    const interestAmount = parseNumberFromString(formData.interestAmount);

    const newRepayment: Repayment = {
      id: Date.now().toString(),
      loanNumber: formData.loanNumber,
      date: formData.date,
      principalAmount,
      interestAmount,
      payer: selectedLoan ? {
        name: selectedLoan.loanee.name,
        nationalId: selectedLoan.loanee.nationalId,
        mobile: selectedLoan.loanee.mobile
      } : {
        name: 'Unknown',
        nationalId: 'Unknown',
        mobile: 'Unknown'
      },
      paymentChannel: formData.paymentChannel,
      notes: formData.notes
    };

    dispatch({ type: 'ADD_REPAYMENT', payload: newRepayment });
    
    // Reset form
    setFormData({
      loanNumber: '',
      date: new Date().toISOString().split('T')[0],
      principalAmount: '',
      interestAmount: '',
      paymentChannel: '',
      notes: ''
    });
    setSelectedLoan(null);
    
    alert('Repayment recorded successfully!');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Loan</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search loans by loan number, loanee name, or ID..."
              value={loanSearchTerm}
              onChange={(e) => {
                setLoanSearchTerm(e.target.value);
                setShowLoanSearch(e.target.value.length > 0);
              }}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            
            {showLoanSearch && filteredLoans.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredLoans.map((loan) => (
                  <button
                    key={loan.id}
                    type="button"
                    onClick={() => selectLoan(loan)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{loan.loanNumber}</div>
                    <div className="text-sm text-gray-500">
                      {loan.loanee.name} • Principal: KES {loan.principalBalance.toLocaleString()} • Interest: KES {loan.interestBalance.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.loanNumber && <p className="text-red-500 text-sm mt-1">{errors.loanNumber}</p>}
        </div>

        {/* Selected Loan Info */}
        {selectedLoan && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Selected Loan: {selectedLoan.loanNumber}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Loanee:</span>
                <p className="font-medium">{selectedLoan.loanee.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Principal Balance:</span>
                <p className="font-medium">KES {selectedLoan.principalBalance.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Interest Balance:</span>
                <p className="font-medium">KES {selectedLoan.interestBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.date}
                max={today}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Channel
              </label>
              <select
                value={formData.paymentChannel}
                onChange={(e) => setFormData({ ...formData, paymentChannel: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.paymentChannel ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select payment channel</option>
                {state.settings.paymentChannels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
              {errors.paymentChannel && <p className="text-red-500 text-sm mt-1">{errors.paymentChannel}</p>}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="Add any additional notes about this payment..."
              />
            </div>
          </div>
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold"
          >
            Record Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordRepayment;