import { TestBed } from '@angular/core/testing';
import { provideAnalytics } from '../analytics.config';
import { CONSENT_STORAGE_KEY } from '../analytics.service';
import { CookieBanner } from './cookie-banner';

const GTAG_SELECTOR = 'script[src*="googletagmanager.com/gtag/js"]';

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    document.querySelectorAll(GTAG_SELECTOR).forEach((el) => el.remove());
  });

  async function render(purpose?: string): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [provideAnalytics({ measurementId: 'G-TESTE123' })],
    });
    const fixture = TestBed.createComponent(CookieBanner);
    if (purpose) {
      fixture.componentRef.setInput('purpose', purpose);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function button(el: HTMLElement, label: string): HTMLButtonElement {
    return Array.from(el.querySelectorAll('button')).find(
      (btn) => btn.textContent?.trim() === label,
    ) as HTMLButtonElement;
  }

  it('pergunta antes de carregar o Analytics', async () => {
    const el = await render();

    expect(el.querySelector('.consent')).not.toBeNull();
    expect(document.querySelector(GTAG_SELECTOR)).toBeNull();
  });

  it('descreve o que é medido, com um texto padrão genérico', async () => {
    expect((await render()).textContent).toContain('ver quais páginas são mais acessadas');

    TestBed.resetTestingModule();
    expect((await render('ver quais links são mais acessados')).textContent).toContain(
      'contar visitas e ver quais links são mais acessados.',
    );
  });

  it('carrega o Analytics do ID configurado só depois de aceitar', async () => {
    const el = await render();

    button(el, 'Aceitar').click();

    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(document.querySelector(GTAG_SELECTOR)?.getAttribute('src')).toContain('id=G-TESTE123');
  });

  it('não carrega nada ao recusar, nem na próxima visita', async () => {
    const el = await render();
    button(el, 'Recusar').click();
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied');
    expect(document.querySelector(GTAG_SELECTOR)).toBeNull();

    TestBed.resetTestingModule();
    const again = await render();
    expect(again.querySelector('.consent')).toBeNull();
    expect(document.querySelector(GTAG_SELECTOR)).toBeNull();
  });
});
