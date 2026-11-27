import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { SidebarGroup } from './sidebar-group';
import { SidebarState, provideSidebar } from './sidebar-state';
import { stubWideScreen } from './testing/wide-screen';

@Component({
  imports: [Sidebar, SidebarGroup],
  providers: [provideSidebar('grupos')],
  template: `
    <vg-sidebar>
      <nav aria-label="Principal">
        <ul class="sidebar-links">
          <li>
            <vg-sidebar-group label="Categorias" icon="folder2" [active]="active()">
              <ul class="sidebar-sublinks">
                <li><a class="sidebar-link sidebar-link--sub" href="/c/a">A</a></li>
              </ul>
            </vg-sidebar-group>
          </li>
        </ul>
      </nav>
    </vg-sidebar>
  `,
})
class Host {
  readonly state = inject(SidebarState);
  readonly active = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    element,
    host: fixture.componentInstance,
    group: element.querySelector<HTMLElement>('vg-sidebar-group')!,
    toggle: element.querySelector<HTMLButtonElement>('.sidebar-group__toggle')!,
    panel: element.querySelector<HTMLElement>('.sidebar-group__panel')!,
  };
}

describe('SidebarGroup', () => {
  let restoreScreen: () => void;

  beforeEach(() => (restoreScreen = stubWideScreen()));

  afterEach(() => {
    restoreScreen();
    localStorage.clear();
    document.documentElement.removeAttribute('data-sidebar-grupos');
  });

  it('começa fechado, com os sub-itens fora da ordem de foco', async () => {
    const { group, toggle, panel } = await render();

    expect(toggle.textContent).toContain('Categorias');
    expect(toggle.querySelector('i.bi-folder2')).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(panel.id);
    expect(group.hasAttribute('data-expanded')).toBe(false);
    expect(panel.inert).toBe(true);
  });

  it('abre e fecha ao clicar', async () => {
    const { fixture, group, toggle, panel } = await render();

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(group.hasAttribute('data-expanded')).toBe(true);
    expect(panel.inert).toBe(false);

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('abre sozinho quando fica ativo (ex.: a página atual é de um sub-item)', async () => {
    const { fixture, host, toggle } = await render();

    host.active.set(true);
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.classList).toContain('sidebar-group__toggle--active');
  });

  it('com o menu recolhido, expande o menu e abre o grupo, com o nome como dica', async () => {
    const { fixture, host, toggle } = await render();
    host.state.toggleCollapsed();
    await fixture.whenStable();

    toggle.dispatchEvent(new FocusEvent('focusin'));
    expect(document.querySelector('.tooltip')?.textContent).toBe('Categorias');

    toggle.click();
    await fixture.whenStable();

    expect(host.state.collapsed()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});
