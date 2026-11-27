import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, Injectable, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

/** Chave da escolha no localStorage; a mesma lida pelo script anti-flash. */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Tema claro/escuro em <html data-theme>.
 *
 * O tema inicial é aplicado pelo script anti-flash (THEME_INIT_SCRIPT) antes do Angular
 * carregar. Aqui só sincronizamos o estado e tratamos a troca. A leitura do atributo espera a
 * primeira renderização: no SSR o servidor não conhece a escolha, e ler antes da hidratação
 * faria o cliente renderizar diferente do HTML recebido.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>('dark');

  constructor() {
    afterNextRender(() => {
      const current = this.document.documentElement.getAttribute('data-theme');
      this.theme.set(current === 'light' ? 'light' : 'dark');
    });
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);

    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Armazenamento indisponível (ex.: modo privado): o tema vale só para esta visita.
    }
  }
}
