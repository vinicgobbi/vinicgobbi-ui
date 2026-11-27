import { Component, PLATFORM_ID, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SidebarState, provideSidebar } from './sidebar-state';
import { stubWideScreen } from './testing/wide-screen';

@Component({ template: '', providers: [provideSidebar('blog')] })
class Host {
  readonly state = inject(SidebarState);
}

async function render(platform: 'browser' | 'server' = 'browser'): Promise<SidebarState> {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();

  return fixture.componentInstance.state;
}

describe('SidebarState', () => {
  let restoreScreen: () => void;

  beforeEach(() => (restoreScreen = stubWideScreen()));

  afterEach(() => {
    restoreScreen();
    localStorage.clear();
    document.documentElement.removeAttribute('data-sidebar-blog');
  });

  it('começa expandido, sem dicas', async () => {
    const state = await render();

    expect(state.collapsed()).toBe(false);
    expect(state.showTooltips()).toBe(false);
  });

  it('começa recolhido se a escolha salva for essa', async () => {
    localStorage.setItem('sidebar.blog', 'collapsed');

    const state = await render();

    expect(state.collapsed()).toBe(true);
    expect(state.showTooltips()).toBe(true);
  });

  it('respeita o atributo do <html>, acima do localStorage', async () => {
    localStorage.setItem('sidebar.blog', 'collapsed');
    document.documentElement.setAttribute('data-sidebar-blog', 'expanded');

    expect((await render()).collapsed()).toBe(false);
  });

  it('no SSR começa expandido, sem ler o armazenamento', async () => {
    localStorage.setItem('sidebar.blog', 'collapsed');

    expect((await render('server')).collapsed()).toBe(false);
  });

  it('salva o estado recolhido e aplica no <html>', async () => {
    const state = await render();

    state.toggleCollapsed();

    expect(state.collapsed()).toBe(true);
    expect(document.documentElement.getAttribute('data-sidebar-blog')).toBe('collapsed');
    expect(localStorage.getItem('sidebar.blog')).toBe('collapsed');

    state.toggleCollapsed();

    expect(document.documentElement.getAttribute('data-sidebar-blog')).toBe('expanded');
    expect(localStorage.getItem('sidebar.blog')).toBe('expanded');
  });

  it('não mostra dicas em telas estreitas, onde a gaveta mostra os rótulos', async () => {
    restoreScreen();
    restoreScreen = stubWideScreen(false);
    localStorage.setItem('sidebar.blog', 'collapsed');

    const state = await render();

    expect(state.collapsed()).toBe(true);
    expect(state.showTooltips()).toBe(false);
  });
});

describe('provideSidebar', () => {
  it.each(['Admin', 'meu menu', '1menu', ''])('recusa o nome inválido "%s"', (name) => {
    expect(() => provideSidebar(name)).toThrow(/nome inválido/);
  });

  it('aceita nomes com letras minúsculas, números e hífens', () => {
    expect(() => provideSidebar('painel-2')).not.toThrow();
  });
});
