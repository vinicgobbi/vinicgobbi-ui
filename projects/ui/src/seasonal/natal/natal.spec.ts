import { TestBed } from '@angular/core/testing';
import { Natal, dispensar, foiDispensado, isNatal, restaurar } from './natal';

describe('isNatal', () => {
  it('vale o mês de dezembro inteiro', () => {
    expect(isNatal(new Date(2026, 11, 1, 0, 0))).toBe(true);
    expect(isNatal(new Date(2026, 11, 25))).toBe(true);
    expect(isNatal(new Date(2026, 11, 31, 23, 59))).toBe(true);
    expect(isNatal(new Date(2026, 10, 30, 23, 59))).toBe(false);
    expect(isNatal(new Date(2027, 0, 1, 0, 0))).toBe(false);
  });
});

describe('dispensar', () => {
  beforeEach(() => localStorage.removeItem('natal-dispensado'));
  afterEach(() => localStorage.removeItem('natal-dispensado'));

  it('lembra de quem fechou a decoração só naquele ano', () => {
    expect(foiDispensado(2026)).toBe(false);
    dispensar(2026);
    expect(foiDispensado(2026)).toBe(true);
    expect(foiDispensado(2027)).toBe(false);
  });

  it('volta a mostrar a decoração depois de restaurar', () => {
    dispensar(2026);
    restaurar();
    expect(foiDispensado(2026)).toBe(false);
  });
});

describe('Natal', () => {
  const root = document.documentElement;

  beforeEach(() => localStorage.removeItem('natal-dispensado'));

  afterEach(() => {
    vi.useRealTimers();
    localStorage.removeItem('natal-dispensado');
    root.removeAttribute('data-natal');
  });

  async function renderOn(date: Date) {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(date);
    const fixture = TestBed.createComponent(Natal);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('fica de fora fora de dezembro, sem nem o botão de restaurar', async () => {
    const { element } = await renderOn(new Date(2026, 10, 30, 12));

    expect(element.children).toHaveLength(0);
    expect(root.hasAttribute('data-natal')).toBe(false);
  });

  it('em dezembro, mostra neve, saudação e troca o acento', async () => {
    const { element } = await renderOn(new Date(2026, 11, 10, 12));

    expect(element.querySelector('.greeting')?.textContent).toContain('Feliz Natal!');
    expect(element.querySelectorAll('.flake').length).toBeGreaterThan(0);
    expect(root.hasAttribute('data-natal')).toBe(true);
  });

  it('ao fechar, guarda a escolha e leva o foco ao botão de restaurar', async () => {
    const { fixture, element } = await renderOn(new Date(2026, 11, 10, 12));

    element.querySelector<HTMLButtonElement>('.greeting__close')?.click();
    await fixture.whenStable();

    const restore = element.querySelector<HTMLButtonElement>('.restore');
    expect(element.querySelector('.decor')).toBeNull();
    expect(root.hasAttribute('data-natal')).toBe(false);
    expect(foiDispensado(2026)).toBe(true);
    expect(document.activeElement).toBe(restore);
  });

  it('continua fechada nas próximas visitas do mesmo dezembro', async () => {
    dispensar(2026);
    const { element } = await renderOn(new Date(2026, 11, 20, 12));

    expect(element.querySelector('.decor')).toBeNull();
    expect(element.querySelector('.restore')).not.toBeNull();
  });

  it('volta ao restaurar, com o foco no botão de fechar', async () => {
    dispensar(2026);
    const { fixture, element } = await renderOn(new Date(2026, 11, 20, 12));

    element.querySelector<HTMLButtonElement>('.restore')?.click();
    await fixture.whenStable();

    expect(element.querySelector('.decor')).not.toBeNull();
    expect(root.hasAttribute('data-natal')).toBe(true);
    expect(foiDispensado(2026)).toBe(false);
    expect(document.activeElement).toBe(element.querySelector('.greeting__close'));
  });
});
