/** Declarações de cada bloco `seletor { ... }` de uma folha sem aninhamento. */
export type CssBlocks = Map<string, Map<string, string>>;

/**
 * Lê uma folha de estilo simples (sem regras aninhadas, como as de tokens) e devolve as
 * declarações agrupadas por seletor. Blocos repetidos do mesmo seletor são combinados.
 */
export function parseBlocks(css: string): CssBlocks {
  const blocks: CssBlocks = new Map();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const [, rawSelector, body] of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rawSelector.trim().replace(/\s+/g, ' ');
    const declarations = blocks.get(selector) ?? new Map<string, string>();

    for (const declaration of body.split(';')) {
      const separator = declaration.indexOf(':');
      if (separator === -1) {
        continue;
      }
      declarations.set(
        declaration.slice(0, separator).trim(),
        declaration.slice(separator + 1).trim(),
      );
    }

    blocks.set(selector, declarations);
  }

  return blocks;
}

/** Nomes das propriedades customizadas (`--x`) declaradas em um bloco. */
export function customProperties(declarations: Map<string, string> | undefined): string[] {
  return [...(declarations?.keys() ?? [])].filter((name) => name.startsWith('--')).sort();
}

/** Propriedades customizadas lidas com `var(--x)` sem valor de reserva. */
export function requiredVariables(css: string): Set<string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const names = [...withoutComments.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map(([, name]) => name);
  return new Set(names);
}
