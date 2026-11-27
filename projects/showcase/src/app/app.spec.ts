import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UI_VERSION } from '@vinicgobbi/ui';
import { stubWideScreen } from '../testing/wide-screen';
import { hasThemeInitScript } from '@vinicgobbi/ui/theme';
import indexHtml from '../index.html' with { loader: 'text' };
import { seasonalOccasion } from '@vinicgobbi/ui/seasonal';
import { App, COLOR_TOKENS, FESTA_DATES, SECTIONS } from './app';

describe('App', () => {
  let root: HTMLElement;
  let restoreScreen: () => void;

  beforeEach(async () => {
    restoreScreen = stubWideScreen();
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    root = TestBed.inject(DOCUMENT).documentElement;
    root.setAttribute('data-theme', 'dark');
  });

  afterEach(() => {
    restoreScreen();
    localStorage.clear();
    root.removeAttribute('data-sidebar-showcase');
    root.removeAttribute('data-theme');
    for (const attribute of [
      'data-ano-novo',
      'data-carnaval',
      'data-pascoa',
      'data-aniversario',
      'data-halloween',
      'data-natal',
    ]) {
      root.removeAttribute(attribute);
    }
  });

  async function render(): Promise<{ fixture: ComponentFixture<App>; element: HTMLElement }> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function button(element: HTMLElement, group: string, label: string): HTMLButtonElement {
    const buttons = element.querySelectorAll<HTMLButtonElement>(`[aria-label="${group}"] button`);
    const found = [...buttons].find((item) => item.textContent?.trim() === label);
    if (!found) {
      throw new Error(`Botão "${label}" não encontrado em "${group}"`);
    }
    return found;
  }

  it('mostra o nome e a versão da biblioteca', async () => {
    const { element } = await render();

    expect(element.querySelector('h1')?.textContent).toContain('@vinicgobbi/ui');
    expect(element.textContent).toContain(`Versão ${UI_VERSION}`);
  });

  it('mostra uma amostra para cada token de cor', async () => {
    const { element } = await render();

    expect(element.querySelectorAll('.swatch')).toHaveLength(COLOR_TOKENS.length);
  });

  it('troca o tema no <html> e marca o botão ativo', async () => {
    const { fixture, element } = await render();
    const claro = button(element, 'Tema', 'Claro');

    claro.click();
    await fixture.whenStable();

    expect(root.getAttribute('data-theme')).toBe('light');
    expect(claro.getAttribute('aria-pressed')).toBe('true');
  });

  it('mostra a decoração da data comemorativa escolhida, uma por vez', async () => {
    const { fixture, element } = await render();
    const greeting = () => element.querySelector('vg-seasonal .greeting')?.textContent ?? '';

    expect(greeting()).toBe('');

    button(element, 'Data comemorativa', 'Carnaval').click();
    await fixture.whenStable();
    expect(greeting()).toContain('Bom Carnaval!');
    expect(element.querySelectorAll('vg-seasonal .confetto').length).toBeGreaterThan(0);
    expect(root.hasAttribute('data-carnaval')).toBe(true);

    button(element, 'Data comemorativa', 'Aniversário').click();
    await fixture.whenStable();
    expect(greeting()).toContain('Hoje é meu aniversário!');
    expect(root.hasAttribute('data-carnaval')).toBe(false);
    expect(root.hasAttribute('data-aniversario')).toBe(true);

    button(element, 'Data comemorativa', 'Nenhuma').click();
    await fixture.whenStable();
    expect(greeting()).toBe('');
    expect(root.hasAttribute('data-aniversario')).toBe(false);
  });

  it('o dia de cada ocasião cai mesmo na ocasião', () => {
    expect(seasonalOccasion(FESTA_DATES.nenhuma)).toBeNull();
    for (const festa of Object.keys(FESTA_DATES).filter((key) => key !== 'nenhuma')) {
      expect(seasonalOccasion(FESTA_DATES[festa as keyof typeof FESTA_DATES])).toBe(festa);
    }
  });

  it('tem um item no menu lateral para cada seção', async () => {
    const { element } = await render();
    const links = [
      ...element.querySelectorAll<HTMLAnchorElement>('vg-sidebar .sidebar-link[href]'),
    ];

    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      SECTIONS.map((section) => `#${section.id}`),
    );
  });

  it('troca o tema pelo botão do menu lateral', async () => {
    const { fixture, element } = await render();
    const toggle = [...element.querySelectorAll<HTMLButtonElement>('.sidebar__footer button')].find(
      (item) => item.textContent?.includes('Ativar tema claro'),
    );

    toggle?.click();
    await fixture.whenStable();

    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(toggle?.textContent).toContain('Ativar tema escuro');
  });

  it('o index.html traz o script anti-flash desta versão da biblioteca', () => {
    expect(hasThemeInitScript(indexHtml)).toBe(true);
  });
});
