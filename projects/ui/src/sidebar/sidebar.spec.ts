import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';
import { SidebarState, provideSidebar } from './sidebar-state';
import { stubWideScreen } from './testing/wide-screen';

@Component({ template: '' })
class Page {}

@Component({
  imports: [Sidebar],
  providers: [provideSidebar('painel')],
  template: `
    <vg-sidebar>
      <a sidebarBrand class="brand" href="/">
        <span class="brand__mark" aria-hidden="true">VG</span>
        <span class="brand__name">Painel</span>
      </a>
      <nav aria-label="Principal">
        <ul class="sidebar-links">
          <li><a class="sidebar-link" href="/a">Item</a></li>
        </ul>
      </nav>
      <span sidebarFooter class="rodape">Rodapé</span>
    </vg-sidebar>
  `,
})
class Host {
  readonly state = inject(SidebarState);
}

async function render(withRouter = false) {
  TestBed.configureTestingModule({
    providers: withRouter ? [provideRouter([{ path: 'a', component: Page }])] : [],
  });
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  const toggle = element.querySelector<HTMLButtonElement>('.sidebar__toggle')!;

  return { fixture, element, toggle, state: fixture.componentInstance.state };
}

describe('Sidebar', () => {
  let restoreScreen: () => void;

  beforeEach(() => (restoreScreen = stubWideScreen()));

  afterEach(() => {
    restoreScreen();
    localStorage.clear();
    document.documentElement.removeAttribute('data-sidebar-painel');
  });

  it('distribui marca, navegação e rodapé nas áreas do menu', async () => {
    const { element } = await render();

    expect(element.querySelector('.sidebar__head .brand')).not.toBeNull();
    expect(element.querySelector('.sidebar__nav nav')).not.toBeNull();
    expect(element.querySelector('.sidebar__footer .rodape')).not.toBeNull();
  });

  it('identifica o menu para o CSS e para o script anti-flash', async () => {
    const { element } = await render();
    const sidebar = element.querySelector('.sidebar')!;

    expect(sidebar.getAttribute('data-sidebar')).toBe('painel');
    expect(sidebar.classList).toContain('sidebar--painel');
    expect(element.querySelector('.sidebar__panel')?.id).toBe('menu-lateral-painel');
  });

  it('abre e fecha a gaveta pelo botão, com rótulo e aria-expanded', async () => {
    const { fixture, element, toggle } = await render();

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Fechar menu');
    expect(element.querySelector('.sidebar__panel')?.classList).toContain('sidebar__panel--open');

    element.querySelector<HTMLElement>('.sidebar__backdrop')!.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.sidebar__backdrop')).toBeNull();
  });

  it('fecha a gaveta com Esc e devolve o foco ao botão', async () => {
    const { fixture, toggle } = await render();
    toggle.click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('recolhe e expande pelo botão do rodapé, marcando o menu e salvando a escolha', async () => {
    const { fixture, element } = await render();
    const collapse = element.querySelector<HTMLButtonElement>('.sidebar__collapse')!;

    collapse.click();
    await fixture.whenStable();

    expect(element.querySelector('.sidebar')?.hasAttribute('data-collapsed')).toBe(true);
    expect(collapse.getAttribute('aria-expanded')).toBe('false');
    expect(collapse.textContent).toContain('Expandir menu');
    expect(localStorage.getItem('sidebar.painel')).toBe('collapsed');

    collapse.click();
    await fixture.whenStable();

    expect(element.querySelector('.sidebar')?.hasAttribute('data-collapsed')).toBe(false);
    expect(collapse.textContent).toContain('Recolher menu');
  });

  it('já renderiza recolhido quando a escolha salva é essa', async () => {
    localStorage.setItem('sidebar.painel', 'collapsed');

    const { element } = await render();

    expect(element.querySelector('.sidebar')?.hasAttribute('data-collapsed')).toBe(true);
  });

  it('com Router, fecha a gaveta ao navegar', async () => {
    const { fixture, toggle, state } = await render(true);
    toggle.click();
    await fixture.whenStable();
    expect(state.menuOpen()).toBe(true);

    await TestBed.inject(Router).navigateByUrl('/a');
    await fixture.whenStable();

    expect(state.menuOpen()).toBe(false);
  });
});
