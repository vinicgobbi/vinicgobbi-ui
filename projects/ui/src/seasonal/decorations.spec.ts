import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnoNovo } from './ano-novo/ano-novo';
import { Aniversario } from './aniversario/aniversario';
import { Carnaval } from './carnaval/carnaval';
import { Pascoa } from './pascoa/pascoa';
import { provideSeasonalDate } from './seasonal-date';

interface Case {
  name: string;
  component: Type<unknown>;
  date: Date;
  otherDate: Date;
  attribute: string;
  greeting: string;
  action: string;
  scene: string;
}

const CASES: Case[] = [
  {
    name: 'Ano Novo',
    component: AnoNovo,
    date: new Date(2026, 11, 31, 22),
    otherDate: new Date(2026, 11, 20),
    attribute: 'data-ano-novo',
    greeting: 'Feliz Ano Novo!',
    action: 'Soltar fogos',
    scene: '.firework .spark',
  },
  {
    name: 'Carnaval',
    component: Carnaval,
    date: new Date(2026, 1, 15, 12),
    otherDate: new Date(2026, 1, 18),
    attribute: 'data-carnaval',
    greeting: 'Bom Carnaval!',
    action: 'Soltar confete',
    scene: '.confetto',
  },
  {
    name: 'Páscoa',
    component: Pascoa,
    date: new Date(2026, 3, 5, 12),
    otherDate: new Date(2026, 3, 6),
    attribute: 'data-pascoa',
    greeting: 'Feliz Páscoa!',
    action: 'Soltar ovinhos',
    scene: '.egg',
  },
  {
    name: 'aniversário',
    component: Aniversario,
    date: new Date(2026, 9, 1, 12),
    otherDate: new Date(2026, 9, 2),
    attribute: 'data-aniversario',
    greeting: 'Hoje é meu aniversário!',
    action: 'Soltar balões',
    scene: '.balloon',
  },
];

describe.each(CASES)('decoração de $name', (test) => {
  const root = document.documentElement;

  afterEach(() => {
    vi.useRealTimers();
    root.removeAttribute(test.attribute);
  });

  async function renderOn(date: Date) {
    TestBed.configureTestingModule({ providers: [provideSeasonalDate(() => date)] });
    const fixture = TestBed.createComponent(test.component);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('fica de fora em outros dias', async () => {
    const { element } = await renderOn(test.otherDate);

    expect(element.children).toHaveLength(0);
    expect(root.hasAttribute(test.attribute)).toBe(false);
  });

  it('na data, mostra a cena, a saudação e marca o <html>', async () => {
    const { element } = await renderOn(test.date);

    expect(element.querySelectorAll(test.scene).length).toBeGreaterThan(0);
    expect(element.querySelector('.decor')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.greeting')?.getAttribute('role')).toBe('status');
    expect(element.querySelector('.greeting')?.textContent).toContain(test.greeting);
    expect(root.hasAttribute(test.attribute)).toBe(true);
  });

  it('fica ativa o período inteiro: a saudação só tem o botão da revoada', async () => {
    const { element } = await renderOn(test.date);
    const labels = [...element.querySelectorAll('button')].map((button) =>
      button.getAttribute('aria-label'),
    );

    expect(labels).toEqual([test.action]);
  });

  it('solta a revoada pelo botão, que some depois', async () => {
    const { fixture, element } = await renderOn(test.date);
    vi.useFakeTimers({ toFake: ['setTimeout'] });

    element.querySelector<HTMLButtonElement>('.greeting__action')?.click();
    await fixture.whenStable();
    expect(element.querySelectorAll('.burst').length).toBeGreaterThan(0);

    vi.advanceTimersByTime(3000);
    await fixture.whenStable();
    expect(element.querySelectorAll('.burst')).toHaveLength(0);
  });

  it('desmarca o <html> ao sair da tela', async () => {
    const { fixture } = await renderOn(test.date);

    fixture.destroy();

    expect(root.hasAttribute(test.attribute)).toBe(false);
  });
});
