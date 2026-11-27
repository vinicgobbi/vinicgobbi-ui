import { TestBed } from '@angular/core/testing';
import { ANALYTICS_CONFIG, provideAnalytics } from './analytics.config';
import { AnalyticsService } from './analytics.service';

describe('provideAnalytics', () => {
  it('registra o ID de medição', () => {
    TestBed.configureTestingModule({
      providers: [provideAnalytics({ measurementId: 'G-ABC123' })],
    });

    expect(TestBed.inject(ANALYTICS_CONFIG).measurementId).toBe('G-ABC123');
  });

  it('recusa um ID que não é do GA4', () => {
    expect(() => provideAnalytics({ measurementId: 'UA-123-1' })).toThrow(/measurementId inválido/);
  });

  it('sem provideAnalytics, o erro diz o que falta', () => {
    expect(() => TestBed.inject(AnalyticsService)).toThrow(/provideAnalytics/);
  });
});
