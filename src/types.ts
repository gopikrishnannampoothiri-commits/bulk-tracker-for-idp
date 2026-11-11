export type OperationStatus = 'active' | 'completed' | 'halted' | 'partially_failed' | 'failed';

export type OperationType = 
  | 'csv_import'
  | 'directory_sync'
  | 'permission_assignment'
  | 'deprovision'
  | 'ou_migration'
  | 'mfa_reset';

export interface ProcessPhase {
  id: 'validation' | 'queuing' | 'database_write' | 'log_generation';
  name: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'halted' | 'failed';
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  logs: string[];
}

export interface FailureDiagnostic {
  id: string;
  rowNumber: number;
  identifier: string; // e.g. email or username
  attribute: string; // e.g. "Department", "Manager Email", "OU Path"
  failureReason: string; // e.g. "Row 42: Department attribute missing: 'SecOps' OU not mapped in tree"
  originalValue: string;
  correctedValue?: string;
  isResolved?: boolean;
  resolvedAt?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  phase: string;
  message: string;
}

export interface BulkOperation {
  id: string;
  actionName: string;
  actionType: OperationType;
  status: OperationStatus;
  initiatedOn: string;
  initiatedBy: string;
  completedOn: string | null;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  timeTakenSeconds: number;
  timeRemainingSeconds: number;
  processingRatePerSec: number;
  phases: ProcessPhase[];
  failures: FailureDiagnostic[];
  logs: AuditLogEntry[];
  fileName?: string;
  fileSize?: string;
  targetOU?: string;
  haltedAt?: string;
  haltedBy?: string;
}

export type NavigationTab = 'directory' | 'applications' | 'security' | 'settings' | 'reports';
export type SubNavDirectory = 'users' | 'groups' | 'ou' | 'directory_integration' | 'bulk_operations';
export type CurrentView = 'dashboard' | 'users' | 'bulk_operations_datatable' | 'detailed_action';

export interface UserRecord {
  id: string;
  name: string;
  userName: string;
  status: 'Active' | 'Inactive';
  email: string;
  ou: string;
  source: string;
}
