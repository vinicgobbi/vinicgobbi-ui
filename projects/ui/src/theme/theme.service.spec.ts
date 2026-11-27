import { DOCUMENT, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

function setup(platform: 'browser' | 'server' = 'browser') {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });

  return { theme: TestBed.inject(ThemeService), root: TestBed.inject(DOCUMENT).documentElement };
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('troca de escuro para claro, atualizando o <html> e salvando a escolha', () => {
    const { theme, root } = setup();

    theme.toggle();

    expect(theme.theme()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('volta para escuro no segundo toggle', () => {
    const { theme, root } = setup();

    theme.toggle();
    theme.toggle();

    expect(theme.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('aplica um tema específico com set()', () => {
    const { theme, root } = setup();

    theme.set('light');
    theme.set('light');

    expect(theme.theme()).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('lê o tema aplicado pelo script anti-flash depois da primeira renderização', async () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const { theme } = setup();

    TestBed.tick();

    expect(theme.theme()).toBe('light');
  });

  it('não mexe no armazenamento do navegador durante o SSR', () => {
    const { theme } = setup('server');

    theme.toggle();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});
