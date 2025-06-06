
import React from 'react';
import { useLoanContext } from '../context/LoanContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Plus, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  X,
  Users,
  LogOut,
  Banknote,
  PiggyBank,
  DollarSign,
  Upload
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const { state } = useLoanContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const brandColor = state.settings.brandColor;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('companyName');
    localStorage.removeItem('adminName');
    
    toast({
      title: "Logged Out Successfully",
      description: "You have been logged out of your account.",
    });
    
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issue-loan', label: 'Issue Loan', icon: Plus },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'running-loans', label: 'Running Loans', icon: Clock },
    { id: 'repaid-loans', label: 'Repaid Loans', icon: CheckCircle },
    { id: 'loanee-management', label: 'Loanee Management', icon: Users },
    { id: 'bulk-uploads', label: 'Bulk Uploads', icon: Upload },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {state.settings.logo ? (
              <img 
                src={state.settings.logo} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="flex space-x-1">
                <Banknote className="w-5 h-5 text-blue-600" />
                <PiggyBank className="w-5 h-5 text-green-600" />
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <span 
              className="text-lg font-bold"
              style={{ color: state.settings.brandColor }}
            >
              {state.settings.companyName}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: brandColor } : {}}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div 
            className="text-xs font-bold text-center"
            style={{ color: state.settings.brandColor }}
          >
            © 2024 {state.settings.companyName}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;