/**
 * Script anti-flash do tema: vai inline no <head> do index.html, antes de qualquer CSS, para
 * aplicar o tema salvo (ou o do sistema) antes da primeira pintura.
 *
 * Precisa ser inline: em angular.json > scripts ele entraria no fim do <body>, tarde demais.
 * Os apps colam este conteúdo em um <script> e verificam com hasThemeInitScript() num teste
 * que a cópia continua igual à da biblioteca.
 */
export const THEME_INIT_SCRIPT = `(function () {
  var theme;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();`;

/** Remove espaços e quebras de linha, que o Prettier do app pode reformatar. */
function compact(code: string): string {
  return code.replace(/\s+/g, '');
}

/** Se o HTML contém o script anti-flash desta versão da biblioteca. */
export function hasThemeInitScript(html: string): boolean {
  return compact(html).includes(compact(THEME_INIT_SCRIPT));
}
