export function parseToDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  // try number
  if (typeof value === 'number') return new Date(value);
  // try ISO / string
  const d = new Date(String(value));
  if (!isNaN(d.getTime())) return d;
  return null;
}

export function formatDateTime(value: any): string {
  const d = parseToDate(value);
  if (!d) return '';
  // If time is midnight (00:00:00) and original string didn't include time, still show date only
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0;
  try {
    if (hasTime) {
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return d.toISOString();
  }
}

export function formatDateShort(value: any): string {
  const d = parseToDate(value);
  if (!d) return '';
  try {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch (e) {
    return d.toLocaleDateString();
  }
}
