import React, { useState } from 'react';
import { X, CheckCircle2, Edit3 } from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';
import { FailureDiagnostic } from '../types';

interface InlineFixModalProps {
  isOpen: boolean;
  operationId: string | null;
  failure: FailureDiagnostic | null;
  onClose: () => void;
}

export const InlineFixModal: React.FC<InlineFixModalProps> = ({
  isOpen,
  operationId,
  failure,
  onClose,
}) => {
  const { resolveFailure } = useBulkOperations();
  const [correctedValue, setCorrectedValue] = useState('');

  if (!isOpen || !operationId || !failure) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedValue.trim()) return;
    resolveFailure(operationId, failure.id, correctedValue.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[12px] max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#EFF6FF] flex items-center justify-center text-[#0F62FE]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[17px] font-medium text-[#111827]">Inline Error Correction</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-[6px] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Row Information Card */}
          <div className="p-3.5 bg-[#FEE2E2]/50 border border-[#FEE2E2] rounded-[8px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-[#B91C1C]">Row #{failure.rowNumber}</span>
              <span className="font-medium px-2 py-0.5 rounded-[9999px] bg-white text-[#B91C1C] border border-[#FEE2E2] text-[10px] uppercase tracking-wider">
                {failure.attribute}
              </span>
            </div>
            <div className="text-[12px] text-[#B91C1C] font-medium">{failure.failureReason}</div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-1">
              Entity: <strong className="text-[#374151]">{failure.identifier}</strong>
            </div>
          </div>

          {/* Current Original Value */}
          <div className="space-y-1">
            <label className="font-medium text-[#6B7280] block text-[12px]">Current Value in File</label>
            <div className="p-2.5 bg-[#F9FAFB] rounded-[6px] font-mono text-[#374151] border border-[#E5E7EB]">
              "{failure.originalValue}"
            </div>
          </div>

          {/* Corrected Value Input */}
          <div className="space-y-1.5">
            <label className="font-medium text-[#111827] block text-[12px]">
              Corrected Value
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={`Enter valid value for ${failure.attribute}`}
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-[6px] text-xs text-[#111827] focus:outline-none focus:border-[#0F62FE] font-mono"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-[6px] transition-colors border border-[#D1D5DB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!correctedValue.trim()}
              className="px-4 py-2 text-xs font-medium text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-[6px] transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validate & Commit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

