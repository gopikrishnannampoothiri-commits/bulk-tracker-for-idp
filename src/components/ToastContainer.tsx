import React from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, selectOperation } = useBulkOperations();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl border shadow-xl bg-white text-xs animate-in slide-in-from-bottom-2 fade-in duration-150 ${
              toast.type === 'success'
                ? 'border-emerald-200 text-slate-900'
                : toast.type === 'warning'
                ? 'border-amber-200 text-slate-900'
                : toast.type === 'error'
                ? 'border-rose-200 text-slate-900'
                : 'border-indigo-200 text-slate-900'
            }`}
          >
            {/* Icon */}
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-600" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">{toast.title}</div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
              {toast.operationId && (
                <button
                  onClick={() => {
                    selectOperation(toast.operationId!);
                    dismissToast(toast.id);
                  }}
                  className="mt-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
