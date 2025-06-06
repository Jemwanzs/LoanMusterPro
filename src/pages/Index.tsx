
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import LoanIssuance from '../components/LoanIssuance';
import Transactions from '../components/Transactions';
import RunningLoans from '../components/RunningLoans';
import RepaidLoans from '../components/RepaidLoans';
import Reports from '../components/Reports';
import Settings from '../components/Settings';
import LoaneeManagement from '../components/LoaneeManagement';
import LoanStatement from '../components/LoanStatement';
import BulkUploadsPage from '../components/BulkUploadsPage';
import BrandThemeProvider from '../components/BrandThemeProvider';
import { LoanProvider } from '../context/LoanContext';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLoanForStatement, setSelectedLoanForStatement] = useState<string | null>(null);

  // Handle page parameter from URL (for signup redirect)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(pageParam);
      // Clean up URL
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  // Close sidebar when page changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentPage]);

  // Clear loan statement when navigating away
  useEffect(() => {
    if (selectedLoanForStatement && currentPage !== 'running-loans' && currentPage !== 'repaid-loans') {
      setSelectedLoanForStatement(null);
    }
  }, [currentPage, selectedLoanForStatement]);

  const renderPage = () => {
    if (selectedLoanForStatement) {
      return (
        <LoanStatement 
          loanNumber={selectedLoanForStatement} 
          onBack={() => {
            setSelectedLoanForStatement(null);
            // Keep the current page context
          }}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'issue-loan':
        return <LoanIssuance />;
      case 'transactions':
        return <Transactions />;
      case 'running-loans':
        return <RunningLoans onViewStatement={setSelectedLoanForStatement} />;
      case 'repaid-loans':
        return <RepaidLoans onViewStatement={setSelectedLoanForStatement} />;
      case 'loanee-management':
        return <LoaneeManagement />;
      case 'bulk-uploads':
        return <BulkUploadsPage />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LoanProvider>
      <BrandThemeProvider>
        <div className="min-h-screen bg-gray-50 flex w-full">
          <Sidebar 
            currentPage={selectedLoanForStatement ? 'loan-statement' : currentPage} 
            setCurrentPage={(page) => {
              setCurrentPage(page);
              setSelectedLoanForStatement(null); // Clear statement when navigating
            }}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
              {renderPage()}
            </main>
          </div>
        </div>
      </BrandThemeProvider>
    </LoanProvider>
  );
};

export default Index;