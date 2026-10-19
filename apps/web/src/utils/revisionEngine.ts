export function getNextInternalRevision(current: string): string {
  if (!current || current.trim() === '') return 'A';
  const clean = current.trim().toUpperCase();
  if (/^[A-Z]$/.test(clean)) {
    if (clean === 'Z') return 'AA';
    return String.fromCharCode(clean.charCodeAt(0) + 1);
  }
  if (/^[A-Z]{2}$/.test(clean)) {
    const second = clean.charCodeAt(1);
    if (second === 90) { // 'Z'
      return String.fromCharCode(clean.charCodeAt(0) + 1) + 'A';
    }
    return clean[0] + String.fromCharCode(second + 1);
  }
  return 'B';
}

export function getNextClientRevision(current: string): string {
  const num = parseInt(current.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '1';
  return String(num + 1);
}

export function formatRevisionForRelease(
  current: string,
  releaseType: 'internal' | 'client' | 'ifc'
): string {
  if (releaseType === 'ifc') return '0 (IFC)';
  if (releaseType === 'client') {
    if (/^[A-Z]+$/.test(current)) return '1';
    return getNextClientRevision(current);
  }
  return getNextInternalRevision(current);
}
