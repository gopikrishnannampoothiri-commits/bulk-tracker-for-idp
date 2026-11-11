import React, { useState } from 'react';
import {
  Info,
  RotateCw,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileSpreadsheet,
} from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';
import { formatEta } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const { operations, selectOperation, navigateTo, activeCount } = useBulkOperations();
  const [timeRange, setTimeRange] = useState('Last 24 hours');
  const [metricFilter, setMetricFilter] = useState('Total Sign-ins');

  // Active or failed operation for live dashboard highlight
  const activeOp = operations.find((op) =>
    ['active', 'partially_failed', 'halted', 'failed'].includes(op.status)
  );

  const activityFeed = [
    { email: 'pm-admin@hexnodeidp.com', action: 'Token Refresh Failed', time: '26 secs', dot: 'bg-amber-500' },
    { email: 'pm-admin@hexnodeidp.com', action: 'Token Refresh Failed', time: '26 secs', dot: 'bg-amber-500' },
    { email: 'ron.mechery@mitsogo.com', action: 'Login Success', time: '1hrs', dot: 'bg-emerald-500' },
    { email: 'ron.mechery@mitsogo.com', action: 'Session Create', time: '1hrs', dot: 'bg-purple-500' },
    { email: 'ron.mechery@mitsogo.com', action: 'Mfa Verification Success', time: '1hrs', dot: 'bg-emerald-500' },
    { email: 'uma.unnikrishnan@mitsogo.com', action: 'Token Refresh Failed', time: '2hrs', dot: 'bg-amber-500' },
    { email: 'uma.unnikrishnan@mitsogo.com', action: 'Token Refresh Failed', time: '2hrs', dot: 'bg-amber-500' },
    { email: 'ajith.varghese@mitsogo.com', action: 'Token Refresh Success', time: '2hrs', dot: 'bg-emerald-500' },
    { email: 'pm-admin@hexnodeidp.com', action: 'Token Refresh Failed', time: '4hrs', dot: 'bg-amber-500' },
    { email: 'pm-admin@hexnodeidp.com', action: 'Token Refresh Failed', time: '4hrs', dot: 'bg-amber-500' },
    { email: 'pm-admin@hexnodeidp.com', action: 'Token Refresh Success', time: '19hrs', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight">ACME Corporations</h1>
          <button className="text-[#6B7280] hover:text-[#111827]">
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-[#6B7280]">
            <span>Last updated: Just now</span>
            <button className="p-1 hover:bg-[#F3F4F6] rounded-[6px] transition-colors" title="Refresh metrics">
              <RotateCw className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Horizontal Progress Tile (In Progress / Failed Only) */}
      {activeOp && (
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 relative overflow-hidden shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center text-[#0F62FE] shrink-0">
                {activeOp.status === 'active' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#B45309]" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-sm font-semibold text-[#111827] truncate">{activeOp.actionName}</h3>
                
                {/* Progress Status */}
                <div className="flex items-center space-x-3 max-w-lg">
                  <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        activeOp.status === 'active'
                          ? 'bg-[#0F62FE]'
                          : 'bg-[#B45309]'
                      }`}
                      style={{
                        width: `${Math.round((activeOp.processedRows / (activeOp.totalRows || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#374151] shrink-0">
                    {Math.round((activeOp.processedRows / (activeOp.totalRows || 1)) * 100)}% ({activeOp.processedRows.toLocaleString()} / {activeOp.totalRows.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>

            {/* View Details Button */}
            <div className="flex items-center shrink-0">
              <button
                id="banner-view-details-btn"
                onClick={() => selectOperation(activeOp.id)}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-[6px] transition-colors whitespace-nowrap flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-[8px] border border-[#E5E7EB]">
          <div className="text-[12px] font-medium text-[#6B7280]">Total Users</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold text-[#111827]">2,856</span>
            <span className="flex items-center text-xs font-medium text-[#B91C1C]">
              -0.00%
              <TrendingDown className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Total Groups */}
        <div className="bg-white p-5 rounded-[8px] border border-[#E5E7EB]">
          <div className="text-[12px] font-medium text-[#6B7280]">Total Groups</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold text-[#111827]">383</span>
            <span className="flex items-center text-xs font-medium text-[#15803D]">
              +0.52%
              <TrendingUp className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Total OUs */}
        <div className="bg-white p-5 rounded-[8px] border border-[#E5E7EB]">
          <div className="text-[12px] font-medium text-[#6B7280]">Total OUs</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold text-[#111827]">30</span>
            <span className="flex items-center text-xs font-medium text-[#B91C1C]">
              -0.00%
              <TrendingDown className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-5 rounded-[8px] border border-[#E5E7EB]">
          <div className="text-[12px] font-medium text-[#6B7280]">Active Users</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-semibold text-[#111827]">26</span>
            <span className="flex items-center text-xs font-medium text-[#B91C1C]">
              -0.00%
              <TrendingDown className="w-3 h-3 ml-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Login Activity Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Login Activity Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[8px] border border-[#E5E7EB] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-medium text-[#111827]">Login Activity</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-[#D1D5DB] rounded-[6px] px-3 py-1.5 pr-8 text-xs font-medium text-[#374151] focus:outline-none focus:border-[#0F62FE]"
                >
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={metricFilter}
                  onChange={(e) => setMetricFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#D1D5DB] rounded-[6px] px-3 py-1.5 pr-8 text-xs font-medium text-[#374151] focus:outline-none focus:border-[#0F62FE]"
                >
                  <option>Total Sign-ins</option>
                  <option>Failed Sign-ins</option>
                  <option>MFA Authentications</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-[#6B7280]">
              {[5, 4, 3, 2, 1, 0].map((val) => (
                <div key={val} className="flex items-center w-full">
                  <span className="w-6 text-right mr-3 text-[11px]">{val}</span>
                  <div className="flex-1 border-b border-[#E5E7EB]" />
                </div>
              ))}
            </div>

            <svg className="absolute inset-0 w-full h-full pl-9 overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
              <path
                d="M 10 190 L 100 190 L 190 190 L 280 190 L 370 190 L 460 190 L 550 190 L 680 150"
                fill="none"
                stroke="#0F62FE"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="10" cy="190" r="4" fill="#0F62FE" />
              <circle cx="100" cy="190" r="4" fill="#0F62FE" />
              <circle cx="190" cy="190" r="4" fill="#0F62FE" />
              <circle cx="280" cy="190" r="4" fill="#0F62FE" />
              <circle cx="370" cy="190" r="4" fill="#0F62FE" />
              <circle cx="460" cy="190" r="4" fill="#0F62FE" />
              <circle cx="550" cy="190" r="4" fill="#0F62FE" />
              <circle cx="680" cy="150" r="4" fill="#0F62FE" />
            </svg>
          </div>

          {/* X-Axis Timestamps */}
          <div className="flex justify-between pl-9 text-[11px] text-[#6B7280] font-medium">
            <span>09-01 14:00</span>
            <span>09-01 17:00</span>
            <span>09-01 20:00</span>
            <span>09-01 23:00</span>
            <span>09-02 02:00</span>
            <span>09-02 05:00</span>
            <span>09-02 08:00</span>
            <span>09-02 14:00</span>
          </div>

          <div className="pt-2 text-xs text-[#6B7280] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#0F62FE]"></span>
            <span className="font-medium text-[#374151]">Timings</span>
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-2">
              <RotateCw className="w-4 h-4 text-[#6B7280]" />
              <h2 className="text-[14px] font-medium text-[#111827]">Activity Feed</h2>
            </div>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {activityFeed.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#111827] truncate">{item.email}</div>
                  <div className="text-[11px] text-[#6B7280]">
                    {item.action} • {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
