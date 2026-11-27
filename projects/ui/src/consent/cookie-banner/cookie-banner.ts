import { ChangeDetectionStrategy, Component, afterNextRender, inject, input } from '@angular/core';
import { AnalyticsService } from '../analytics.service';

/**
 * Aviso de cookies do Google Analytics. Aparece até a pessoa aceitar ou recusar; depois, só
 * volta por AnalyticsService.openPreferences() (ex.: um link "Cookies" no rodapé).
 * Requer provideAnalytics({ measurementId }).
 */
@Component({
  selector: 'vg-cookie-banner',
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieBanner {
  protected readonly analytics = inject(AnalyticsService);

  /** O que a medição permite ver, completando "para contar visitas e ...". */
  readonly purpose = input('ver quais páginas são mais acessadas');

  constructor() {
    // Só no navegador: no SSR/prerender não há escolha salva e o banner não vai para o HTML.
    afterNextRender(() => this.analytics.init());
  }
}
