import React, { useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Columns,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { MOCK_ALL_USERS } from '../data/mockOperations';
import { useBulkOperations } from '../context/BulkOperationsContext';

export const AllUsersView: React.FC = () => {
  const { navigateTo } = useBulkOperations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('all_users');

  const filteredUsers = MOCK_ALL_USERS.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.userName.toLowerCase().includes(q) ||
      user.ou.toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex gap-6">
        {/* Left Directory Sidebar (Matching Image 1) */}
        <aside className="w-56 shrink-0 space-y-6">
          <div className="space-y-1">
            <button
              onClick={() => navigateTo('dashboard', 'users')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-[6px] transition-colors ${
                activeSidebarItem === 'dashboard'
                  ? 'bg-[#EFF6FF] text-[#0F62FE] font-semibold'
                  : 'text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveSidebarItem('all_users')}
              className={`w-full text-left px-3 py-2 text-sm rounded-[6px] transition-colors ${
                activeSidebarItem === 'all_users'
                  ? 'bg-[#EFF6FF] text-[#0F62FE] font-semibold'
                  : 'text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              All Users
            </button>

            <button
              onClick={() => setActiveSidebarItem('templates')}
              className="w-full text-left px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            >
              Templates
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              Custom View
            </div>

            <button
              onClick={() => setActiveSidebarItem('activation_pending')}
              className="w-full text-left px-3 py-1.5 text-sm text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            >
              Activation Pending
            </button>

            <button
              onClick={() => setActiveSidebarItem('deactivated')}
              className="w-full text-left px-3 py-1.5 text-sm text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            >
              Deactivated
            </button>

            <button
              onClick={() => setActiveSidebarItem('locked_out')}
              className="w-full text-left px-3 py-1.5 text-sm text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            >
              Locked Out
            </button>

            <button className="flex items-center space-x-1.5 px-3 py-2 text-sm text-[#0F62FE] hover:underline font-medium">
              <Plus className="w-4 h-4" />
              <span>Add new</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-4 min-w-0">
          {/* Header Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight">All Users</h1>
          </div>

          {/* License Limit Reached Warning Banner */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-4 flex items-start space-x-3 text-xs text-[#B45309]">
            <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#92400E]">License Limit Reached!</span>
              <p className="mt-0.5 text-[#B45309]">
                You have reached your maximum limit of 100 licenses. Please purchase more licenses to continue adding users.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {/* Create User Button with Dropdown */}
              <div className="relative">
                <button
                  id="create-user-btn"
                  onClick={() => setIsCreateDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#0F62FE] text-white rounded-[6px] text-sm font-semibold hover:bg-[#0043CE] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create User</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {isCreateDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#E5E7EB] rounded-[8px] shadow-md z-20 py-1 text-xs">
                    <button
                      onClick={() => setIsCreateDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-[#374151] hover:bg-[#F3F4F6] font-medium"
                    >
                      Single User Manual Entry
                    </button>
                    <button
                      onClick={() => setIsCreateDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-[#374151] hover:bg-[#F3F4F6]"
                    >
                      Invite User via Email
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Dropdown Button */}
              <div className="relative">
                <button
                  id="actions-dropdown-btn"
                  onClick={() => setIsActionsDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-[#D1D5DB] text-[#374151] rounded-[6px] text-sm font-medium hover:bg-[#F3F4F6] transition-colors"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>

                {isActionsDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-56 bg-white border border-[#E5E7EB] rounded-[8px] shadow-md z-20 py-1 text-xs">
                    <button
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        navigateTo('bulk_operations_datatable', 'users');
                      }}
                      className="w-full text-left px-3 py-2 text-[#0F62FE] font-medium hover:bg-[#EFF6FF]"
                    >
                      View Bulk Operations Audit Log
                    </button>
                    <button
                      onClick={() => setIsActionsDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-[#374151] hover:bg-[#F3F4F6]"
                    >
                      Export Users to CSV
                    </button>
                    <button
                      onClick={() => setIsActionsDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 text-[#DC2626] hover:bg-[#FEE2E2]"
                    >
                      Deprovision Selected Accounts
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search & Column Filters */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search anything here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D1D5DB] rounded-[6px] text-xs placeholder-[#6B7280] focus:outline-none focus:border-[#0F62FE]"
                />
              </div>

              <button
                className="p-2 bg-white border border-[#D1D5DB] rounded-[6px] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                title="Filter configurations"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* All Users Datatable */}
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#6B7280] font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                        onChange={toggleSelectAll}
                        className="rounded border-[#D1D5DB] text-[#0F62FE] focus:ring-[#0F62FE] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">OU</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 w-10 text-right">
                      <Columns className="w-3.5 h-3.5 text-[#6B7280] ml-auto cursor-pointer" />
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-[#F9FAFB] transition-colors ${
                          isSelected ? 'bg-[#EFF6FF]' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(user.id)}
                            className="rounded border-[#D1D5DB] text-[#0F62FE] focus:ring-[#0F62FE] cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0F62FE] hover:underline cursor-pointer">
                          {user.name}
                        </td>
                        <td className="py-3 px-4 text-[#374151]">{user.userName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-[9999px] text-[10px] font-medium ${
                              user.status === 'Active'
                                ? 'bg-[#DCFCE7] text-[#15803D]'
                                : 'bg-[#FEE2E2] text-[#B91C1C]'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#374151]">{user.email}</td>
                        <td className="py-3 px-4 text-[#374151]">{user.ou}</td>
                        <td className="py-3 px-4 text-[#374151]">{user.source}</td>
                        <td className="py-3 px-4"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
              <div className="flex items-center space-x-2">
                <span>Page Size</span>
                <select className="border border-[#D1D5DB] rounded-[6px] px-2 py-1 bg-white text-xs text-[#374151]">
                  <option>20</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                <span className="ml-2">1-10 of 15</span>
              </div>

              <div className="flex items-center space-x-1">
                <button className="p-1 rounded-[6px] hover:bg-[#F3F4F6] text-[#6B7280] disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-6 h-6 rounded-[6px] bg-[#0F62FE] text-white font-medium text-xs">
                  1
                </button>
                <button className="w-6 h-6 rounded-[6px] hover:bg-[#F3F4F6] text-[#374151] text-xs">
                  2
                </button>
                <button className="w-6 h-6 rounded-[6px] hover:bg-[#F3F4F6] text-[#374151] text-xs">
                  3
                </button>
                <button className="w-6 h-6 rounded-[6px] hover:bg-[#F3F4F6] text-[#374151] text-xs">
                  4
                </button>
                <button className="w-6 h-6 rounded-[6px] hover:bg-[#F3F4F6] text-[#374151] text-xs">
                  5
                </button>
                <span className="px-1 text-[#6B7280]">...</span>
                <button className="w-6 h-6 rounded-[6px] hover:bg-[#F3F4F6] text-[#374151] text-xs">
                  6
                </button>
                <button className="p-1 rounded-[6px] hover:bg-[#F3F4F6] text-[#374151]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
