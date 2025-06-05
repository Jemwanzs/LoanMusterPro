
import React, { useState } from 'react';
import { useLoanContext, Loanee } from '../context/LoanContext';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const LoaneeManagement: React.FC = () => {
  const { state, dispatch } = useLoanContext();
  const [isAddingLoanee, setIsAddingLoanee] = useState(false);
  const [editingLoanee, setEditingLoanee] = useState<Loanee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    mobile: '',
    email: '',
    employmentStatus: 'employed' as 'employed' | 'self-employed'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('$', 'KES ');
  };

  const filteredLoanees = (state.loanees || []).filter(loanee =>
    loanee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loanee.nationalId.includes(searchTerm) ||
    loanee.mobile.includes(searchTerm)
  );

  const validateForm = () => {
    if (!formData.name || !formData.nationalId || !formData.mobile) {
      alert('Please fill in all required fields');
      return false;
    }

    // Check for duplicate National ID or Mobile
    const existingLoanee = (state.loanees || []).find(loanee => 
      (loanee.nationalId === formData.nationalId || loanee.mobile === formData.mobile) &&
      loanee.id !== editingLoanee?.id
    );

    if (existingLoanee) {
      alert('A loanee with this National ID or Mobile number already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingLoanee) {
      dispatch({
        type: 'UPDATE_LOANEE',
        payload: {
          id: editingLoanee.id,
          updates: formData
        }
      });
      setEditingLoanee(null);
    } else {
      const newLoanee: Loanee = {
        id: Date.now().toString(),
        ...formData,
        dateAdded: new Date().toISOString().split('T')[0],
        totalLoans: 0,
        activeLoans: 0
      };

      dispatch({ type: 'ADD_LOANEE', payload: newLoanee });
      setIsAddingLoanee(false);
    }

    setFormData({
      name: '',
      nationalId: '',
      mobile: '',
      email: '',
      employmentStatus: 'employed'
    });
  };

  const handleEdit = (loanee: Loanee) => {
    setEditingLoanee(loanee);
    setFormData({
      name: loanee.name,
      nationalId: loanee.nationalId,
      mobile: loanee.mobile,
      email: loanee.email || '',
      employmentStatus: loanee.employmentStatus
    });
    setIsAddingLoanee(true);
  };

  const handleDelete = (loaneeId: string) => {
    if (confirm('Are you sure you want to delete this loanee?')) {
      dispatch({ type: 'DELETE_LOANEE', payload: loaneeId });
    }
  };

  const calculateLoaneeStats = (loanee: Loanee) => {
    const loaneeLoans = (state.loans || []).filter(loan => loan.loanee.nationalId === loanee.nationalId);
    const totalLoans = loaneeLoans.length;
    const activeLoans = loaneeLoans.filter(loan => loan.status === 'running').length;
    const totalBorrowed = loaneeLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalOutstanding = loaneeLoans.reduce((sum, loan) => sum + loan.principalBalance + loan.interestBalance, 0);

    return { totalLoans, activeLoans, totalBorrowed, totalOutstanding };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Loanee Management</h1>
        <button
          onClick={() => setIsAddingLoanee(true)}
          className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors flex items-center gap-2"
          style={{ backgroundColor: `hsl(var(--brand-primary))` }}
        >
          <Plus className="w-4 h-4" />
          Add Loanee
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, National ID, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAddingLoanee && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingLoanee ? 'Edit Loanee' : 'Add New Loanee'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">National ID *</label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status *</label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as 'employed' | 'self-employed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                required
              >
                <option value="employed">Employed</option>
                <option value="self-employed">Self Employed</option>
              </select>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
                style={{ backgroundColor: `hsl(var(--brand-primary))` }}
              >
                {editingLoanee ? 'Update' : 'Add'} Loanee
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingLoanee(false);
                  setEditingLoanee(null);
                  setFormData({
                    name: '',
                    nationalId: '',
                    mobile: '',
                    email: '',
                    employmentStatus: 'employed'
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loanees List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Loanees ({filteredLoanees.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loanee Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoanees.map((loanee) => {
                const stats = calculateLoaneeStats(loanee);
                return (
                  <tr key={loanee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{loanee.name}</div>
                        <div className="text-sm text-gray-500">ID: {loanee.nationalId}</div>
                        <div className="text-sm text-gray-500 capitalize">{loanee.employmentStatus.replace('-', ' ')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{loanee.mobile}</div>
                      {loanee.email && <div className="text-sm text-gray-500">{loanee.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stats.totalLoans} loans • {stats.activeLoans} active
                      </div>
                      <div className="text-sm text-gray-500">
                        Borrowed: {formatCurrency(stats.totalBorrowed)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Outstanding: {formatCurrency(stats.totalOutstanding)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(loanee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loanee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredLoanees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No loanees found matching your search' : 'No loanees added yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoaneeManagement;