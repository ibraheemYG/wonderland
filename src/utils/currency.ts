export const USD_TO_IQD_RATE = 1300; // Approximate conversion rate. Adjust as needed.

export function formatIQDFromUSD(amountUsd: number): string {
  const iqd = amountUsd * USD_TO_IQD_RATE;
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    maximumFractionDigits: 0,
  }).format(iqd);
}

export function convertUsdToIqd(amountUsd: number): number {
  return Math.round(amountUsd * USD_TO_IQD_RATE);
}
