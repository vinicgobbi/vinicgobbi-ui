import { InjectionToken, Provider } from '@angular/core';

/**
 * De onde as decorações tiram a data de hoje. Por padrão, o relógio do navegador; o app (ou uma
 * vitrine, ou um teste) pode trocar com provideSeasonalDate para ver uma ocasião fora da data.
 */
export const SEASONAL_DATE = new InjectionToken<() => Date>('SEASONAL_DATE', {
  providedIn: 'root',
  factory: () => () => new Date(),
});

/** Ex.: provideSeasonalDate(() => new Date(2026, 11, 31)) mostra o Ano Novo. */
export function provideSeasonalDate(today: () => Date): Provider {
  return { provide: SEASONAL_DATE, useValue: today };
}
