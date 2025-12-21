// تنسيق السعر بالدينار العراقي
export function formatIQD(amount: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    maximumFractionDigits: 0,
  }).format(amount) + ' د.ع';
}

// للتوافق مع الكود القديم
export const formatIQDFromUSD = formatIQD;
export const convertUsdToIqd = (amount: number) => amount;
