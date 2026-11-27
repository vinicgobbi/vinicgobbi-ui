import { TestBed } from '@angular/core/testing';
import natalCss from './natal.css' with { loader: 'text' };
import { Natal, isNatal } from './natal';

describe('isNatal', () => {
  it('vale o mês de dezembro inteiro', () => {
    expect(isNatal(new Date(2026, 11, 1, 0, 0))).toBe(true);
    expect(isNatal(new Date(2026, 11, 25))).toBe(true);
    expect(isNatal(new Date(2026, 11, 31, 23, 59))).toBe(true);
    expect(isNatal(new Date(2026, 10, 30, 23, 59))).toBe(false);
    expect(isNatal(new Date(2027, 0, 1, 0, 0))).toBe(false);
  });
});

describe('Natal', () => {
  const root = document.documentElement;

  afterEach(() => {
    vi.useRealTimers();
    root.removeAttribute('data-natal');
  });

  async function renderOn(date: Date) {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(date);
    const fixture = TestBed.createComponent(Natal);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('fica de fora fora de dezembro', async () => {
    const { element } = await renderOn(new Date(2026, 10, 30, 12));

    expect(element.children).toHaveLength(0);
    expect(root.hasAttribute('data-natal')).toBe(false);
  });

  it('em dezembro, mostra neve, saudação e troca o acento', async () => {
    const { element } = await renderOn(new Date(2026, 11, 10, 12));

    expect(element.querySelector('.greeting')?.textContent).toContain('Feliz Natal!');
    expect(element.querySelectorAll('.flake').length).toBeGreaterThan(0);
    expect(element.querySelector('.decor')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.hasAttribute('data-natal')).toBe(true);
  });

  it('fica ativa o período inteiro: a saudação só tem o presente, sem fechar', async () => {
    const { element } = await renderOn(new Date(2026, 11, 10, 12));
    const buttons = [...element.querySelectorAll('button')].map((button) =>
      button.getAttribute('aria-label'),
    );

    expect(buttons).toEqual(['Abrir presente']);
  });

  it('ignora a escolha de fechar salva pelas versões anteriores', async () => {
    localStorage.setItem('natal-dispensado', '2026');

    const { element } = await renderOn(new Date(2026, 11, 10, 12));

    expect(element.querySelector('.decor')).not.toBeNull();
    localStorage.removeItem('natal-dispensado');
  });

  it('solta a revoada ao abrir o presente, que some depois', async () => {
    const { fixture, element } = await renderOn(new Date(2026, 11, 10, 12));
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });

    element.querySelector<HTMLButtonElement>('.greeting__gift')?.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('.burst').length).toBeGreaterThan(0);

    vi.advanceTimersByTime(3000);
    await fixture.whenStable();
    expect(element.querySelectorAll('.burst')).toHaveLength(0);
  });

  it('devolve o acento normal ao sair da tela', async () => {
    const { fixture } = await renderOn(new Date(2026, 11, 10, 12));

    fixture.destroy();

    expect(root.hasAttribute('data-natal')).toBe(false);
  });
});

describe('natal.css', () => {
  it('posiciona saudação, revoada e enfeites a partir de --seasonal-start', () => {
    expect(natalCss).toContain('--start: var(--seasonal-start, 0px)');
    expect(natalCss).toContain('left: calc(var(--seasonal-start, 0px) + 1rem)');
    expect(natalCss).toContain('left: calc(var(--start) + 1.25rem)');
    expect(natalCss).toContain('--inset-start: calc(var(--start) +');
  });

  it('permite ao app esconder os enfeites pendurados', () => {
    expect(natalCss).toContain('display: var(--seasonal-hanging-display, block)');
  });
});
