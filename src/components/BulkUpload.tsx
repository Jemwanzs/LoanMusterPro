import React, { useState } from 'react';
import { useLoanContext, generateLoanNumber } from '../context/LoanContext';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkUploadProps {
  type: 'loans' | 'repayments';
}

const BulkUpload: React.FC<BulkUploadProps> = ({ type }) => {
  const { state, dispatch } = useLoanContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    errors: string[];
    newLoanees: number;
  } | null>(null);

  const downloadTemplate = () => {
    let headers: string[];
    let sampleData: string[];

    if (type === 'loans') {
      headers = [
        'Issuance Date (YYYY-MM-DD)',
        'Amount (Number)',
        `Loan Type (${state.settings.loanTypes.join(' | ')})`,
        'Repayment Period Type (days | weeks | months)',
        'Repayment Period Value (Number)',
        'Interest Rate (Number)',
        'Status (running | repaid)',
        'Principal Balance (Number)',
        'Interest Balance (Number)',
        'Loanee Name (Text)',
        'National ID (Text)',
        'Mobile (Text)',
        'Email (Text)',
        'Employment Status (employed | self-employed)',
        'Last Repayment Date (YYYY-MM-DD) - Optional'
      ];
      sampleData = [
        '2024-01-15',
        '50000',
        state.settings.loanTypes[0] || 'Personal Loan',
        'months',
        '6',
        '15',
        'running',
        '42000',
        '6500',
        'John Doe',
        '12345678',
        '0712345678',
        'john@email.com',
        'employed',
        '2024-02-15'
      ];
    } else {
      headers = [
        'Loan Number (Text)',
        'Payment Date (YYYY-MM-DD)',
        'Principal Amount (Number)',
        'Interest Amount (Number)',
        'Payer Name (Text)',
        'Payer National ID (Text)',
        'Payer Mobile (Text)',
        `Payment Channel (${(state.settings.paymentChannels || ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque']).join(' | ')})`,
        'Notes (Text) - Optional'
      ];
      sampleData = [
        'Ln_00001A',
        '2024-02-15',
        '8000',
        '1200',
        'John Doe',
        '12345678',
        '0712345678',
        'Mobile Money',
        'Monthly payment'
      ];
    }

    const csvContent = [headers, sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_upload_template.csv`;
    link.click();
  };

  const validateAndParseData = (values: string[], type: 'loans' | 'repayments') => {
    const errors: string[] = [];

    if (type === 'loans') {
      // Validate date
      const issuanceDate = values[0];
      if (!issuanceDate || isNaN(new Date(issuanceDate).getTime())) {
        errors.push('Invalid issuance date format. Use YYYY-MM-DD');
      }

      // Validate amount
      const amount = parseFloat(values[1]);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Amount must be a positive number');
      }

      // Validate loan type
      const loanType = values[2];
      if (!state.settings.loanTypes.includes(loanType)) {
        errors.push(`Loan type must be one of: ${state.settings.loanTypes.join(', ')}`);
      }

      // Validate repayment period type
      const repaymentPeriod = values[3];
      if (!['days', 'weeks', 'months'].includes(repaymentPeriod)) {
        errors.push('Repayment period type must be: days, weeks, or months');
      }

      // Validate repayment period value
      const repaymentPeriodValue = parseInt(values[4]);
      if (isNaN(repaymentPeriodValue) || repaymentPeriodValue <= 0) {
        errors.push('Repayment period value must be a positive number');
      }

      // Validate interest rate
      const interestRate = parseFloat(values[5]);
      if (isNaN(interestRate) || interestRate < 0) {
        errors.push('Interest rate must be a non-negative number');
      }

      // Validate status
      const status = values[6];
      if (!['running', 'repaid'].includes(status)) {
        errors.push('Status must be either "running" or "repaid"');
      }

      // Validate balances
      const principalBalance = parseFloat(values[7]);
      const interestBalance = parseFloat(values[8]);
      if (isNaN(principalBalance) || principalBalance < 0) {
        errors.push('Principal balance must be a non-negative number');
      }
      if (isNaN(interestBalance) || interestBalance < 0) {
        errors.push('Interest balance must be a non-negative number');
      }

      // Validate employment status
      const employmentStatus = values[13];
      if (!['employed', 'self-employed'].includes(employmentStatus)) {
        errors.push('Employment status must be either "employed" or "self-employed"');
      }
    }

    return errors;
  };

  const findOrCreateLoanee = (name: string, nationalId: string, mobile: string, email: string, employmentStatus: string) => {
    // Check if loanee already exists
    const existingLoanee = state.loanees.find(
      loanee => loanee.nationalId === nationalId || loanee.mobile === mobile
    );

    if (existingLoanee) {
      return existingLoanee;
    }

    // Create new loanee with all required properties
    const newLoanee = {
      id: Date.now().toString() + Math.random(),
      name,
      nationalId,
      mobile,
      email,
      employmentStatus: employmentStatus as 'employed' | 'self-employed',
      dateAdded: new Date().toISOString().split('T')[0],
      totalLoans: 0,
      activeLoans: 0
    };

    dispatch({ type: 'ADD_LOANEE', payload: newLoanee });
    return newLoanee;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResults(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain headers and at least one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      let successCount = 0;
      let errorMessages: string[] = [];
      let newLoaneesCount = 0;
      let nextLoanNum = state.nextLoanNumber;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        try {
          // Validate data
          const validationErrors = validateAndParseData(values, type);
          if (validationErrors.length > 0) {
            errorMessages.push(`Row ${i}: ${validationErrors.join(', ')}`);
            continue;
          }

          if (type === 'loans') {
            // Find or create loanee
            const loaneeCountBefore = state.loanees.length;
            const loanee = findOrCreateLoanee(
              values[9], // name
              values[10], // nationalId
              values[11], // mobile
              values[12], // email
              values[13]  // employmentStatus
            );
            
            if (state.loanees.length > loaneeCountBefore) {
              newLoaneesCount++;
            }

            // Generate loan number
            const loanNumber = generateLoanNumber(
              nextLoanNum, 
              state.settings.loanNumberPrefix, 
              state.settings.loanNumberSuffix
            );
            
            // Calculate due date
            const issuanceDate = new Date(values[0]);
            const repaymentPeriodValue = parseInt(values[4]);
            const repaymentPeriod = values[3] as 'months' | 'weeks' | 'days';
            
            let dueDate = new Date(issuanceDate);
            if (repaymentPeriod === 'months') {
              dueDate.setMonth(dueDate.getMonth() + repaymentPeriodValue);
            } else if (repaymentPeriod === 'weeks') {
              dueDate.setDate(dueDate.getDate() + (repaymentPeriodValue * 7));
            } else {
              dueDate.setDate(dueDate.getDate() + repaymentPeriodValue);
            }

            const amount = parseFloat(values[1]);
            const interestRate = parseFloat(values[5]);
            const totalInterest = (amount * interestRate / 100);
            const principalBalance = parseFloat(values[7]);
            const interestBalance = parseFloat(values[8]);
            
            const loanData = {
              id: Date.now().toString() + i + Math.random(),
              loanNumber,
              issuanceDate: values[0],
              amount,
              loanType: values[2],
              repaymentPeriod: repaymentPeriod,
              repaymentPeriodValue,
              interestRate,
              totalInterest,
              principalBalance,
              interestBalance,
              loanee: {
                name: loanee.name,
                nationalId: loanee.nationalId,
                mobile: loanee.mobile,
                email: loanee.email,
                employmentStatus: loanee.employmentStatus
              },
              status: values[6] as 'running' | 'repaid',
              dueDate: dueDate.toISOString().split('T')[0],
              expectedRepaymentAmount: amount + totalInterest,
              lastRepaymentDate: values[14] || undefined
            };

            dispatch({ type: 'ADD_LOAN', payload: loanData });
            nextLoanNum++;
            successCount++;
          } else {
            // Process repayment data
            const repaymentData = {
              id: Date.now().toString() + i + Math.random(),
              loanNumber: values[0],
              date: values[1],
              principalAmount: parseFloat(values[2]),
              interestAmount: parseFloat(values[3]),
              payer: {
                name: values[4],
                nationalId: values[5],
                mobile: values[6]
              },
              paymentChannel: values[7],
              notes: values[8] || undefined
            };

            dispatch({ type: 'ADD_REPAYMENT', payload: repaymentData });
            successCount++;
          }
        } catch (error) {
          errorMessages.push(`Row ${i}: ${error}`);
        }
      }

      setUploadResults({
        success: successCount,
        errors: errorMessages,
        newLoanees: newLoaneesCount
      });

    } catch (error) {
      setUploadResults({
        success: 0,
        errors: [`File processing error: ${error}`],
        newLoanees: 0
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Bulk Upload {type === 'loans' ? 'Loans' : 'Repayments'}
      </h3>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button
              disabled={isUploading}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              <FileText className="w-4 h-4" />
              {isUploading ? 'Processing...' : 'Upload File'}
            </button>
          </div>
        </div>

        {uploadResults && (
          <div className="space-y-2">
            {uploadResults.success > 0 && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800 text-sm">
                  Successfully processed {uploadResults.success} {type}
                  {uploadResults.newLoanees > 0 && ` and added ${uploadResults.newLoanees} new loanees`}
                </span>
              </div>
            )}
            
            {uploadResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 font-medium text-sm">Errors ({uploadResults.errors.length}):</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uploadResults.errors.map((error, index) => (
                    <p key={index} className="text-red-700 text-xs">{error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Download the CSV template using the button above</li>
            <li>Fill in your data following the exact format and data types shown in headers</li>
            <li>Use the dropdown values specified in the headers for categorical fields</li>
            {type === 'loans' && (
              <>
                <li>Loan numbers will be auto-generated: {state.settings.loanNumberPrefix}XXXXX{state.settings.loanNumberSuffix}</li>
                <li>Loanees will be automatically added if they don't exist</li>
                <li>Use 'running' or 'repaid' for loan status</li>
                <li>Employment status: 'employed' or 'self-employed'</li>
              </>
            )}
            <li>Save your file as CSV format</li>
            <li>Upload your completed file</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;