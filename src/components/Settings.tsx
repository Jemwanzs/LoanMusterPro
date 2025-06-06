import React, { useState, useEffect } from 'react';
import { useLoanContext } from '../context/LoanContext';
import LoaneeManagement from './LoaneeManagement';
import { Settings as SettingsIcon, Users, CreditCard, Building, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    companyName: state.settings.companyName,
    brandColor: state.settings.brandColor,
    defaultInterestRate: state.settings.defaultInterestRate,
    loanTypes: state.settings.loanTypes.join(', '),
    paymentChannels: (state.settings.paymentChannels || ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque']).join(', '),
    repaymentPeriods: (state.settings.repaymentPeriods || ['Days', 'Weeks', 'Months']).join(', '),
    loanNumberPrefix: state.settings.loanNumberPrefix || 'Ln_',
    loanNumberSuffix: state.settings.loanNumberSuffix || 'A'
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when settings change
  useEffect(() => {
    const newFormData = {
      companyName: state.settings.companyName,
      brandColor: state.settings.brandColor,
      defaultInterestRate: state.settings.defaultInterestRate,
      loanTypes: state.settings.loanTypes.join(', '),
      paymentChannels: (state.settings.paymentChannels || ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque']).join(', '),
      repaymentPeriods: (state.settings.repaymentPeriods || ['Days', 'Weeks', 'Months']).join(', '),
      loanNumberPrefix: state.settings.loanNumberPrefix || 'Ln_',
      loanNumberSuffix: state.settings.loanNumberSuffix || 'A'
    };
    setFormData(newFormData);
    setHasChanges(false);
  }, [state.settings]);

  // Track changes
  useEffect(() => {
    const currentValues = {
      companyName: state.settings.companyName,
      brandColor: state.settings.brandColor,
      defaultInterestRate: state.settings.defaultInterestRate,
      loanTypes: state.settings.loanTypes.join(', '),
      paymentChannels: (state.settings.paymentChannels || ['Cash', 'Bank Transfer', 'Mobile Money', 'Cheque']).join(', '),
      repaymentPeriods: (state.settings.repaymentPeriods || ['Days', 'Weeks', 'Months']).join(', '),
      loanNumberPrefix: state.settings.loanNumberPrefix || 'Ln_',
      loanNumberSuffix: state.settings.loanNumberSuffix || 'A'
    };
    
    const hasChanges = JSON.stringify(currentValues) !== JSON.stringify(formData);
    setHasChanges(hasChanges);
  }, [formData, state.settings]);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'loanees', label: 'Loanees', icon: Users },
    { id: 'loan-types', label: 'Loan Types', icon: CreditCard },
    { id: 'company', label: 'Company', icon: Building },
  ];

  const handleSave = () => {
    const updatedSettings = {
      companyName: formData.companyName,
      brandColor: formData.brandColor,
      defaultInterestRate: formData.defaultInterestRate,
      loanTypes: formData.loanTypes.split(',').map(type => type.trim()).filter(type => type),
      paymentChannels: formData.paymentChannels.split(',').map(channel => channel.trim()).filter(channel => channel),
      repaymentPeriods: formData.repaymentPeriods.split(',').map(period => period.trim()).filter(period => period),
      loanNumberPrefix: formData.loanNumberPrefix,
      loanNumberSuffix: formData.loanNumberSuffix
    };

    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: updatedSettings
    });
    
    // Update CSS custom properties for brand color
    const root = document.documentElement;
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return [h * 360, s * 100, l * 100];
    };

    const [h, s, l] = hexToHsl(formData.brandColor);
    root.style.setProperty('--brand-primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--brand-hover', `${h} ${s}% ${Math.max(l - 10, 10)}%`);
    root.style.setProperty('--brand-light', `${h} ${Math.max(s - 20, 20)}% ${Math.min(l + 30, 95)}%`);
    
    alert('Settings saved successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'loanees':
        return <LoaneeManagement />;
      
      case 'loan-types':
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Loan Configuration</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Types (comma-separated)
                </label>
                <textarea
                  value={formData.loanTypes}
                  onChange={(e) => setFormData({ ...formData, loanTypes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  rows={3}
                  placeholder="Personal Loan, Business Loan, Emergency Loan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Channels (comma-separated)
                </label>
                <textarea
                  value={formData.paymentChannels}
                  onChange={(e) => setFormData({ ...formData, paymentChannels: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  rows={3}
                  placeholder="Cash, Bank Transfer, Mobile Money"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repayment Periods (comma-separated)
                </label>
                <textarea
                  value={formData.repaymentPeriods}
                  onChange={(e) => setFormData({ ...formData, repaymentPeriods: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  rows={2}
                  placeholder="Days, Weeks, Months"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.defaultInterestRate}
                  onChange={(e) => setFormData({ ...formData, defaultInterestRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Number Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.loanNumberPrefix}
                    onChange={(e) => setFormData({ ...formData, loanNumberPrefix: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    placeholder="Ln_"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Number Suffix
                  </label>
                  <input
                    type="text"
                    value={formData.loanNumberSuffix}
                    onChange={(e) => setFormData({ ...formData, loanNumberSuffix: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    placeholder="A"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Loan Number Format Preview:</p>
                <p className="text-base md:text-lg font-mono text-gray-900 break-all">
                  {formData.loanNumberPrefix}00001{formData.loanNumberSuffix}
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'company':
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Company Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm font-bold"
                  style={{ color: formData.brandColor }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Color
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="flex-1 w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                    placeholder="#0F766E"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Logo Upload</p>
                <p className="text-xs text-gray-500">Logo upload feature will be available in a future update</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">General Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">System Information</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Version: 1.0.0</p>
                      <p>Data Storage: Local Browser Storage</p>
                      <p>Last Updated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Total Loans: {(state.loans || []).length}</p>
                      <p>Total Loanees: {(state.loanees || []).length}</p>
                      <p>Total Repayments: {(state.repayments || []).length}</p>
                      <p className="mt-2">Company: <span className="font-bold" style={{ color: state.settings.brandColor }}>{state.settings.companyName}</span></p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    All data is stored locally in your browser. Make sure to backup your data regularly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(state, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `loan_system_backup_${new Date().toISOString().split('T')[0]}.json`;
                        link.click();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                          localStorage.removeItem('loanSystemData');
                          window.location.reload();
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        {activeTab !== 'loanees' && activeTab !== 'general' && activeTab !== 'bulk-upload' && (
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
              hasChanges 
                ? 'text-white hover:opacity-90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={hasChanges ? { backgroundColor: `hsl(var(--brand-primary))` } : {}}
          >
            <Save className="w-4 h-4" />
            {hasChanges ? 'Save Changes' : 'No Changes'}
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 md:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 md:px-4 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeTab === tab.id ? { 
                  borderColor: `hsl(var(--brand-primary))`,
                  color: `hsl(var(--brand-primary))`
                } : {}}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 md:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;