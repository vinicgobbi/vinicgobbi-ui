import { SIDEBAR_INIT_SCRIPT, hasSidebarInitScript } from './sidebar-init';

/** Insere HTML como o parser faria e espera os callbacks do MutationObserver. */
async function arrive(html: string): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.innerHTML = html;
  const element = container.firstElementChild as HTMLElement;
  document.body.appendChild(element);
  await Promise.resolve();
  return element;
}

describe('SIDEBAR_INIT_SCRIPT', () => {
  beforeEach(() => new Function(SIDEBAR_INIT_SCRIPT)());

  afterEach(() => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('marca como recolhido o menu cuja escolha salva é essa', async () => {
    localStorage.setItem('sidebar.admin', 'collapsed');

    const sidebar = await arrive('<header class="sidebar" data-sidebar="admin"></header>');

    expect(sidebar.hasAttribute('data-collapsed')).toBe(true);
  });

  it('cada menu segue a própria escolha', async () => {
    localStorage.setItem('sidebar.blog', 'expanded');
    localStorage.setItem('sidebar.admin', 'collapsed');

    const blog = await arrive('<header class="sidebar" data-sidebar="blog"></header>');
    const admin = await arrive('<header class="sidebar" data-sidebar="admin"></header>');

    expect(blog.hasAttribute('data-collapsed')).toBe(false);
    expect(admin.hasAttribute('data-collapsed')).toBe(true);
  });

  it('encontra o menu dentro de um bloco inserido de uma vez', async () => {
    localStorage.setItem('sidebar.admin', 'collapsed');

    const layout = await arrive(
      '<div class="layout--sidebar"><header class="sidebar" data-sidebar="admin"></header></div>',
    );

    expect(layout.querySelector('.sidebar')?.hasAttribute('data-collapsed')).toBe(true);
  });

  it('para de observar quando o HTML termina de carregar', async () => {
    localStorage.setItem('sidebar.admin', 'collapsed');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const sidebar = await arrive('<header class="sidebar" data-sidebar="admin"></header>');

    expect(sidebar.hasAttribute('data-collapsed')).toBe(false);
  });
});

describe('hasSidebarInitScript', () => {
  it('aceita o script reformatado e acusa uma cópia desatualizada', () => {
    const reformatted = `<script>\n    ${SIDEBAR_INIT_SCRIPT.replace(/\n/g, '\n    ')}\n  </script>`;
    const outdated = SIDEBAR_INIT_SCRIPT.replace("'sidebar.'", "'menu.'");

    expect(hasSidebarInitScript(reformatted)).toBe(true);
    expect(hasSidebarInitScript(`<script>${outdated}</script>`)).toBe(false);
  });
});
