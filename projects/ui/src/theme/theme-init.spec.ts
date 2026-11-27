import { THEME_STORAGE_KEY } from './theme.service';
import { THEME_INIT_SCRIPT, hasThemeInitScript } from './theme-init';

/** Roda o script como o navegador rodaria, com a preferência de sistema informada. */
function runScript(prefersLight: boolean): string | null {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-color-scheme: light)' && prefersLight,
  }));
  new Function(THEME_INIT_SCRIPT)();
  return document.documentElement.getAttribute('data-theme');
}

describe('THEME_INIT_SCRIPT', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  it('usa a escolha salva, acima da preferência do sistema', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(runScript(false)).toBe('light');

    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(runScript(true)).toBe('dark');
  });

  it('sem escolha salva, segue o sistema', () => {
    expect(runScript(true)).toBe('light');
    expect(runScript(false)).toBe('dark');
  });

  it('ignora valores inválidos salvos', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(runScript(true)).toBe('light');
  });

  it('lê a mesma chave que o ThemeService grava', () => {
    expect(THEME_INIT_SCRIPT).toContain(`localStorage.getItem('${THEME_STORAGE_KEY}')`);
  });
});

describe('hasThemeInitScript', () => {
  it('aceita o script reformatado pelo Prettier do app', () => {
    const reformatted = `<head><script>\n      ${THEME_INIT_SCRIPT.replace(/\n/g, '\n      ')}\n    </script></head>`;

    expect(hasThemeInitScript(reformatted)).toBe(true);
  });

  it('acusa uma cópia desatualizada', () => {
    const outdated = THEME_INIT_SCRIPT.replace("'theme'", "'tema'");

    expect(hasThemeInitScript(`<script>${outdated}</script>`)).toBe(false);
  });
});
