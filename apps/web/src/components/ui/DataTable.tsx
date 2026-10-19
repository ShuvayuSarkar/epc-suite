import React from 'react';
import clsx from 'clsx';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';

export interface Column<T> {
  key?: string;
  accessor?: string;
  header: string;
  render?: (row: any, ...args: any[]) => React.ReactNode;
  cell?: (value: any, row?: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  /** Pass to show Edit (✏) button per row — only when user has canUpdate permission */
  onEdit?: (row: T) => void;
  /** Pass to show Delete (🗑) button per row — only when user has canRemove permission */
  onDelete?: (row: T) => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, onRowClick, rowClassName, loading,
  emptyMessage = 'No data available', pagination,
  onEdit, onDelete, editLabel = 'Edit record', deleteLabel = 'Delete record',
}: DataTableProps<T>) {
  const normalizedColumns = columns.map(col => ({
    ...col,
    _key: col.key ?? col.accessor ?? '',
    _isActions: false,
  }));

  const hasActions = !!onEdit || !!onDelete;
  type NormCol = typeof normalizedColumns[0];
  const effectiveColumns: NormCol[] = hasActions
    ? [...normalizedColumns, { _key: '__actions__', header: 'Actions', _isActions: true } as NormCol]
    : normalizedColumns;

  const getCellContent = (col: NormCol, row: T): React.ReactNode => {
    if (col._isActions) {
      return (
        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={() => onEdit(row)}
              title={editLabel}
              className="p-1.5 rounded-md hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(row)}
              title={deleteLabel}
              className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      );
    }
    if (col.render) return col.render(row);
    if (col.cell) return col.cell(row[col._key], row);
    return row[col._key];
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-xs tracking-wider">
            <tr>
              {effectiveColumns.map((col, i) => (
                <th key={col._key || i} className="px-6 py-4 whitespace-nowrap" style={{ width: col.width }}>
                  <div className="flex items-center">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="ml-1 w-3 h-3 text-slate-400 cursor-pointer" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {effectiveColumns.map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={effectiveColumns.length} className="px-6 py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={clsx(
                    'hover:bg-slate-50 transition-colors',
                    rowIndex % 2 === 1 && 'bg-slate-25',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row),
                  )}
                >
                  {effectiveColumns.map((col, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      {getCellContent(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
          </span>
          <div className="flex space-x-1">
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Prev
            </button>
            <button
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="px-3 py-1 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
