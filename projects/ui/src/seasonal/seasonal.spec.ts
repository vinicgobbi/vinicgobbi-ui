import { TestBed } from '@angular/core/testing';
import { Seasonal } from './seasonal';
import { provideSeasonalDate } from './seasonal-date';

const ATTRIBUTES = [
  'data-ano-novo',
  'data-carnaval',
  'data-pascoa',
  'data-aniversario',
  'data-halloween',
  'data-natal',
];

describe('Seasonal', () => {
  const root = document.documentElement;

  afterEach(() => ATTRIBUTES.forEach((attribute) => root.removeAttribute(attribute)));

  async function renderOn(date: Date, placement?: 'margins' | 'edges') {
    TestBed.configureTestingModule({ providers: [provideSeasonalDate(() => date)] });
    const fixture = TestBed.createComponent(Seasonal);
    if (placement) {
      fixture.componentRef.setInput('placement', placement);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it.each([
    [new Date(2026, 11, 31), 'Feliz Ano Novo!', 'data-ano-novo'],
    [new Date(2026, 1, 16), 'Bom Carnaval!', 'data-carnaval'],
    [new Date(2026, 3, 3), 'Feliz Páscoa!', 'data-pascoa'],
    [new Date(2026, 9, 1), 'Hoje é meu aniversário!', 'data-aniversario'],
    [new Date(2026, 9, 31), 'Feliz Halloween!', 'data-halloween'],
    [new Date(2026, 11, 10), 'Feliz Natal!', 'data-natal'],
  ])('em %s mostra só a ocasião do dia', async (date, greeting, attribute) => {
    const element = await renderOn(date);
    const greetings = [...element.querySelectorAll('.greeting')].map((item) => item.textContent);

    expect(greetings).toHaveLength(1);
    expect(greetings[0]).toContain(greeting);
    expect(ATTRIBUTES.filter((name) => root.hasAttribute(name))).toEqual([attribute]);
  });

  it('num dia comum não mostra nada', async () => {
    const element = await renderOn(new Date(2026, 5, 15));

    expect(element.querySelector('.greeting')).toBeNull();
    expect(ATTRIBUTES.some((name) => root.hasAttribute(name))).toBe(false);
  });

  it('repassa o placement para Natal e Halloween', async () => {
    const element = await renderOn(new Date(2026, 11, 10), 'edges');

    expect(element.querySelector('vg-natal')?.getAttribute('data-placement')).toBe('edges');
    expect(element.querySelector('vg-halloween')?.getAttribute('data-placement')).toBe('edges');
  });
});
