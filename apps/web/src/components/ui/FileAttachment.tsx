import React, { useRef } from 'react';
import { Paperclip, FileText, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { Attachment } from '../../types/attachment';

interface FileAttachmentProps {
  attachments: Attachment[];
  onAdd?: (attachment: Attachment) => void;
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  maxFiles?: number;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachments,
  onAdd,
  onRemove,
  readOnly = false,
  maxFiles = 10,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fallbackLocalBase64 = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = (event.target?.result as string) || '';
      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
      };
      onAdd?.(newAttachment);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onAdd) return;

    Array.from(files).forEach((file) => {
      // 1. Try uploading to backend /api/v1/uploads
      const formData = new FormData();
      formData.append('file', file);

      fetch('http://localhost:3000/api/v1/uploads', {
        method: 'POST',
        body: formData,
      })
        .then(res => res.ok ? res.json() : null)
        .then(uploaded => {
          if (uploaded && uploaded.url) {
            onAdd({
              id: uploaded.id,
              name: uploaded.name,
              size: uploaded.size,
              type: uploaded.type,
              dataUrl: uploaded.url,
              uploadedAt: uploaded.uploadedAt,
              uploadedBy: 'Current User',
            });
          } else {
            fallbackLocalBase64(file);
          }
        })
        .catch(() => {
          fallbackLocalBase64(file);
        });
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
          Attachments ({attachments.length}{maxFiles ? `/${maxFiles}` : ''})
        </label>
        {!readOnly && attachments.length < maxFiles && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload file
            </button>
          </div>
        )}
      </div>

      {attachments.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400">
            {readOnly ? 'No files attached' : 'No documents attached yet. Click upload to attach drawing or PDF.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(att.type)}
                <a
                  href={att.dataUrl || '#'}
                  download={att.name}
                  className="font-medium text-slate-700 hover:text-indigo-600 truncate max-w-xs"
                  title={att.name}
                >
                  {att.name}
                </a>
                <span className="text-[10px] text-slate-400 shrink-0">({formatSize(att.size)})</span>
              </div>
              {!readOnly && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(att.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  title="Remove attachment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
