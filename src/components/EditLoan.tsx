
import React, { useState, useEffect } from 'react';
import { useLoanContext, Loan } from '../context/LoanContext';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface EditLoanProps {
  loan: Loan;
  onClose: () => void;
}

const EditLoan: React.FC<EditLoanProps> = ({ loan, onClose }) => {
  const { state, dispatch } = useLoanContext();
  const [formData, setFormData] = useState({
    amount: loan.amount,
    loanType: loan.loanType,
    repaymentPeriod: loan.repaymentPeriod,
    repaymentPeriodValue: loan.repaymentPeriodValue,
    issuanceDate: loan.issuanceDate,
    dueDate: loan.dueDate,
    interestRate: loan.interestRate,
    loanee: {
      name: loan.loanee.name,
      nationalId: loan.loanee.nationalId,
      mobile: loan.loanee.mobile,
      email: loan.loanee.email || '',
      employmentStatus: loan.loanee.employmentStatus
    }
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateDueDate = (issuanceDate: string, repaymentPeriod: string, repaymentPeriodValue: number) => {
    const date = new Date(issuanceDate);
    switch (repaymentPeriod) {
      case 'days':
        date.setDate(date.getDate() + repaymentPeriodValue);
        break;
      case 'weeks':
        date.setDate(date.getDate() + repaymentPeriodValue * 7);
        break;
      case 'months':
        date.setMonth(date.getMonth() + repaymentPeriodValue);
        break;
      default:
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const calculateInterest = (amount: number, interestRate: number, repaymentPeriodValue: number) => {
    return amount * (interestRate / 100) * repaymentPeriodValue;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('loanee.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        loanee: {
          ...prev.loanee,
          [field]: value
        }
      }));
    } else {
      let newDueDate = formData.dueDate;
      
      if (name === 'issuanceDate' || name === 'repaymentPeriod' || name === 'repaymentPeriodValue') {
        const period = name === 'repaymentPeriod' ? value : formData.repaymentPeriod;
        const periodValue = name === 'repaymentPeriodValue' ? parseInt(value) : formData.repaymentPeriodValue;
        const issueDate = name === 'issuanceDate' ? value : formData.issuanceDate;
        newDueDate = calculateDueDate(issueDate, period, periodValue);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        dueDate: newDueDate
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTotalInterest = calculateInterest(
        formData.amount,
        formData.interestRate,
        formData.repaymentPeriodValue
      );

      const updatedLoan: Loan = {
        ...loan,
        amount: formData.amount,
        loanType: formData.loanType,
        repaymentPeriod: formData.repaymentPeriod,
        repaymentPeriodValue: formData.repaymentPeriodValue,
        issuanceDate: formData.issuanceDate,
        dueDate: formData.dueDate,
        interestRate: formData.interestRate,
        totalInterest: newTotalInterest,
        expectedRepaymentAmount: formData.amount + newTotalInterest,
        principalBalance: formData.amount,
        interestBalance: newTotalInterest,
        loanee: formData.loanee
      };

      dispatch({
        type: 'UPDATE_LOAN',
        payload: updatedLoan
      });

      setSuccessMessage('Loan updated successfully!');
      setErrorMessage('');
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage('Error updating loan. Please try again.');
      setSuccessMessage('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', 'KES ');
  };

  const totalInterest = calculateInterest(formData.amount, formData.interestRate, formData.repaymentPeriodValue);
  const expectedRepayment = formData.amount + totalInterest;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Loan - {loan.loanNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">
            <CheckCircle className="w-5 h-5 inline-block align-middle mr-2" />
            <span className="inline-block align-middle">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
            <AlertCircle className="w-5 h-5 inline-block align-middle mr-2" />
            <span className="inline-block align-middle">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Borrower Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Borrower Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="loanee.name"
                  value={formData.loanee.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                <input
                  type="text"
                  name="loanee.nationalId"
                  value={formData.loanee.nationalId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                <input
                  type="text"
                  name="loanee.mobile"
                  value={formData.loanee.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="loanee.email"
                  value={formData.loanee.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount (KES)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="100"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  {state.settings.loanTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Period</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="repaymentPeriodValue"
                    value={formData.repaymentPeriodValue}
                    onChange={handleInputChange}
                    min="1"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                  <select
                    name="repaymentPeriod"
                    value={formData.repaymentPeriod}
                    onChange={handleInputChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuance Date</label>
                <input
                  type="date"
                  name="issuanceDate"
                  value={formData.issuanceDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Updated Loan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Principal Amount</p>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(formData.amount)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Interest</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(totalInterest)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Expected Repayment</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(expectedRepayment)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Loan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoan;