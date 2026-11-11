import React, { useState } from 'react';
import {
  ArrowLeft,
  Square,
  Play,
  RotateCcw,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
  Server,
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Edit3,
  Search,
  Filter,
} from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';
import { FailureDiagnostic, ProcessPhase } from '../types';
import {
  formatDuration,
  formatEta,
  getStatusBadgeConfig,
  downloadErrorCsv,
  downloadAuditSummary,
} from '../utils/formatters';

interface DetailedActionViewProps {
  onOpenInlineFixModal: (operationId: string, failure: FailureDiagnostic) => void;
}

export const DetailedActionView: React.FC<DetailedActionViewProps> = ({
  onOpenInlineFixModal,
}) => {
  const {
    selectedOperation,
    navigateTo,
    haltOperation,
    resumeOperation,
    retryOperation,
  } = useBulkOperations();

  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>('database_write');
  const [failureSearch, setFailureSearch] = useState('');
  const [activeLogFilter, setActiveLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'logs'>('diagnostics');

  if (!selectedOperation) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm text-[#64748B]">No operation selected.</p>
        <button
          onClick={() => navigateTo('bulk_operations_datatable', 'bulk_operations')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Operations Log
        </button>
      </div>
    );
  }

  const op = selectedOperation;
  const badge = getStatusBadgeConfig(op.status);
  const percentComplete = Math.min(
    100,
    Math.round((op.processedRows / (op.totalRows || 1)) * 100)
  );

  const resolvedFailuresCount = op.failures.filter((f) => f.isResolved).length;
  const unresolvedFailures = op.failures.filter((f) => !f.isResolved);
  const successCount = Math.max(0, op.processedRows - unresolvedFailures.length);

  // SVG Circular progress math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const successPct = op.totalRows > 0 ? successCount / op.totalRows : 0;
  const failurePct = op.totalRows > 0 ? unresolvedFailures.length / op.totalRows : 0;

  const successStroke = circumference * successPct;
  const failureStroke = circumference * failurePct;

  // Filtered failures
  const filteredFailures = op.failures.filter((f) => {
    if (!failureSearch) return true;
    const q = failureSearch.toLowerCase();
    return (
      f.rowNumber.toString().includes(q) ||
      f.identifier.toLowerCase().includes(q) ||
      f.attribute.toLowerCase().includes(q) ||
      f.failureReason.toLowerCase().includes(q)
    );
  });

  // Filtered logs
  const filteredLogs = op.logs.filter((log) => {
    if (activeLogFilter === 'all') return true;
    return log.level === activeLogFilter;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb & Job Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div className="space-y-1">
          <button
            id="back-to-log-btn"
            onClick={() => navigateTo('bulk_operations_datatable', 'bulk_operations')}
            className="flex items-center space-x-1.5 text-xs text-[#0F62FE] hover:text-[#0043CE] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Master Operations Log</span>
          </button>

          <div className="flex items-center space-x-3 mt-1">
            <h1 className="text-[22px] font-semibold text-[#111827] tracking-tight">{op.actionName}</h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-[9999px] text-[11px] font-medium border ${badge.bg}`}
            >
              {op.status === 'active' && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#1D4ED8]" />
              )}
              {op.status === 'completed' && (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-[#15803D]" />
              )}
              {op.status === 'partially_failed' && (
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-[#B45309]" />
              )}
              {op.status === 'halted' && (
                <Square className="w-3.5 h-3.5 mr-1.5 text-[#B45309] fill-[#B45309]" />
              )}
              {badge.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
            <span>Operation ID: <strong className="text-[#374151] font-mono">{op.id}</strong></span>
            <span>•</span>
            <span>Initiated by: <strong className="text-[#374151]">{op.initiatedBy}</strong></span>
            <span>•</span>
            <span>Initiated on: <strong className="text-[#374151]">{op.initiatedOn}</strong></span>
            {op.targetOU && (
              <>
                <span>•</span>
                <span>Target OU: <strong className="text-[#374151]">{op.targetOU}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Halt Operation Button */}
          {op.status === 'active' && (
            <button
              id="detail-halt-btn"
              onClick={() => haltOperation(op.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#B91C1C] text-white rounded-[6px] text-xs font-medium hover:bg-[#991B1B] transition-colors"
              title="Aborts remaining queue without rolling back rows already processed successfully"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Halt Operation</span>
            </button>
          )}

          {/* Resume Button */}
          {op.status === 'halted' && (
            <button
              id="detail-resume-btn"
              onClick={() => resumeOperation(op.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0F62FE] text-white rounded-[6px] text-xs font-medium hover:bg-[#0043CE] transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Resume Remaining Queue</span>
            </button>
          )}

          {/* Retry Button */}
          {(op.status === 'partially_failed' || op.status === 'failed') && (
            <button
              id="detail-retry-btn"
              onClick={() => retryOperation(op.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0F62FE] text-white rounded-[6px] text-xs font-medium hover:bg-[#0043CE] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Failed Rows</span>
            </button>
          )}

          {/* Export Error CSV */}
          <button
            id="detail-export-error-csv-btn"
            onClick={() => downloadErrorCsv(op)}
            disabled={op.failures.length === 0}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-medium border transition-colors ${
              op.failures.length > 0
                ? 'bg-[#FEF3C7] text-[#B45309] border-amber-200 hover:bg-[#FDE68A]'
                : 'bg-white text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed'
            }`}
            title="Download CSV containing failed rows"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Error CSV ({op.failures.length})</span>
          </button>

          {/* Download Compliance Audit Proof */}
          <button
            id="detail-export-audit-proof-btn"
            onClick={() => downloadAuditSummary(op)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white text-[#374151] border border-[#D1D5DB] rounded-[6px] text-xs font-medium hover:bg-[#F3F4F6] transition-colors"
            title="Download signed JSON compliance audit record"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Audit Proof</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EXECUTION SUMMARY DASHBOARD */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Circular Visual Status Ring */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-start space-x-6 lg:border-r border-[#E5E7EB] lg:pr-6">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  className="text-[#F3F4F6]"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />

                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke="#0F62FE"
                  strokeWidth="12"
                  strokeDasharray={`${successStroke} ${circumference}`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />

                {failureStroke > 0 && (
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    stroke="#B91C1C"
                    strokeWidth="12"
                    strokeDasharray={`${failureStroke} ${circumference}`}
                    strokeDashoffset={-successStroke}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 ease-out"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-[#111827] tracking-tight">{percentComplete}%</span>
                <span className="text-[11px] font-medium text-[#6B7280]">
                  {op.status === 'active' ? 'Processing' : 'Completed'}
                </span>
              </div>
            </div>

            {/* Ring Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#0F62FE] shrink-0"></span>
                <span className="text-[#374151] font-medium">Committed: {successCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#B91C1C] shrink-0"></span>
                <span className="text-[#374151] font-medium">Failed: {unresolvedFailures.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#E5E7EB] shrink-0"></span>
                <span className="text-[#6B7280]">
                  Remaining: {Math.max(0, op.totalRows - op.processedRows).toLocaleString()}
                </span>
              </div>

              {op.status === 'active' && (
                <div className="pt-1 flex items-center space-x-1.5 text-[11px] text-[#0F62FE] font-medium">
                  <Zap className="w-3.5 h-3.5 text-[#0F62FE]" />
                  <span>{op.processingRatePerSec} rows / sec</span>
                </div>
              )}
            </div>
          </div>

          {/* Metric Counters (Grid of 4) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-[8px] bg-white border border-[#E5E7EB]">
              <span className="text-[12px] font-medium text-[#6B7280] block">Total Rows</span>
              <span className="text-xl font-semibold text-[#111827] mt-1 block">
                {op.totalRows.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-white border border-[#E5E7EB]">
              <span className="text-[12px] font-medium text-[#15803D] block">Successfully Processed</span>
              <span className="text-xl font-semibold text-[#15803D] mt-1 block">
                {successCount.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-white border border-[#E5E7EB]">
              <span className="text-[12px] font-medium text-[#B91C1C] block">Failed Rows</span>
              <span className="text-xl font-semibold text-[#B91C1C] mt-1 block">
                {unresolvedFailures.length}
              </span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-white border border-[#E5E7EB]">
              <span className="text-[12px] font-medium text-[#0F62FE] block">
                {op.status === 'active' ? 'Est. Time Remaining' : 'Total Time Taken'}
              </span>
              <span className="text-xl font-semibold text-[#0F62FE] mt-1 font-mono block">
                {op.status === 'active'
                  ? formatEta(op.timeRemainingSeconds, op.status)
                  : formatDuration(op.timeTakenSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bottom Grid: Process Timeline Stepper (Left 35%) & Failure Diagnostics (Right 65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* SECTION 2: PROCESS TIMELINE (Vertical Stepper per PRD) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <h2 className="text-[16px] font-medium text-[#111827]">Process Progression</h2>
            </div>
          </div>

          {/* Vertical Stepper Container */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-[#E5E7EB]">
            {op.phases.map((phase, idx) => {
              const isCompleted = phase.status === 'completed';
              const isInProgress = phase.status === 'in_progress';
              const isHalted = phase.status === 'halted';
              const isExpanded = expandedPhaseId === phase.id;

              return (
                <div key={phase.id} className="relative">
                  {/* Stepper Node Icon */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ring-4 ring-white ${
                      isCompleted
                        ? 'bg-[#15803D] text-white'
                        : isInProgress
                        ? 'bg-[#0F62FE] text-white animate-pulse'
                        : isHalted
                        ? 'bg-[#B45309] text-white'
                        : 'bg-[#E5E7EB] text-[#6B7280]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : isInProgress ? (
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Phase Content */}
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111827]">{phase.name}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-[9999px] ${
                          isCompleted
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : isInProgress
                            ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                            : isHalted
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : 'bg-[#F3F4F6] text-[#6B7280]'
                        }`}
                      >
                        {isCompleted
                          ? 'Passed'
                          : isInProgress
                          ? 'In Flight'
                          : isHalted
                          ? 'Halted'
                          : 'Pending'}
                      </span>
                    </div>

                    <p className="text-[12px] text-[#6B7280]">{phase.description}</p>

                    {/* Metadata & Sub-logs toggle */}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#6B7280]">
                      {phase.durationSeconds ? (
                        <span>Duration: {phase.durationSeconds}s</span>
                      ) : (
                        <span>Stage {idx + 1}</span>
                      )}

                      {phase.logs.length > 0 && (
                        <button
                          onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                          className="text-[#0F62FE] hover:text-[#0043CE] font-medium flex items-center space-x-1"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Logs'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expandable Execution Sub-logs */}
                    {isExpanded && phase.logs.length > 0 && (
                      <div className="mt-2 p-2.5 bg-[#111827] rounded-[6px] font-mono text-[10px] text-[#E5E7EB] space-y-1 overflow-x-auto max-h-32">
                        {phase.logs.map((log, lIdx) => (
                          <div key={lIdx} className="whitespace-pre-wrap">
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: FAILURE DIAGNOSTICS & INLINE RESOLUTION TABLE */}
        <div className="lg:col-span-8 bg-white rounded-[8px] border border-[#E5E7EB] p-6 space-y-4">
          {/* Tab Selection: Diagnostics vs Live Telemetry Stream */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`pb-2 text-xs font-medium transition-colors relative ${
                  activeTab === 'diagnostics'
                    ? 'text-[#0F62FE] border-b-2 border-[#0F62FE]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <span>Failure Diagnostics ({op.failures.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`pb-2 text-xs font-medium transition-colors relative ${
                  activeTab === 'logs'
                    ? 'text-[#0F62FE] border-b-2 border-[#0F62FE]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <span>Live Audit Log ({op.logs.length})</span>
              </button>
            </div>

            {/* Quick Actions for Active Tab */}
            {activeTab === 'diagnostics' ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter failed rows..."
                    value={failureSearch}
                    onChange={(e) => setFailureSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 bg-white border border-[#D1D5DB] rounded-[6px] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0F62FE] w-48"
                  />
                </div>

                <button
                  onClick={() => downloadErrorCsv(op)}
                  disabled={op.failures.length === 0}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#FEF3C7] text-[#B45309] border border-amber-200 rounded-[6px] text-xs font-medium hover:bg-[#FDE68A] transition-colors"
                  title="Download CSV of failed records"
                >
                  <Download className="w-3 h-3" />
                  <span>Error CSV</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-xs">
                {(['all', 'error', 'warn', 'info'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setActiveLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded-[6px] capitalize text-[11px] font-medium ${
                      activeLogFilter === lvl
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: FAILURE DIAGNOSTICS TABLE */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-3">
              {filteredFailures.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#15803D] bg-[#DCFCE7]/40 rounded-[8px] border border-[#DCFCE7] p-6">
                  <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto mb-2" />
                  <span className="font-semibold text-sm block text-[#111827]">Zero Failure Anomalies Detected</span>
                  <p className="text-[#6B7280] mt-1">
                    All entity rows passed schema validation and committed successfully to directory storage.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5E7EB] rounded-[8px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#6B7280] font-medium text-[12px]">
                          <th className="py-2.5 px-3 w-16">Row #</th>
                          <th className="py-2.5 px-3 min-w-[150px]">Entity Identifier</th>
                          <th className="py-2.5 px-3 min-w-[110px]">Attribute</th>
                          <th className="py-2.5 px-3 min-w-[280px]">Diagnostic Failure Reason</th>
                          <th className="py-2.5 px-3 min-w-[120px]">Resolution</th>
                          <th className="py-2.5 px-3 text-right">Quick Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#E5E7EB]">
                        {filteredFailures.map((failure) => (
                          <tr
                            key={failure.id}
                            className={`hover:bg-[#F9FAFB] transition-colors ${
                              failure.isResolved ? 'bg-[#DCFCE7]/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono font-medium text-[#111827]">
                              Row {failure.rowNumber}
                            </td>

                            <td className="py-2.5 px-3 font-medium text-[#374151] truncate max-w-[160px]">
                              {failure.identifier}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#F3F4F6] font-mono text-[11px] text-[#374151] font-medium border border-[#E5E7EB]">
                                {failure.attribute}
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              <span
                                className={`text-[12px] font-medium block ${
                                  failure.isResolved ? 'text-[#15803D]' : 'text-[#B91C1C]'
                                }`}
                              >
                                {failure.failureReason}
                              </span>
                              {!failure.isResolved && failure.originalValue && (
                                <span className="text-[11px] text-[#6B7280] block font-mono mt-0.5">
                                  Raw Value: "{failure.originalValue}"
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              {failure.isResolved ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[10px] font-medium bg-[#DCFCE7] text-[#15803D]">
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-[#15803D]" />
                                  Resolved Inline
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[10px] font-medium bg-[#FEE2E2] text-[#B91C1C]">
                                  Pending Fix
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              {failure.isResolved ? (
                                <span className="text-[11px] text-[#6B7280]">Committed</span>
                              ) : (
                                <button
                                  id={`fix-row-btn-${failure.id}`}
                                  onClick={() => onOpenInlineFixModal(op.id, failure)}
                                  className="px-2.5 py-1 text-[11px] font-medium text-[#0F62FE] hover:text-[#0043CE] bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] transition-colors inline-flex items-center space-x-1"
                                  title="Fix attribute inline without re-uploading entire file"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Fix & Re-validate</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE AUDIT LOG STREAM */}
          {activeTab === 'logs' && (
            <div className="bg-[#111827] rounded-[8px] p-4 font-mono text-xs text-[#E5E7EB] space-y-1.5 max-h-[380px] overflow-y-auto">
              <div className="text-[11px] text-[#9CA3AF] pb-2 border-b border-[#374151] flex justify-between">
                <span>Real-Time Ingestion Telemetry Stream</span>
                <span>ISO 27001 Audit Ready</span>
              </div>

              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 py-0.5 text-[11px]">
                  <span className="text-[#6B7280] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`uppercase font-medium px-1.5 py-0.5 rounded-[4px] text-[9px] shrink-0 ${
                      log.level === 'error'
                        ? 'bg-[#B91C1C] text-white'
                        : log.level === 'warn'
                        ? 'bg-[#B45309] text-white'
                        : 'bg-[#0F62FE] text-white'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-[#9CA3AF] shrink-0">[{log.phase}]</span>
                  <span className="text-[#E5E7EB] flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
