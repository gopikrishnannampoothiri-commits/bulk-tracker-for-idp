import { BulkOperation, FailureDiagnostic, OperationStatus } from '../types';

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

export function formatEta(seconds: number, status: OperationStatus): string {
  if (status === 'completed') return '—';
  if (status === 'halted') return 'Halted';
  if (status === 'failed') return 'Failed';
  if (status === 'partially_failed') return '—';
  if (seconds <= 0) return 'Finalizing...';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `~${mins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `~${secs}s`;
}

export function getStatusBadgeConfig(status: OperationStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        bg: 'bg-[#EFF6FF] text-[#1D4ED8] border-blue-200',
        dot: 'bg-[#1D4ED8] animate-pulse',
        ring: '#1D4ED8',
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-[#DCFCE7] text-[#15803D] border-green-200',
        dot: 'bg-[#15803D]',
        ring: '#15803D',
      };
    case 'partially_failed':
      return {
        label: 'Partially Failed',
        bg: 'bg-[#FEF3C7] text-[#B45309] border-amber-200',
        dot: 'bg-[#B45309]',
        ring: '#B45309',
      };
    case 'halted':
      return {
        label: 'Halted',
        bg: 'bg-[#FEF3C7] text-[#B45309] border-amber-200',
        dot: 'bg-[#B45309]',
        ring: '#B45309',
      };
    case 'failed':
      return {
        label: 'Failed',
        bg: 'bg-[#FEE2E2] text-[#B91C1C] border-red-200',
        dot: 'bg-[#B91C1C]',
        ring: '#B91C1C',
      };
  }
}

export function downloadErrorCsv(operation: BulkOperation): void {
  const headers = ['Row Number', 'Entity Identifier', 'Failed Attribute', 'Failure Diagnostic Reason', 'Original Value', 'Timestamp', 'Resolution Status'];
  const rows = operation.failures.map((f) => [
    f.rowNumber,
    `"${(f.identifier || '').replace(/"/g, '""')}"`,
    `"${(f.attribute || '').replace(/"/g, '""')}"`,
    `"${(f.failureReason || '').replace(/"/g, '""')}"`,
    `"${(f.originalValue || '').replace(/"/g, '""')}"`,
    `"${f.timestamp}"`,
    f.isResolved ? 'Resolved' : 'Pending Correction'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedName = operation.actionName.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${sanitizedName}_Failures_Report_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAuditSummary(operation: BulkOperation): void {
  const summary = {
    auditEvent: 'HEXNODE_BULK_OPERATION_RECORD',
    operationId: operation.id,
    actionName: operation.actionName,
    actionType: operation.actionType,
    status: operation.status,
    initiatedBy: operation.initiatedBy,
    initiatedOn: operation.initiatedOn,
    completedOn: operation.completedOn || 'In Progress',
    totalEntities: operation.totalRows,
    successfullyProcessed: operation.processedRows - operation.failedRows,
    failedEntities: operation.failedRows,
    phasesSummary: operation.phases.map(p => ({
      phase: p.name,
      status: p.status,
      duration: p.durationSeconds ? `${p.durationSeconds}s` : 'N/A',
    })),
    retentionPolicy: 'Retained for 90 days per compliance audit mandate',
    generatedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${operation.id}_Compliance_Audit_Proof.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
