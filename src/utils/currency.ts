export const USD_TO_IQD_RATE = 1300; // Approximate conversion rate. Adjust as needed.

export function formatIQDFromUSD(amountUsd: number): string {
  // Check if the amount is already in IQD (likely > 10,000)
  const isAlreadyIQD = amountUsd > 10000;
  const iqd = isAlreadyIQD ? amountUsd : amountUsd * USD_TO_IQD_RATE;
  
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    maximumFractionDigits: 0,
  }).format(iqd);
}

export function convertUsdToIqd(amountUsd: number): number {
  // Check if the amount is already in IQD (likely > 10,000)
  const isAlreadyIQD = amountUsd > 10000;
  return isAlreadyIQD ? Math.round(amountUsd) : Math.round(amountUsd * USD_TO_IQD_RATE);
}
