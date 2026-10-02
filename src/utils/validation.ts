/**
 * Form validation and formatting utilities
 */

/**
 * Validates whether a date string (YYYY-MM-DD) is not in the future.
 */
export function isNotFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const selectedDate = new Date(`${dateStr}T23:59:59`);
  const today = new Date();
  return selectedDate.getTime() <= today.getTime();
}

/**
 * Validates that a numeric value is strictly positive (> 0)
 */
export function isStrictlyPositive(val: number | string | undefined | null): boolean {
  if (val === undefined || val === null || val === '') return false;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return !isNaN(num) && num > 0;
}

/**
 * Validates that a numeric value is non-negative (>= 0)
 */
export function isNonNegative(val: number | string | undefined | null): boolean {
  if (val === undefined || val === null || val === '') return false;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return !isNaN(num) && num >= 0;
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display in Portuguese (e.g. 02/10/2026 or 02 de Out)
 */
export function formatDateBR(dateStr: string, options?: { short?: boolean }): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  if (options?.short) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Formats a number to Brazilian localized decimal string
 */
export function formatNumberBR(val: number, maxDecimals = 1): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}
