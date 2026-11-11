import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  BulkOperation,
  CurrentView,
  FailureDiagnostic,
  NavigationTab,
  OperationType,
  SubNavDirectory,
} from '../types';
import { INITIAL_OPERATIONS } from '../data/mockOperations';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  operationId?: string;
  timestamp: string;
}

interface BulkOperationsContextType {
  operations: BulkOperation[];
  selectedOperation: BulkOperation | null;
  selectedOperationId: string | null;
  currentNav: NavigationTab;
  currentSubNav: SubNavDirectory;
  currentView: CurrentView;
  isTrayOpen: boolean;
  isSimulationPaused: boolean;
  toasts: ToastMessage[];
  activeCount: number;
  totalPendingErrors: number;
  
  // Actions
  setCurrentNav: (nav: NavigationTab) => void;
  setCurrentSubNav: (subNav: SubNavDirectory) => void;
  setCurrentView: (view: CurrentView) => void;
  navigateTo: (view: CurrentView, subNav?: SubNavDirectory) => void;
  selectOperation: (id: string) => void;
  toggleTray: () => void;
  openTray: () => void;
  closeTray: () => void;
  toggleSimulationPause: () => void;
  
  // Operations mutations
  haltOperation: (id: string, reason?: string) => void;
  resumeOperation: (id: string) => void;
  retryOperation: (id: string) => void;
  resolveFailure: (operationId: string, failureId: string, correctedValue: string) => void;
  createNewOperation: (payload: {
    actionName: string;
    actionType: OperationType;
    totalRows: number;
    fileName?: string;
    targetOU?: string;
    simulateFailures?: boolean;
  }) => string;
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
}

const BulkOperationsContext = createContext<BulkOperationsContextType | undefined>(undefined);

const STORAGE_KEY = 'hexnode_bulk_operations_state_v1';

export const BulkOperationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [operations, setOperations] = useState<BulkOperation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_OPERATIONS;
  });

  const [selectedOperationId, setSelectedOperationId] = useState<string | null>('op-101');
  const [currentNav, setCurrentNav] = useState<NavigationTab>('directory');
  const [currentSubNav, setCurrentSubNav] = useState<SubNavDirectory>('users');
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist operations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
    } catch {
      // Ignore
    }
  }, [operations]);

  // Active operations count
  const activeCount = operations.filter((op) => op.status === 'active').length;

  // Total unresolved failure diagnostics
  const totalPendingErrors = operations.reduce(
    (acc, op) => acc + (op.failures?.filter((f) => !f.isResolved).length || 0),
    0
  );

  const selectedOperation = operations.find((op) => op.id === selectedOperationId) || null;

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (view: CurrentView, subNav?: SubNavDirectory) => {
    setCurrentView(view);
    if (subNav) {
      setCurrentSubNav(subNav);
    }
    if (view === 'bulk_operations_datatable' || view === 'detailed_action') {
      setCurrentNav('directory');
      setCurrentSubNav('bulk_operations');
    }
    setIsTrayOpen(false);
  };

  const selectOperation = (id: string) => {
    setSelectedOperationId(id);
    navigateTo('detailed_action', 'bulk_operations');
  };

  const toggleTray = () => setIsTrayOpen((prev) => !prev);
  const openTray = () => setIsTrayOpen(true);
  const closeTray = () => setIsTrayOpen(false);
  const toggleSimulationPause = () => setIsSimulationPaused((prev) => !prev);

  // Real-Time Background Worker Engine
  useEffect(() => {
    if (isSimulationPaused) return;

    const interval = setInterval(() => {
      setOperations((prevOps) => {
        let changed = false;

        const updated = prevOps.map((op) => {
          if (op.status !== 'active') return op;

          changed = true;
          const rate = op.processingRatePerSec || 20;
          // Step increment
          const increment = Math.round(rate * 2 + (Math.random() * 6 - 3));
          const newProcessed = Math.min(op.totalRows, op.processedRows + Math.max(1, increment));
          const newTimeTaken = op.timeTakenSeconds + 2;
          const remainingRows = Math.max(0, op.totalRows - newProcessed);
          const newTimeRemaining = Math.max(0, Math.round(remainingRows / (rate || 1)));

          // Check if completion reached
          if (newProcessed >= op.totalRows) {
            const hasFailures = op.failedRows > 0;
            const finalStatus = hasFailures ? 'partially_failed' : 'completed';
            const completedTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

            const updatedPhases = op.phases.map((p) => {
              if (p.id === 'database_write') {
                return { ...p, status: 'completed' as const, completedAt: new Date().toLocaleTimeString() };
              }
              if (p.id === 'log_generation') {
                return {
                  ...p,
                  status: 'completed' as const,
                  startedAt: new Date().toLocaleTimeString(),
                  completedAt: new Date().toLocaleTimeString(),
                  durationSeconds: 15,
                  logs: [
                    ...p.logs,
                    `[${new Date().toLocaleTimeString()}] Batch operations completed. 100% processed.`,
                    `[${new Date().toLocaleTimeString()}] Retention lock enabled: 90 days audit compliance.`,
                  ],
                };
              }
              return p;
            });

            addToast({
              type: hasFailures ? 'warning' : 'success',
              title: hasFailures ? 'Job Finished with Warnings' : 'Bulk Operation Completed',
              message: `${op.actionName} processed ${op.totalRows.toLocaleString()} records (${op.failedRows} failures).`,
              operationId: op.id,
            });

            return {
              ...op,
              status: finalStatus,
              processedRows: op.totalRows,
              timeTakenSeconds: newTimeTaken,
              timeRemainingSeconds: 0,
              completedOn: completedTimestamp,
              phases: updatedPhases,
              logs: [
                ...op.logs,
                {
                  id: 'log-' + Date.now(),
                  timestamp: new Date().toLocaleTimeString(),
                  level: 'info' as const,
                  phase: 'Finalization',
                  message: `All ${op.totalRows.toLocaleString()} rows processed. Job concluded successfully.`,
                },
              ],
            };
          }

          // Otherwise, active progress update
          const updatedPhases = op.phases.map((phase) => {
            if (phase.id === 'database_write') {
              return {
                ...phase,
                durationSeconds: (phase.durationSeconds || 0) + 2,
                logs:
                  phase.logs.length < 10 && Math.random() > 0.7
                    ? [
                        ...phase.logs,
                        `[${new Date().toLocaleTimeString()}] Processing batch ${(
                          Math.floor(newProcessed / 500) + 1
                        ).toString().padStart(2, '0')}: ${newProcessed.toLocaleString()} / ${op.totalRows.toLocaleString()} completed`,
                      ]
                    : phase.logs,
              };
            }
            return phase;
          });

          return {
            ...op,
            processedRows: newProcessed,
            timeTakenSeconds: newTimeTaken,
            timeRemainingSeconds: newTimeRemaining,
            phases: updatedPhases,
          };
        });

        return changed ? updated : prevOps;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulationPaused]);

  // Halt Operation (Safe queue abort without rollback)
  const haltOperation = (id: string, reason = 'Operator triggered emergency queue halt') => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id !== id) return op;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const updatedPhases = op.phases.map((p) => {
          if (p.status === 'in_progress') {
            return {
              ...p,
              status: 'halted' as const,
              logs: [...p.logs, `[${new Date().toLocaleTimeString()}] *** HALTED BY OPERATOR: ${reason} ***`],
            };
          }
          return p;
        });

        addToast({
          type: 'warning',
          title: 'Operation Halted',
          message: `Remaining queue for "${op.actionName}" was safely aborted at ${op.processedRows.toLocaleString()} records.`,
          operationId: op.id,
        });

        return {
          ...op,
          status: 'halted',
          haltedAt: now,
          haltedBy: 'pm-admin@hexnodeidp.com',
          phases: updatedPhases,
          logs: [
            ...op.logs,
            {
              id: 'log-' + Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              level: 'warn',
              phase: 'Job Control',
              message: `Halt trigger invoked. Aborted remaining queue (${(
                op.totalRows - op.processedRows
              ).toLocaleString()} rows). Successfully committed records are preserved.`,
            },
          ],
        };
      })
    );
  };

  // Resume or retry a halted / failed job
  const resumeOperation = (id: string) => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id !== id) return op;
        const updatedPhases = op.phases.map((p) => {
          if (p.status === 'halted' || (p.status === 'pending' && p.id === 'database_write')) {
            return {
              ...p,
              status: 'in_progress' as const,
              logs: [...p.logs, `[${new Date().toLocaleTimeString()}] Resuming worker thread from record ${op.processedRows}`],
            };
          }
          return p;
        });

        addToast({
          type: 'info',
          title: 'Operation Resumed',
          message: `Resuming queue for "${op.actionName}" from row ${op.processedRows.toLocaleString()}.`,
          operationId: op.id,
        });

        return {
          ...op,
          status: 'active',
          phases: updatedPhases,
          logs: [
            ...op.logs,
            {
              id: 'log-' + Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              level: 'info',
              phase: 'Job Control',
              message: 'Queue execution resumed by administrator.',
            },
          ],
        };
      })
    );
  };

  const retryOperation = (id: string) => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id !== id) return op;
        addToast({
          type: 'info',
          title: 'Retrying Operation',
          message: `Re-dispatching worker pipeline for "${op.actionName}".`,
          operationId: op.id,
        });

        return {
          ...op,
          status: 'active',
          timeRemainingSeconds: Math.round((op.totalRows - op.processedRows) / (op.processingRatePerSec || 20)),
          phases: op.phases.map((p) => {
            if (p.id === 'database_write') {
              return { ...p, status: 'in_progress' };
            }
            if (p.id === 'log_generation') {
              return { ...p, status: 'pending' };
            }
            return p;
          }),
        };
      })
    );
  };

  // Inline error resolution (answers PRD feature capability)
  const resolveFailure = (operationId: string, failureId: string, correctedValue: string) => {
    setOperations((prev) =>
      prev.map((op) => {
        if (op.id !== operationId) return op;

        const updatedFailures = op.failures.map((f) => {
          if (f.id === failureId) {
            return {
              ...f,
              correctedValue,
              isResolved: true,
              resolvedAt: new Date().toLocaleTimeString(),
              failureReason: `[RESOLVED] Corrected to: "${correctedValue}"`,
            };
          }
          return f;
        });

        const resolvedCount = updatedFailures.filter((f) => f.isResolved).length;
        const newFailedRows = Math.max(0, op.failures.length - resolvedCount);

        addToast({
          type: 'success',
          title: 'Row Corrected & Re-validated',
          message: `Row attribute updated to "${correctedValue}" and committed to directory schema.`,
          operationId: op.id,
        });

        return {
          ...op,
          failedRows: newFailedRows,
          failures: updatedFailures,
          logs: [
            ...op.logs,
            {
              id: 'log-' + Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              level: 'info',
              phase: 'Inline Diagnostics',
              message: `Row diagnostic ID ${failureId} was resolved inline with value: '${correctedValue}'.`,
            },
          ],
        };
      })
    );
  };

  // Create new bulk operation
  const createNewOperation = ({
    actionName,
    actionType,
    totalRows,
    fileName,
    targetOU = 'Corporate Identity Tree',
    simulateFailures = true,
  }: {
    actionName: string;
    actionType: OperationType;
    totalRows: number;
    fileName?: string;
    targetOU?: string;
    simulateFailures?: boolean;
  }): string => {
    const newId = 'op-' + Date.now().toString().slice(-4);
    const initiatedTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const generatedFailures: FailureDiagnostic[] = simulateFailures
      ? [
          {
            id: `fail-${newId}-1`,
            rowNumber: 24,
            identifier: `usr_${Math.floor(Math.random() * 8000)}@tenant.com`,
            attribute: 'Manager Email',
            failureReason: 'Row 24: Direct manager email not found in active directory index',
            originalValue: 'unknown_lead@corp.org',
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: `fail-${newId}-2`,
            rowNumber: 71,
            identifier: `usr_${Math.floor(Math.random() * 8000)}@tenant.com`,
            attribute: 'Job Title',
            failureReason: 'Row 71: Value exceeds permitted schema length (max 32 chars)',
            originalValue: 'Senior Global Enterprise Solution Strategy Principal Engineer Lead',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]
      : [];

    const newOp: BulkOperation = {
      id: newId,
      actionName,
      actionType,
      status: 'active',
      initiatedOn: initiatedTimestamp,
      initiatedBy: 'pm-admin@hexnodeidp.com',
      completedOn: null,
      totalRows,
      processedRows: 0,
      failedRows: generatedFailures.length,
      timeTakenSeconds: 0,
      timeRemainingSeconds: Math.round(totalRows / 30),
      processingRatePerSec: 30,
      fileName: fileName || `${actionName.toLowerCase().replace(/\s+/g, '_')}.csv`,
      fileSize: `${(totalRows * 0.00045).toFixed(1)} MB`,
      targetOU,
      phases: [
        {
          id: 'validation',
          name: 'Schema & Syntax Validation',
          description: 'Verifies CSV formatting, header mapping, mandatory attributes, and data integrity',
          status: 'completed',
          startedAt: new Date().toLocaleTimeString(),
          completedAt: new Date().toLocaleTimeString(),
          durationSeconds: 4,
          logs: [
            `[${new Date().toLocaleTimeString()}] Parsing byte stream for ${actionName}`,
            `[${new Date().toLocaleTimeString()}] Schema integrity verified for ${totalRows.toLocaleString()} rows`,
          ],
        },
        {
          id: 'queuing',
          name: 'Identity Queuing & Worker Sharding',
          description: 'Chunks rows into concurrent micro-batches and allocates execution workers',
          status: 'in_progress',
          startedAt: new Date().toLocaleTimeString(),
          logs: [`[${new Date().toLocaleTimeString()}] Allocating 8 parallel worker pods`],
        },
        {
          id: 'database_write',
          name: 'Directory Database Write & Attribute Binding',
          description: 'Commits user objects, syncs OU hierarchy, provisions credentials, and dispatches directory events',
          status: 'pending',
          logs: [],
        },
        {
          id: 'log_generation',
          name: 'Log Generation & Audit Finalization',
          description: 'Compiles diagnostic telemetry, signs compliance audit proof, and notifies subscribers',
          status: 'pending',
          logs: [],
        },
      ],
      failures: generatedFailures,
      logs: [
        {
          id: 'log-new-1',
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          phase: 'Queue Init',
          message: `Bulk operation ${newId} initialized by pm-admin@hexnodeidp.com`,
        },
      ],
    };

    setOperations((prev) => [newOp, ...prev]);

    addToast({
      type: 'info',
      title: 'Bulk Operation Queued',
      message: `Started "${actionName}" for ${totalRows.toLocaleString()} entities.`,
      operationId: newId,
    });

    return newId;
  };

  return (
    <BulkOperationsContext.Provider
      value={{
        operations,
        selectedOperation,
        selectedOperationId,
        currentNav,
        currentSubNav,
        currentView,
        isTrayOpen,
        isSimulationPaused,
        toasts,
        activeCount,
        totalPendingErrors,
        setCurrentNav,
        setCurrentSubNav,
        setCurrentView,
        navigateTo,
        selectOperation,
        toggleTray,
        openTray,
        closeTray,
        toggleSimulationPause,
        haltOperation,
        resumeOperation,
        retryOperation,
        resolveFailure,
        createNewOperation,
        dismissToast,
        addToast,
      }}
    >
      {children}
    </BulkOperationsContext.Provider>
  );
};

export const useBulkOperations = () => {
  const context = useContext(BulkOperationsContext);
  if (!context) {
    throw new Error('useBulkOperations must be used within a BulkOperationsProvider');
  }
  return context;
};
