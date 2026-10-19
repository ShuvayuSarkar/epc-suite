export interface PrintDocPayload {
  docNo: string;
  title: string;
  revision: string;
  discipline: string;
  docType: string;
  project: string;
  status: string;
  author: string;
  stage: string;
  date: string;
}

export function printDocumentCoversheet(payload: PrintDocPayload) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Engineering Deliverable Coversheet — ${payload.docNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
          .company { font-size: 24px; font-weight: bold; color: #1e1b4b; }
          .tagline { font-size: 12px; color: #64748b; }
          .qr-box { border: 2px dashed #cbd5e1; padding: 12px; text-align: center; font-size: 11px; border-radius: 8px; width: 140px; }
          .title-section { margin-top: 40px; }
          .doc-num { font-size: 28px; font-weight: bold; color: #4f46e5; font-family: monospace; }
          .doc-title { font-size: 20px; font-weight: 600; margin-top: 8px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 14px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
          th { background: #f8fafc; color: #475569; width: 30%; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 60px; }
          .sig-box { border-top: 1px solid #94a3b8; padding-top: 10px; font-size: 12px; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company">APAR INDUSTRIES LIMITED</div>
            <div class="tagline">EPC DIVISION · TRANSMISSION & DISTRIBUTION PROJECTS</div>
          </div>
          <div class="qr-box">
            <div style="font-size: 32px; line-height: 1;">▚▞</div>
            <div style="font-weight: bold; margin-top: 4px;">SECURE QR</div>
            <div>VERIFIED COPY</div>
          </div>
        </div>

        <div class="title-section">
          <div class="doc-num">${payload.docNo}</div>
          <div class="doc-title">${payload.title}</div>
        </div>

        <table>
          <tr><th>Project</th><td>${payload.project}</td></tr>
          <tr><th>Discipline</th><td>${payload.discipline}</td></tr>
          <tr><th>Document Type</th><td>${payload.docType}</td></tr>
          <tr><th>Current Revision</th><td><strong>Rev ${payload.revision}</strong></td></tr>
          <tr><th>Current Workflow Stage</th><td>${payload.stage}</td></tr>
          <tr><th>Release Status</th><td>${payload.status}</td></tr>
          <tr><th>Lead Engineer / Author</th><td>${payload.author}</td></tr>
          <tr><th>Release Date</th><td>${payload.date}</td></tr>
        </table>

        <div class="signatures">
          <div class="sig-box">Prepared By<br><strong>${payload.author}</strong></div>
          <div class="sig-box">Checked / Reviewed By<br><strong>Lead Engineer</strong></div>
          <div class="sig-box">Approved By (IFC)<br><strong>Project Director</strong></div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
