import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface AnalyticsConfig {
  /** ID de medição do Google Analytics 4 (G-XXXXXXXXXX). */
  measurementId: string;
}

export const ANALYTICS_CONFIG = new InjectionToken<AnalyticsConfig>(
  'ANALYTICS_CONFIG: use provideAnalytics({ measurementId }) em app.config.ts',
);

/** Liga o AnalyticsService (e o <vg-cookie-banner>) ao ID de medição do app. */
export function provideAnalytics(config: AnalyticsConfig): EnvironmentProviders {
  if (!/^G-[A-Z0-9]+$/.test(config.measurementId)) {
    throw new Error(`provideAnalytics: measurementId inválido ("${config.measurementId}").`);
  }

  return makeEnvironmentProviders([{ provide: ANALYTICS_CONFIG, useValue: config }]);
}
