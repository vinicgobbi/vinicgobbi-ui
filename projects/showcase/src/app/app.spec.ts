import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UI_VERSION } from '@vinicgobbi/ui';
import { App, COLOR_TOKENS } from './app';

describe('App', () => {
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    root = TestBed.inject(DOCUMENT).documentElement;
    root.setAttribute('data-theme', 'dark');
  });

  afterEach(() => {
    root.removeAttribute('data-theme');
    root.removeAttribute('data-halloween');
    root.removeAttribute('data-natal');
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

  it('liga uma data comemorativa por vez', async () => {
    const { element } = await render();

    button(element, 'Data comemorativa', 'Halloween').click();
    expect(root.hasAttribute('data-halloween')).toBe(true);

    button(element, 'Data comemorativa', 'Natal').click();
    expect(root.hasAttribute('data-halloween')).toBe(false);
    expect(root.hasAttribute('data-natal')).toBe(true);

    button(element, 'Data comemorativa', 'Nenhuma').click();
    expect(root.hasAttribute('data-natal')).toBe(false);
  });
});
