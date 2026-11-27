import { TestBed } from '@angular/core/testing';
import halloweenCss from './halloween.css' with { loader: 'text' };
import { isHalloween } from '../calendar';
import { Halloween } from './halloween';

describe('isHalloween', () => {
  it('vale só no dia 31 de outubro', () => {
    expect(isHalloween(new Date(2026, 9, 31, 0, 0))).toBe(true);
    expect(isHalloween(new Date(2026, 9, 31, 23, 59))).toBe(true);
    expect(isHalloween(new Date(2026, 9, 30))).toBe(false);
    expect(isHalloween(new Date(2026, 10, 1))).toBe(false);
  });
});

describe('Halloween', () => {
  const root = document.documentElement;

  afterEach(() => {
    vi.useRealTimers();
    root.removeAttribute('data-halloween');
  });

  async function renderOn(date: Date, placement?: 'margins' | 'edges') {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(date);
    const fixture = TestBed.createComponent(Halloween);
    if (placement) {
      fixture.componentRef.setInput('placement', placement);
    }
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('fica de fora em outros dias', async () => {
    const { element } = await renderOn(new Date(2026, 9, 30, 12));

    expect(element.querySelector('.greeting')).toBeNull();
    expect(root.hasAttribute('data-halloween')).toBe(false);
  });

  it('no dia 31, mostra a decoração e troca o acento', async () => {
    const { element } = await renderOn(new Date(2026, 9, 31, 12));

    expect(element.querySelector('.greeting')?.textContent).toContain('Feliz Halloween!');
    expect(element.querySelector('.spooky')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.hasAttribute('data-halloween')).toBe(true);
  });

  it('fica ativa o dia inteiro: a saudação só tem a abóbora, sem fechar', async () => {
    const { element } = await renderOn(new Date(2026, 9, 31, 12));
    const buttons = [...element.querySelectorAll('button')].map((button) =>
      button.getAttribute('aria-label'),
    );

    expect(buttons).toEqual(['Soltar morcegos']);
  });

  it('devolve o acento normal ao sair da tela', async () => {
    const { fixture } = await renderOn(new Date(2026, 9, 31, 12));

    fixture.destroy();

    expect(root.hasAttribute('data-halloween')).toBe(false);
  });

  it('solta morcegos ao clicar na abóbora, que somem depois da revoada', async () => {
    const { fixture, element } = await renderOn(new Date(2026, 9, 31, 12));
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });

    element.querySelector<HTMLButtonElement>('.greeting__pumpkin')?.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('.bat--swarm').length).toBeGreaterThan(0);

    vi.advanceTimersByTime(3000);
    await fixture.whenStable();
    expect(element.querySelectorAll('.bat--swarm')).toHaveLength(0);
  });

  it('reflete o placement no host, para o CSS posicionar a aranha', async () => {
    const padrao = await renderOn(new Date(2026, 9, 31, 12));
    expect(padrao.element.getAttribute('data-placement')).toBe('margins');

    const edges = await renderOn(new Date(2026, 9, 31, 12), 'edges');
    expect(edges.element.getAttribute('data-placement')).toBe('edges');
  });
});

describe('halloween.css', () => {
  it('posiciona saudação, revoada e aranha a partir de --seasonal-start', () => {
    expect(halloweenCss).toContain('--start: var(--seasonal-start, 0px)');
    expect(halloweenCss).toContain('left: calc(var(--seasonal-start, 0px) + 1rem)');
    expect(halloweenCss).toContain('left: calc(var(--start) + 1.25rem)');
    expect(halloweenCss).toContain('left: calc(var(--start) + (100% - var(--start)');
  });

  it('permite ao app esconder a aranha', () => {
    expect(halloweenCss).toContain('display: var(--seasonal-hanging-display, block)');
  });
});
