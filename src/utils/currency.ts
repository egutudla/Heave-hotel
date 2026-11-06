/**
 * Currency utility helpers for HavenStay Hotels (Nigerian Naira - ₦)
 */

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';

/**
 * Format number into Nigerian Naira format: ₦165,000
 */
export function formatNaira(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₦0';
  }
  const num = Math.round(Number(amount));
  return `₦${num.toLocaleString('en-US')}`;
}

export const formatCurrency = formatNaira;
