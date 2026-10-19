// ConfirmDeleteDialog.tsx — Reusable delete confirmation dialog
// Used by all module list pages when user has canRemove (Full access only)

import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  recordName: string;
  recordType?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({ open, recordName, recordType = 'record', onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-50 rounded-lg shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 text-base">Delete {recordType}?</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-700">"{recordName}"</span>?
              This action cannot be undone.
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
