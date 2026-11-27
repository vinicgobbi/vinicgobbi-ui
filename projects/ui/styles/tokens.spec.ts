import base from './base.css' with { loader: 'text' };
import components from './components.css' with { loader: 'text' };
import index from './index.css' with { loader: 'text' };
import layout from './layout.css' with { loader: 'text' };
import sidebar from './sidebar.css' with { loader: 'text' };
import tokens from './tokens.css' with { loader: 'text' };
import { customProperties, parseBlocks, requiredVariables } from './testing/parse-css';

const blocks = parseBlocks(tokens);
const DARK = ":root[data-theme='dark']";

/** Tokens que não mudam com o tema: tipografia e medidas. */
const THEME_INDEPENDENT = /^--(font-|radius|container$|reading$|nav-height$|sidebar-)/;

const lightThemeTokens = customProperties(blocks.get(':root')).filter(
  (name) => !THEME_INDEPENDENT.test(name),
);

describe('tokens.css', () => {
  it('o tema escuro redefine cada token de cor do tema claro, e só eles', () => {
    expect(customProperties(blocks.get(DARK))).toEqual(lightThemeTokens);
  });

  it('declara color-scheme nos dois temas', () => {
    expect(blocks.get(':root')?.get('color-scheme')).toBe('light');
    expect(blocks.get(DARK)?.get('color-scheme')).toBe('dark');
  });

  it.each(['halloween', 'natal'])(
    '%s troca as mesmas variáveis nos temas claro e escuro',
    (festa) => {
      const light = customProperties(blocks.get(`:root[data-${festa}]`));
      const dark = customProperties(blocks.get(`:root[data-${festa}][data-theme='dark']`));

      expect(light.length).toBeGreaterThan(0);
      expect(dark).toEqual(light);
    },
  );

  it('halloween e natal trocam toda a família do acento', () => {
    const accentFamily = lightThemeTokens.filter((name) => name.startsWith('--accent'));

    expect(customProperties(blocks.get(':root[data-halloween]'))).toEqual(accentFamily);
    expect(customProperties(blocks.get(':root[data-natal]'))).toEqual(
      [...accentFamily, '--snow'].sort(),
    );
  });
});

describe('folhas de estilo', () => {
  it('só usam variáveis definidas nos tokens ou na base', () => {
    const defined = new Set(
      [...parseBlocks(tokens).values(), ...parseBlocks(base).values()].flatMap((declarations) =>
        customProperties(declarations),
      ),
    );
    const used = [base, layout, components, sidebar].flatMap((css) => [...requiredVariables(css)]);

    expect(used.filter((name) => !defined.has(name))).toEqual([]);
  });

  it('index.css importa todas as partes', () => {
    const imports = [...index.matchAll(/@import '\.\/([\w-]+)\.css'/g)].map(([, name]) => name);

    expect(imports).toEqual(['tokens', 'fonts', 'base', 'layout', 'components']);
  });
});
