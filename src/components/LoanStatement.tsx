
import React, { useRef } from 'react';
import { useLoanContext } from '../context/LoanContext';
import { Share } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LoanStatementProps {
  loanNumber?: string;
  onBack?: () => void;
}

const LoanStatement: React.FC<LoanStatementProps> = ({ loanNumber, onBack }) => {
  const { state } = useLoanContext();
  const statementRef = useRef<HTMLDivElement>(null);

  const loan = state.loans.find(l => l.loanNumber === loanNumber);
  const loanRepayments = state.repayments.filter(r => r.loanNumber === loanNumber);

  if (!loan) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loan not found</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">
            Close
          </button>
        )}
      </div>
    );
  }

  const handlePrint = async () => {
    if (!statementRef.current) return;

    try {
      const canvas = await html2canvas(statementRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${loan.loanNumber}_statement.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!statementRef.current) return;

    try {
      const canvas = await html2canvas(statementRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate blob and create download link
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${loan.loanNumber}_statement.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);

      // Create WhatsApp message
      const message = `Loan Statement for ${loan.loanNumber}\n\nBorrower: ${loan.loanee.name}\nLoan Amount: KES ${loan.amount.toLocaleString()}\nDue Date: ${new Date(loan.dueDate).toLocaleDateString()}\n\nStatement has been downloaded as PDF. Please attach and share.`;
      
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Error generating PDF for WhatsApp:', error);
      alert('Error generating PDF for WhatsApp. Please try again.');
    }
  };

  const totalPaid = loanRepayments.reduce((sum, payment) => sum + payment.principalAmount + payment.interestAmount, 0);
  const totalDue = loan.amount + loan.totalInterest;
  const balanceRemaining = totalDue - totalPaid;

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {onBack && (
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Loan Statement</h2>
          <div className="flex gap-2">
            <button
              onClick={handleShareToWhatsApp}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share to WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Download PDF
            </button>
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div ref={statementRef} className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold" style={{ color: state.settings.brandColor }}>
            {state.settings.companyName}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Loan Statement</p>
          <p className="text-xs text-gray-500 mt-2">
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Loan Information */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Loan Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Number:</span>
                <span className="font-medium">{loan.loanNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Type:</span>
                <span className="font-medium">{loan.loanType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span className="font-medium">{new Date(loan.issuanceDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${loan.status === 'repaid' ? 'text-green-600' : 'text-orange-600'}`}>
                  {loan.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Borrower Information</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{loan.loanee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">National ID:</span>
                <span className="font-medium">{loan.loanee.nationalId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile:</span>
                <span className="font-medium">{loan.loanee.mobile}</span>
              </div>
              {loan.loanee.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{loan.loanee.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Financial Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Amount:</span>
                <span className="font-medium">KES {loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Amount:</span>
                <span className="font-medium">KES {loan.totalInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Amount Due:</span>
                <span>KES {totalDue.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium text-green-600">KES {totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Balance Remaining:</span>
                <span className={`font-medium ${balanceRemaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  KES {balanceRemaining.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium">{loan.interestRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Payment History</h3>
          {loanRepayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-xs">No payments recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Principal</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Interest</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Total</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {loanRepayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="border border-gray-300 px-3 py-2">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        KES {payment.principalAmount.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        KES {payment.interestAmount.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        KES {(payment.principalAmount + payment.interestAmount).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {payment.paymentChannel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center">
          <p className="text-xs text-gray-500">
            This statement was generated electronically by {state.settings.companyName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            For inquiries, please contact us through our official channels
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoanStatement;