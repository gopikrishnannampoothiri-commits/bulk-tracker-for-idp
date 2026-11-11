import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { useBulkOperations } from '../context/BulkOperationsContext';
import { OperationType } from '../types';

interface NewOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOperationModal: React.FC<NewOperationModalProps> = ({ isOpen, onClose }) => {
  const { createNewOperation, selectOperation } = useBulkOperations();

  const [operationType, setOperationType] = useState<OperationType>('csv_import');
  const [actionName, setActionName] = useState('Bulk CSV User Ingestion - Q3 Expansion.csv');
  const [totalRows, setTotalRows] = useState(5000);
  const [targetOU, setTargetOU] = useState('Engineering / Platform Services');
  const [simulateFailures, setSimulateFailures] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('Staff_Directory_Batch_2026.csv');

  if (!isOpen) return null;

  const presets = [
    {
      type: 'csv_import' as const,
      name: 'Bulk CSV User Import (5,000 Accounts)',
      defaultName: 'CSV User Import - All_Staff_Batch_09.csv',
      defaultRows: 5000,
      icon: FileSpreadsheet,
      desc: 'Import users, passwords, attributes and OU mappings from CSV',
    },
    {
      type: 'directory_sync' as const,
      name: 'Azure Active Directory SCIM Sync',
      defaultName: 'Azure AD SCIM Full Delta Ingestion',
      defaultRows: 3500,
      icon: RefreshCw,
      desc: 'Synchronize cloud identity objects from Microsoft 365 / Entra ID',
    },
    {
      type: 'permission_assignment' as const,
      name: 'Mass RBAC Role Migration',
      defaultName: 'Enterprise Security Role Matrix v3.1',
      defaultRows: 8000,
      icon: ShieldCheck,
      desc: 'Bulk update user access tiers, role assignments, and groups',
    },
    {
      type: 'deprovision' as const,
      name: 'Bulk Deprovision Contractor Accounts',
      defaultName: 'Contractor Expiration Clean-up FY26',
      defaultRows: 2400,
      icon: Users,
      desc: 'Safely terminate active sessions and revoke cloud app assignments',
    },
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setOperationType(preset.type);
    setActionName(preset.defaultName);
    setTotalRows(preset.defaultRows);
    setFileName(preset.defaultName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = createNewOperation({
      actionName,
      actionType: operationType,
      totalRows,
      fileName,
      targetOU,
      simulateFailures,
    });
    onClose();
    selectOperation(newId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Launch New Bulk Operation</h2>
              <p className="text-xs text-slate-500">Queue asynchronous mass identity workflow</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 block">Choose Workflow Template</label>
            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = operationType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 text-slate-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold mb-1">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{preset.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operation Name & File Upload Simulation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Operation / File Name</label>
            <input
              type="text"
              required
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Target OU & Entity Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Target Organizational Unit</label>
              <select
                value={targetOU}
                onChange={(e) => setTargetOU(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option>Engineering / Platform Services</option>
                <option>Sales / Regional Operations</option>
                <option>Marketing / Brand Strategy</option>
                <option>Finance & Accounting</option>
                <option>Contractors / External Vendors</option>
                <option>Global Tenant (All OUs)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Total Row Count</label>
              <input
                type="number"
                min={100}
                max={50000}
                step={500}
                value={totalRows}
                onChange={(e) => setTotalRows(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-medium"
              />
            </div>
          </div>

          {/* Diagnostics Simulation Option */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 block">Include Sample Failed Rows</span>
              <p className="text-[11px] text-slate-500">
                Generates sample schema & attribute conflicts to test the Failure Diagnostics table and Error CSV export
              </p>
            </div>
            <input
              type="checkbox"
              checked={simulateFailures}
              onChange={(e) => setSimulateFailures(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Queue Operation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
