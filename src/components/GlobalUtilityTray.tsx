import React, { useRef, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';

export const GlobalUtilityTray: React.FC = () => {
  const {
    operations,
    closeTray,
    selectOperation,
    navigateTo,
    activeCount,
  } = useBulkOperations();

  const trayRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        const triggerBtn = document.getElementById('global-utility-tray-btn');
        if (triggerBtn && triggerBtn.contains(event.target as Node)) {
          return;
        }
        closeTray();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeTray]);

  // Display top 5 most recent tasks
  const top5Operations = [...operations]
    .sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return new Date(b.initiatedOn).getTime() - new Date(a.initiatedOn).getTime();
    })
    .slice(0, 5);

  return (
    <div
      ref={trayRef}
      id="global-utility-tray-flyout"
      className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-[12px] shadow-xl border border-[#E5E7EB] z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Tray Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-2">
          <span className="text-[13px] font-semibold text-[#111827]">Action Progress</span>
          {activeCount > 0 ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse"></span>
              <span>{activeCount} Running</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#6B7280]">
              All Settled
            </span>
          )}
        </div>

        <button
          id="close-tray-btn"
          onClick={closeTray}
          className="p-1 text-[#6B7280] hover:text-[#111827] rounded-[6px] hover:bg-[#E5E7EB] transition-colors"
          title="Close tray"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Task List (Top 5 items) */}
      <div className="divide-y divide-[#E5E7EB] max-h-[420px] overflow-y-auto">
        {top5Operations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            No recent actions found.
          </div>
        ) : (
          top5Operations.map((op) => {
            const pct = Math.min(100, Math.round((op.processedRows / (op.totalRows || 1)) * 100));

            return (
              <div
                key={op.id}
                id={`tray-item-${op.id}`}
                className="p-3.5 hover:bg-[#F9FAFB] transition-colors"
              >
                {/* Job Name (Clickable text link routing to detail view) */}
                <div className="mb-1">
                  <button
                    onClick={() => {
                      selectOperation(op.id);
                      closeTray();
                    }}
                    className="text-left font-medium text-[13px] text-[#0F62FE] hover:underline truncate block w-full transition-colors"
                  >
                    {op.actionName}
                  </button>
                </div>

                {/* Initiated By & Time */}
                <div className="text-[12px] text-[#6B7280] mb-2 flex items-center justify-between">
                  <span>Initiated by: <strong className="text-[#374151] font-normal">{op.initiatedBy}</strong></span>
                  <span className="text-[11px] text-[#9CA3AF]">{op.initiatedOn}</span>
                </div>

                {/* Progress Bar & Status */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#374151]">
                    <span>Progress: {op.processedRows.toLocaleString()} / {op.totalRows.toLocaleString()}</span>
                    <span className="font-semibold text-[#111827]">{pct}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        op.status === 'active'
                          ? 'bg-[#0F62FE]'
                          : op.status === 'completed'
                          ? 'bg-[#15803D]'
                          : 'bg-[#B45309]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Footer */}
      <div className="p-3 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
        <span className="text-[12px] text-[#6B7280]">Last 5 action tasks</span>

        <button
          id="view-full-activity-btn"
          onClick={() => {
            navigateTo('bulk_operations_datatable', 'users');
            closeTray();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-[#0F62FE] text-white text-xs font-semibold hover:bg-[#0043CE] transition-colors cursor-pointer"
        >
          <span>View full activity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
