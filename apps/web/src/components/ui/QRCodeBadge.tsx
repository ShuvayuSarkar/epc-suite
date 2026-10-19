import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';

interface QRCodeBadgeProps {
  docNo: string;
  revision: string;
  status: string;
  project?: string;
  size?: number;
}

export const QRCodeBadge: React.FC<QRCodeBadgeProps> = ({
  docNo,
  revision,
  status,
  project,
  size = 64,
}) => {
  // Generate a mock verification payload URL / code
  const verificationPayload = `https://epc.apar.com/verify?doc=${encodeURIComponent(docNo)}&rev=${encodeURIComponent(revision)}&status=${encodeURIComponent(status)}`;

  return (
    <div className="inline-flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
      {/* Visual QR representation */}
      <div
        className="bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0 shadow-sm"
        style={{ width: size, height: size }}
        title={`Scan to verify: ${verificationPayload}`}
      >
        <QrCode className="w-full h-full text-slate-800" />
      </div>

      <div className="text-[11px] space-y-0.5">
        <div className="flex items-center gap-1 font-bold text-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Wrench Verified</span>
        </div>
        <p className="font-mono text-indigo-600 font-semibold">{docNo}</p>
        <p className="text-slate-500 font-medium">Rev: {revision} · {status}</p>
        {project && <p className="text-slate-400 text-[10px] truncate max-w-[120px]">{project}</p>}
      </div>
    </div>
  );
};
export default QRCodeBadge;
