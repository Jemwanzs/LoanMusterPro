import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Loan {
  id: string;
  loanNumber: string;
  issuanceDate: string;
  amount: number;
  loanType: string;
  repaymentPeriod: 'months' | 'weeks' | 'days';
  repaymentPeriodValue: number;
  dueDate: string;
  expectedRepaymentAmount: number;
  interestRate: number;
  totalInterest: number;
  principalBalance: number;
  interestBalance: number;
  loanee: {
    name: string;
    nationalId: string;
    mobile: string;
    email?: string;
    employmentStatus: 'employed' | 'self-employed';
  };
  status: 'running' | 'repaid';
  lastRepaymentDate?: string;
  isOverdue?: boolean;
}

export interface Repayment {
  id: string;
  loanNumber: string;
  date: string;
  principalAmount: number;
  interestAmount: number;
  payer: {
    name: string;
    nationalId: string;
    mobile: string;
  };
  paymentChannel: string;
  notes?: string;
}

export interface Loanee {
  id: string;
  name: string;
  nationalId: string;
  mobile: string;
  email?: string;
  employmentStatus: 'employed' | 'self-employed';
  dateAdded: string;
  totalLoans: number;
  activeLoans: number;
}

export interface Settings {
  companyName: string;
  brandColor: string;
  logo?: string;
  defaultInterestRate: number;
  loanTypes: string[];
  paymentChannels: string[];
  repaymentPeriods: string[];
  loanNumberPrefix: string;
  loanNumberSuffix: string;
}

interface LoanState {
  loans: Loan[];
  repayments: Repayment[];
  loanees: Loanee[];
  settings: Settings;
  nextLoanNumber: number;
}

type LoanAction = 
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_LOAN'; payload: Loan }
  | { type: 'ADD_REPAYMENT'; payload: Repayment }
  | { type: 'ADD_LOANEE'; payload: Loanee }
  | { type: 'UPDATE_LOANEE'; payload: { id: string; updates: Partial<Loanee> } }
  | { type: 'DELETE_LOANEE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'LOAD_DATA'; payload: LoanState }
  | { type: 'UPDATE_LOAN_STATUS'; payload: { loanNumber: string; status: 'running' | 'repaid' } };

const initialState: LoanState = {
  loans: [],
  repayments: [],
  loanees: [],
  settings: {
    companyName: 'JMS Financial Services',
    brandColor: '#0F766E',
    defaultInterestRate: 15,
    loanTypes: ['Personal Loan', 'Business Loan', 'Emergency Loan', 'Education Loan'],
    paymentChannels: ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque'],
    repaymentPeriods: ['Days', 'Weeks', 'Months'],
    loanNumberPrefix: 'Ln_',
    loanNumberSuffix: 'A'
  },
  nextLoanNumber: 1
};

// Helper function to generate loan number
export const generateLoanNumber = (nextNumber: number, prefix: string, suffix: string): string => {
  const paddedNumber = nextNumber.toString().padStart(5, '0');
  return `${prefix}${paddedNumber}${suffix}`;
};

function loanReducer(state: LoanState, action: LoanAction): LoanState {
  switch (action.type) {
    case 'ADD_LOAN':
      return {
        ...state,
        loans: [...state.loans, action.payload],
        nextLoanNumber: state.nextLoanNumber + 1
      };
    case 'UPDATE_LOAN':
      return {
        ...state,
        loans: state.loans.map(loan => 
          loan.id === action.payload.id ? action.payload : loan
        )
      };
    case 'ADD_REPAYMENT':
      const updatedLoans = state.loans.map(loan => {
        if (loan.loanNumber === action.payload.loanNumber) {
          const newPrincipalBalance = Math.max(0, loan.principalBalance - action.payload.principalAmount);
          const newInterestBalance = Math.max(0, loan.interestBalance - action.payload.interestAmount);
          const newStatus: 'running' | 'repaid' = newPrincipalBalance === 0 && newInterestBalance === 0 ? 'repaid' : 'running';
          
          return {
            ...loan,
            principalBalance: newPrincipalBalance,
            interestBalance: newInterestBalance,
            status: newStatus,
            lastRepaymentDate: action.payload.date
          };
        }
        return loan;
      });
      
      return {
        ...state,
        loans: updatedLoans,
        repayments: [...state.repayments, action.payload]
      };
    case 'ADD_LOANEE':
      return {
        ...state,
        loanees: [...(state.loanees || []), action.payload]
      };
    case 'UPDATE_LOANEE':
      return {
        ...state,
        loanees: (state.loanees || []).map(loanee => 
          loanee.id === action.payload.id 
            ? { ...loanee, ...action.payload.updates }
            : loanee
        )
      };
    case 'DELETE_LOANEE':
      return {
        ...state,
        loanees: (state.loanees || []).filter(loanee => loanee.id !== action.payload)
      };
    case 'UPDATE_SETTINGS':
      const updatedSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: updatedSettings
      };
    case 'LOAD_DATA':
      return {
        ...initialState,
        ...action.payload,
        loans: (action.payload.loans || []).map(loan => ({
          ...loan,
          loanType: loan.loanType || 'Personal Loan' // Default for existing loans
        })),
        repayments: action.payload.repayments || [],
        loanees: action.payload.loanees || [],
        settings: { 
          ...initialState.settings, 
          ...(action.payload.settings || {})
        }
      };
    case 'UPDATE_LOAN_STATUS':
      return {
        ...state,
        loans: state.loans.map(loan => 
          loan.loanNumber === action.payload.loanNumber 
            ? { ...loan, status: action.payload.status }
            : loan
        )
      };
    default:
      return state;
  }
}

const LoanContext = createContext<{
  state: LoanState;
  dispatch: React.Dispatch<LoanAction>;
} | null>(null);

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('loanSystemData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('loanSystemData', JSON.stringify(state));
  }, [state]);

  return (
    <LoanContext.Provider value={{ state, dispatch }}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
