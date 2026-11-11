import React from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  ListChecks,
} from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';
import { NavigationTab, SubNavDirectory } from '../types';
import { GlobalUtilityTray } from './GlobalUtilityTray';

export const Header: React.FC = () => {
  const {
    currentNav,
    currentSubNav,
    currentView,
    navigateTo,
    setCurrentNav,
    setCurrentSubNav,
    isTrayOpen,
    toggleTray,
    activeCount,
    totalPendingErrors,
    isSimulationPaused,
    toggleSimulationPause,
  } = useBulkOperations();

  const handleNavClick = (tab: NavigationTab) => {
    setCurrentNav(tab);
    if (tab === 'directory') {
      if (currentView === 'detailed_action' || currentView === 'bulk_operations_datatable') {
        // Keep in bulk operations view
      } else {
        navigateTo('dashboard', 'users');
      }
    }
  };

  const handleSubNavClick = (subNav: SubNavDirectory) => {
    setCurrentSubNav(subNav);
    if (subNav === 'users') {
      navigateTo('users', 'users');
    } else if (subNav === 'bulk_operations') {
      navigateTo('bulk_operations_datatable', 'bulk_operations');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="flex items-center justify-between px-6 h-14">
        {/* Brand Logo & Main Nav Tabs */}
        <div className="flex items-center space-x-8">
          {/* Hexnode IDP Logo */}
          <button
            id="brand-home-btn"
            onClick={() => navigateTo('dashboard', 'users')}
            className="flex items-center space-x-1.5 text-left group focus:outline-none"
          >
            <span className="text-[20px] font-extrabold tracking-tight text-[#111827]">hexnode</span>
            <span className="text-[20px] font-bold text-[#0F62FE]">idp</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F62FE] mb-3 ml-0.5"></span>
          </button>

          {/* Main Navigation Links */}
          <nav className="flex items-center space-x-6 text-[14px]">
            <button
              id="nav-directory-btn"
              onClick={() => handleNavClick('directory')}
              className={`pb-1 font-semibold transition-colors relative ${
                currentNav === 'directory'
                  ? 'text-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Directory
              {currentNav === 'directory' && (
                <span className="absolute bottom-[-14px] left-0 right-0 h-[2px] bg-[#0F62FE] rounded-t-full"></span>
              )}
            </button>

            <button
              id="nav-applications-btn"
              onClick={() => handleNavClick('applications')}
              className={`pb-1 font-medium transition-colors ${
                currentNav === 'applications'
                  ? 'text-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Applications
            </button>

            <button
              id="nav-security-btn"
              onClick={() => handleNavClick('security')}
              className={`pb-1 font-medium transition-colors ${
                currentNav === 'security'
                  ? 'text-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Security
            </button>

            <button
              id="nav-settings-btn"
              onClick={() => handleNavClick('settings')}
              className={`pb-1 font-medium transition-colors ${
                currentNav === 'settings'
                  ? 'text-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Settings
            </button>

            <button
              id="nav-reports-btn"
              onClick={() => handleNavClick('reports')}
              className={`pb-1 font-medium transition-colors ${
                currentNav === 'reports'
                  ? 'text-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>

        {/* Top Right Utilities & Global Bulk Operations Tracker Icon */}
        <div className="flex items-center space-x-2.5">
          {/* Search Icon */}
          <button
            id="top-search-btn"
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            title="Search tenant directory"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* System Notifications Bell */}
          <button
            id="top-notifications-btn"
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-[6px] transition-colors relative"
            title="System notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* Global Bulk Operations Tracker Icon */}
          <div className="relative">
            <button
              id="global-utility-tray-btn"
              onClick={toggleTray}
              className={`p-2 rounded-[6px] transition-colors relative ${
                isTrayOpen
                  ? 'text-[#0F62FE] bg-[#EFF6FF]'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
              title={activeCount > 0 ? `Action Progress (${activeCount} active)` : 'Action Progress'}
            >
              <ListChecks className="w-4 h-4" />
              {activeCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F62FE]"></span>
                </span>
              )}
            </button>

            {/* Global Utility Tray Flyout */}
            {isTrayOpen && <GlobalUtilityTray />}
          </div>

          {/* Help & Support */}
          <button
            id="top-help-btn"
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-[6px] transition-colors"
            title="Help and documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              PM
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar (when in Directory) */}
      {currentNav === 'directory' && (
        <div className="flex items-center justify-between px-6 h-11 bg-white border-t border-[#E5E7EB]">
          <div className="flex items-center space-x-6 text-[13px]">
            <button
              id="subnav-users-btn"
              onClick={() => handleSubNavClick('users')}
              className={`font-semibold py-2 transition-colors ${
                currentView === 'users' && currentSubNav === 'users'
                  ? 'text-[#0F62FE] border-b-2 border-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Users
            </button>

            <button
              id="subnav-groups-btn"
              onClick={() => setCurrentSubNav('groups')}
              className={`font-medium py-2 transition-colors ${
                currentSubNav === 'groups'
                  ? 'text-[#0F62FE] border-b-2 border-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Groups
            </button>

            <button
              id="subnav-ou-btn"
              onClick={() => setCurrentSubNav('ou')}
              className={`font-medium py-2 transition-colors ${
                currentSubNav === 'ou'
                  ? 'text-[#0F62FE] border-b-2 border-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              OU
            </button>

            <button
              id="subnav-directory-integration-btn"
              onClick={() => setCurrentSubNav('directory_integration')}
              className={`font-medium py-2 transition-colors ${
                currentSubNav === 'directory_integration'
                  ? 'text-[#0F62FE] border-b-2 border-[#0F62FE]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Directory Integration
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#6B7280]">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            <span>Identity Directory Online</span>
          </div>
        </div>
      )}
    </header>
  );
};
