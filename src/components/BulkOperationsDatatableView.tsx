import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Square,
  Play,
  RotateCw,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  MoreVertical,
} from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';
import { BulkOperation, OperationStatus } from '../types';
import { formatDuration, formatEta, getStatusBadgeConfig, downloadErrorCsv, downloadAuditSummary } from '../utils/formatters';

export const BulkOperationsDatatableView: React.FC = () => {
  const {
    operations,
    selectOperation,
    haltOperation,
    resumeOperation,
    retryOperation,
    activeCount,
  } = useBulkOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('90days');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter operations based on query, status, and retention dates
  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = op.actionName.toLowerCase().includes(q);
        const matchAdmin = op.initiatedBy.toLowerCase().includes(q);
        const matchOU = op.targetOU?.toLowerCase().includes(q) || false;
        if (!matchName && !matchAdmin && !matchOU) return false;
      }

      // Status
      if (statusFilter !== 'all') {
        if (op.status !== statusFilter) return false;
      }

      return true;
    });
  }, [operations, searchQuery, statusFilter, dateFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredOperations.length / pageSize));
  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Overall metric stats
  const totalProcessedEntities = operations.reduce((sum, op) => sum + op.processedRows, 0);
  const totalFailures = operations.reduce((sum, op) => sum + op.failedRows, 0);
  const completedJobsCount = operations.filter((op) => op.status === 'completed').length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[12px] text-[#6B7280] mb-1">
            <span>Directory</span>
            <span>/</span>
            <span className="font-medium text-[#111827]">System Activity & Bulk Operations</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#111827] tracking-tight">
            Master Operations Log
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* 90-Day Retention Compliance Pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[9999px] bg-[#DCFCE7] border border-green-200 text-xs font-medium text-[#15803D]">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>90-Day Audit Retention Compliant</span>
          </div>
        </div>
      </div>

      {/* Summary Highlights Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB]">
          <span className="text-[12px] font-medium text-[#6B7280]">Active Jobs In-Flight</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[24px] font-semibold text-[#0F62FE]">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB]">
          <span className="text-[12px] font-medium text-[#6B7280]">Total Entities Processed</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[24px] font-semibold text-[#111827]">
              {totalProcessedEntities.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB]">
          <span className="text-[12px] font-medium text-[#6B7280]">Completed Operations</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[24px] font-semibold text-[#15803D]">{completedJobsCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB]">
          <span className="text-[12px] font-medium text-[#6B7280]">Total Failed Rows</span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[24px] font-semibold text-[#B91C1C]">{totalFailures}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-[8px] border border-[#E5E7EB] space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action name, admin, OU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D1D5DB] rounded-[6px] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F62FE]"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="text-[#6B7280] font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded-[6px] px-2.5 py-1.5 text-xs font-medium text-[#374151] focus:outline-none focus:border-[#0F62FE]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (In Progress)</option>
                <option value="completed">Completed</option>
                <option value="partially_failed">Partially Failed</option>
                <option value="halted">Halted</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center space-x-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="text-[#6B7280] font-medium">Date Range:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded-[6px] px-2.5 py-1.5 text-xs font-medium text-[#374151] focus:outline-none focus:border-[#0F62FE]"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days (Retention Max)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MASTER OPERATIONS DATATABLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#6B7280] font-medium text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[280px]">Action</th>
                <th className="py-3 px-4 min-w-[120px]">Status</th>
                <th className="py-3 px-4 min-w-[140px]">Initiated On</th>
                <th className="py-3 px-4 min-w-[160px]">Initiated By</th>
                <th className="py-3 px-4 min-w-[140px]">Completed On</th>
                <th className="py-3 px-4 min-w-[180px]">Progress</th>
                <th className="py-3 px-4 min-w-[100px]">Time Taken</th>
                <th className="py-3 px-4 min-w-[110px]">Time Remaining</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedOperations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No operations match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedOperations.map((op) => {
                  const pct = Math.min(
                    100,
                    Math.round((op.processedRows / (op.totalRows || 1)) * 100)
                  );
                  const badge = getStatusBadgeConfig(op.status);

                  return (
                    <tr
                      key={op.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-default"
                    >
                      {/* Column 1: Action + Options Dropdown */}
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <button
                              id={`action-link-${op.id}`}
                              onClick={() => selectOperation(op.id)}
                              className="text-[#0F62FE] hover:underline flex items-center space-x-1.5 text-left group-hover:text-[#0043CE] transition-colors"
                            >
                              <span className="font-semibold truncate text-[13px]">{op.actionName}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                            {op.fileName && (
                              <span className="text-[11px] text-[#6B7280] block mt-0.5 truncate">
                                Source: {op.fileName} • {op.fileSize}
                              </span>
                            )}
                          </div>

                          {/* Options dropdown button in action column */}
                          <div
                            className="relative shrink-0"
                            ref={openMenuId === op.id ? menuRef : null}
                          >
                            <button
                              id={`action-options-btn-${op.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === op.id ? null : op.id);
                              }}
                              className={`p-1.5 rounded-[6px] border transition-all ${
                                openMenuId === op.id
                                  ? 'bg-blue-50 border-blue-200 text-[#0F62FE]'
                                  : 'border-transparent hover:border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
                              }`}
                              title="Operation Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenuId === op.id && (
                              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-[8px] shadow-lg border border-[#E5E7EB] py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    selectOperation(op.id);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-[#374151] hover:bg-[#F3F4F6] hover:text-[#0F62FE] transition-colors text-left"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
                                  <span className="font-medium">View Detailed Diagnostics</span>
                                </button>

                                {op.status === 'active' && (
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      haltOperation(op.id);
                                    }}
                                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors text-left font-medium"
                                  >
                                    <Square className="w-3.5 h-3.5 fill-[#B91C1C] text-[#B91C1C]" />
                                    <span>Halt Remaining Queue</span>
                                  </button>
                                )}

                                {op.status === 'halted' && (
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      resumeOperation(op.id);
                                    }}
                                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-[#0F62FE] hover:bg-[#EFF6FF] transition-colors text-left font-medium"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-[#0F62FE] text-[#0F62FE]" />
                                    <span>Resume Queue Processing</span>
                                  </button>
                                )}

                                {op.failures.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      downloadErrorCsv(op);
                                    }}
                                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-[#B45309] hover:bg-[#FEF3C7] transition-colors text-left font-medium"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#B45309]" />
                                    <span>Download Error CSV</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-[#E5E7EB]" />

                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    downloadAuditSummary(op);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors text-left"
                                >
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6B7280]" />
                                  <span>Export Audit Record (JSON)</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-[9999px] text-[11px] font-medium border ${badge.bg}`}
                        >
                          {op.status === 'active' && (
                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin text-[#1D4ED8]" />
                          )}
                          {op.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 mr-1.5 text-[#15803D]" />
                          )}
                          {op.status === 'partially_failed' && (
                            <AlertTriangle className="w-3 h-3 mr-1.5 text-[#B45309]" />
                          )}
                          {op.status === 'halted' && (
                            <Square className="w-3 h-3 mr-1.5 text-[#B45309] fill-[#B45309]" />
                          )}
                          {badge.label}
                        </span>
                      </td>

                      {/* Column 3: Initiated On */}
                      <td className="py-3.5 px-4 text-[#374151] text-[12px]">
                        <div>{op.initiatedOn.split(' ')[0]}</div>
                        <div className="text-[11px] text-[#6B7280]">{op.initiatedOn.split(' ')[1]}</div>
                      </td>

                      {/* Column 4: Initiated By */}
                      <td className="py-3.5 px-4 text-[#374151]">
                        <span className="font-medium text-[#111827] text-[13px]">{op.initiatedBy}</span>
                      </td>

                      {/* Column 5: Completed On */}
                      <td className="py-3.5 px-4 text-[#374151] text-[12px]">
                        {op.completedOn ? (
                          <div>
                            <div>{op.completedOn.split(' ')[0]}</div>
                            <div className="text-[11px] text-[#6B7280]">{op.completedOn.split(' ')[1]}</div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-[#0F62FE] font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#0F62FE] animate-pulse"></span>
                            <span>In Progress</span>
                          </div>
                        )}
                      </td>

                      {/* Column 6: Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-medium text-[#374151]">
                              {op.processedRows.toLocaleString()} / {op.totalRows.toLocaleString()}
                            </span>
                            <span className="font-semibold text-[#111827]">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                op.status === 'active'
                                  ? 'bg-[#0F62FE]'
                                  : op.status === 'completed'
                                  ? 'bg-[#15803D]'
                                  : op.status === 'partially_failed'
                                  ? 'bg-[#B45309]'
                                  : op.status === 'halted'
                                  ? 'bg-[#B45309]'
                                  : 'bg-[#B91C1C]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Column 7: Time Taken */}
                      <td className="py-3.5 px-4 font-mono text-[#374151] text-[12px]">
                        {formatDuration(op.timeTakenSeconds)}
                      </td>

                      {/* Column 8: Time Remaining */}
                      <td className="py-3.5 px-4 font-mono text-[12px]">
                        {op.status === 'active' ? (
                          <span className="text-[#0F62FE] font-medium">
                            {formatEta(op.timeRemainingSeconds, op.status)}
                          </span>
                        ) : (
                          <span className="text-[#9CA3AF]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] gap-3">
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#D1D5DB] rounded-[6px] px-2 py-1 bg-white text-xs text-[#374151]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>operations per page</span>
            <span className="text-[#D1D5DB]">|</span>
            <span>
              Showing {Math.min(filteredOperations.length, (currentPage - 1) * pageSize + 1)}-
              {Math.min(filteredOperations.length, currentPage * pageSize)} of{' '}
              {filteredOperations.length}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-[6px] hover:bg-[#F3F4F6] text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-6 h-6 rounded-[6px] text-xs font-medium transition-colors ${
                  currentPage === p
                    ? 'bg-[#0F62FE] text-white font-semibold'
                    : 'hover:bg-[#F3F4F6] text-[#374151]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-[6px] hover:bg-[#F3F4F6] text-[#6B7280] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
