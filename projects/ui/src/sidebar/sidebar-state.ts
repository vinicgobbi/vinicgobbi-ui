import { isPlatformBrowser } from '@angular/common';
import {
  DOCUMENT,
  DestroyRef,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  Provider,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

/** Nome do menu: cada um guarda o próprio estado (ex.: 'blog' e 'admin' no mesmo app). */
export const SIDEBAR_NAME = new InjectionToken<string>(
  'SIDEBAR_NAME: use provideSidebar(name) no componente que contém o <vg-sidebar>',
);

/** A partir desta largura o menu é uma coluna fixa; abaixo, vira gaveta (ver styles/sidebar.css). */
export const SIDEBAR_WIDE_QUERY = '(min-width: 960px)';

const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

/** Chave do localStorage, lida também pelo script anti-flash (SIDEBAR_INIT_SCRIPT). */
export function sidebarStorageKey(name: string): string {
  return `sidebar.${name}`;
}

/** Atributo do <html> com o estado do menu, para o CSS do app reagir se precisar. */
export function sidebarAttribute(name: string): string {
  return `data-sidebar-${name}`;
}

/** Fornece um estado de menu lateral para o componente e seus filhos. */
export function provideSidebar(name: string): Provider[] {
  if (!NAME_PATTERN.test(name)) {
    throw new Error(
      `provideSidebar: nome inválido ("${name}"). Use letras minúsculas, números e hífens.`,
    );
  }

  return [{ provide: SIDEBAR_NAME, useValue: name }, SidebarState];
}

/**
 * Estado de um menu lateral: recolhido (só ícones, em telas largas) e gaveta aberta (telas
 * estreitas).
 *
 * No navegador, o estado recolhido é lido já na criação, para a primeira renderização sair
 * certa. Com SSR, o script anti-flash (SIDEBAR_INIT_SCRIPT) marca o menu do HTML do servidor
 * antes da primeira pintura, com o mesmo valor; o Angular só confirma.
 */
@Injectable()
export class SidebarState {
  readonly name = inject(SIDEBAR_NAME);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly collapsed = signal(this.readCollapsed());
  readonly menuOpen = signal(false);
  private readonly wide = signal(false);
  /** As dicas só aparecem quando os rótulos estão escondidos: menu recolhido em tela larga. */
  readonly showTooltips = computed(() => this.collapsed() && this.wide());

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const view = this.document.defaultView;

      if (typeof view?.matchMedia !== 'function') {
        return;
      }

      const media = view.matchMedia(SIDEBAR_WIDE_QUERY);
      const onChange = (event: MediaQueryListEvent) => this.wide.set(event.matches);
      this.wide.set(media.matches);
      media.addEventListener('change', onChange);
      destroyRef.onDestroy(() => media.removeEventListener('change', onChange));
    });
  }

  toggleCollapsed(): void {
    const collapsed = !this.collapsed();
    const value = collapsed ? 'collapsed' : 'expanded';
    this.collapsed.set(collapsed);
    this.document.documentElement.setAttribute(sidebarAttribute(this.name), value);

    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(sidebarStorageKey(this.name), value);
    } catch {
      // Armazenamento indisponível (ex.: modo privado): o estado vale só para esta visita.
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** No SSR começa expandido: o servidor não conhece a escolha, e o script anti-flash corrige. */
  private readCollapsed(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const attribute = this.document.documentElement.getAttribute(sidebarAttribute(this.name));
    if (attribute) {
      return attribute === 'collapsed';
    }

    try {
      return localStorage.getItem(sidebarStorageKey(this.name)) === 'collapsed';
    } catch {
      return false;
    }
  }
}
