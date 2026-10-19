export const DISCIPLINE_CODES: Record<string, string> = {
  'Electrical': 'ELE',
  'Civil': 'CIV',
  'Structural': 'STR',
  'Mechanical': 'MEC',
  'Transmission Line': 'TL',
  'Substation': 'SS',
  'Quality': 'QC',
  'Safety': 'HSE',
};

export const DOC_TYPE_CODES: Record<string, string> = {
  'Drawing': 'DWG',
  'Single Line Diagram': 'SLD',
  'Specification': 'SPC',
  'Design Calculation': 'CAL',
  'Datasheet': 'DAT',
  'Method Statement': 'MS',
  'Inspection Test Plan (ITP)': 'ITP',
  'Test Report': 'RPT',
  'As-Built': 'ASB',
};

export function generateDocNumber(
  projectCode: string,
  discipline: string,
  docType: string,
  sequence: number
): string {
  const proj = projectCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'APAR';
  const disc = DISCIPLINE_CODES[discipline] || discipline.slice(0, 3).toUpperCase() || 'GEN';
  const dtype = DOC_TYPE_CODES[docType] || docType.slice(0, 3).toUpperCase() || 'DOC';
  const seqStr = String(sequence).padStart(3, '0');
  return `${proj}-${disc}-${dtype}-${seqStr}`;
}
