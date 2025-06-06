
import React, { useState } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const BulkLoaneeUpload: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  const downloadTemplate = () => {
    const headers = [
      'Name (Text)',
      'National ID (Text)',
      'Mobile (Text)',
      'Email (Text)',
      'Employment Status (employed | self-employed)'
    ];
    
    const sampleData = [
      'John Doe',
      '12345678',
      '0712345678',
      'john@email.com',
      'employed'
    ];

    const csvContent = [headers, sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loanees_upload_template.csv';
    link.click();
  };

  const validateAndParseLoaneeData = (values: string[]) => {
    const errors: string[] = [];

    // Validate name
    if (!values[0] || values[0].trim() === '') {
      errors.push('Name is required');
    }

    // Validate national ID
    if (!values[1] || values[1].trim() === '') {
      errors.push('National ID is required');
    }

    // Validate mobile
    if (!values[2] || values[2].trim() === '') {
      errors.push('Mobile number is required');
    }

    // Validate employment status
    const employmentStatus = values[4];
    if (!['employed', 'self-employed'].includes(employmentStatus)) {
      errors.push('Employment status must be either "employed" or "self-employed"');
    }

    return errors;
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

      let successCount = 0;
      let errorMessages: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        try {
          // Validate data
          const validationErrors = validateAndParseLoaneeData(values);
          if (validationErrors.length > 0) {
            errorMessages.push(`Row ${i}: ${validationErrors.join(', ')}`);
            continue;
          }

          // Check if loanee already exists by national ID or mobile
          const existingLoanee = state.loanees.find(
            loanee => loanee.nationalId === values[1] || loanee.mobile === values[2]
          );

          if (existingLoanee) {
            errorMessages.push(`Row ${i}: Loanee with this National ID or Mobile already exists`);
            continue;
          }

          // Create new loanee
          const loaneeData = {
            id: Date.now().toString() + i + Math.random(),
            name: values[0],
            nationalId: values[1],
            mobile: values[2],
            email: values[3] || '',
            employmentStatus: values[4] as 'employed' | 'self-employed',
            dateAdded: new Date().toISOString().split('T')[0],
            totalLoans: 0,
            activeLoans: 0
          };

          dispatch({ type: 'ADD_LOANEE', payload: loaneeData });
          successCount++;
        } catch (error) {
          errorMessages.push(`Row ${i}: ${error}`);
        }
      }

      setUploadResults({
        success: successCount,
        errors: errorMessages
      });

    } catch (error) {
      setUploadResults({
        success: 0,
        errors: [`File processing error: ${error}`]
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
        Bulk Upload Loanees
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
                  Successfully processed {uploadResults.success} loanees
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
            <li>Each loanee must have a unique National ID and Mobile number</li>
            <li>Employment status must be either 'employed' or 'self-employed'</li>
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

export default BulkLoaneeUpload;