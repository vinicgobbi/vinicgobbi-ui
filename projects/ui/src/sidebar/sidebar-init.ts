/**
 * Script anti-flash do menu lateral: vai inline no <head> do index.html de apps com SSR ou
 * prerender, para o menu recolhido não aparecer aberto antes do Angular carregar.
 *
 * Enquanto o navegador lê o HTML do servidor, marca cada `.sidebar[data-sidebar="nome"]` com
 * `data-collapsed` conforme o localStorage (`sidebar.<nome>`). Callbacks de MutationObserver
 * rodam antes da próxima pintura, então o menu já aparece no estado certo; serve para qualquer
 * nome de menu. Para de observar quando o HTML termina de carregar.
 *
 * Apps sem SSR não precisam dele: o SidebarState lê o estado antes da primeira renderização.
 */
export const SIDEBAR_INIT_SCRIPT = `(function () {
  function mark(sidebar) {
    var state;
    try {
      state = localStorage.getItem('sidebar.' + sidebar.getAttribute('data-sidebar'));
    } catch (e) {}
    if (state === 'collapsed') {
      sidebar.setAttribute('data-collapsed', '');
    }
  }
  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) {
          return;
        }
        if (node.matches('.sidebar[data-sidebar]')) {
          mark(node);
        }
        node.querySelectorAll('.sidebar[data-sidebar]').forEach(mark);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', function () {
    observer.disconnect();
  });
})();`;

/** Remove espaços e quebras de linha, que o Prettier do app pode reformatar. */
function compact(code: string): string {
  return code.replace(/\s+/g, '');
}

/** Se o HTML contém o script anti-flash do menu desta versão da biblioteca. */
export function hasSidebarInitScript(html: string): boolean {
  return compact(html).includes(compact(SIDEBAR_INIT_SCRIPT));
}
