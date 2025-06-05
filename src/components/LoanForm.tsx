
import React from 'react';
import { useLoanContext } from '../context/LoanContext';

interface LoanFormProps {
  loanType: string;
  setLoanType: (type: string) => void;
  repaymentPeriod: string;
  setRepaymentPeriod: (period: string) => void;
  children?: React.ReactNode;
}

const LoanForm: React.FC<LoanFormProps> = ({ 
  loanType, 
  setLoanType, 
  repaymentPeriod, 
  setRepaymentPeriod,
  children 
}) => {
  const { state } = useLoanContext();

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Type
        </label>
        <select
          value={loanType}
          onChange={(e) => setLoanType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          required
        >
          <option value="">Select loan type</option>
          {state.settings.loanTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repayment Period
        </label>
        <select
          value={repaymentPeriod}
          onChange={(e) => setRepaymentPeriod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          required
        >
          <option value="">Select period</option>
          {(state.settings.repaymentPeriods || ['Days', 'Weeks', 'Months']).map((period) => (
            <option key={period.toLowerCase()} value={period.toLowerCase()}>
              {period}
            </option>
          ))}
        </select>
      </div>

      {children}
    </>
  );
};

export default LoanForm;