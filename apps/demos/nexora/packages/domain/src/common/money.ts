export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export function money(amount: number, currency: CurrencyCode): Money {
  return { amount: Math.round(amount * 100) / 100, currency };
}
