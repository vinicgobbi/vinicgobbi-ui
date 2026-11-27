import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Tooltip } from '@vinicgobbi/ui/tooltip';
import { SidebarState } from './sidebar-state';

/**
 * Casca de menu lateral: coluna fixa em telas largas, que pode ser recolhida para mostrar só os
 * ícones, e gaveta aberta pela barra do topo em telas estreitas. O conteúdo entra por projeção:
 * `[sidebarBrand]` (ex.: a .brand), a navegação e `[sidebarFooter]`. Os itens usam as classes
 * .sidebar-links, .sidebar-link, .sidebar-link__label e .sidebar-section de styles/sidebar.css.
 *
 * Requer provideSidebar(nome) no componente pai. Com Router, fecha a gaveta a cada navegação.
 */
@Component({
  selector: 'vg-sidebar',
  imports: [Tooltip],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents',
    '(document:keydown.escape)': 'closeMenu(true)',
  },
})
export class Sidebar {
  protected readonly state = inject(SidebarState);
  /** Único por menu, para dois menus na mesma página não repetirem o id. */
  protected readonly panelId = `menu-lateral-${this.state.name}`;

  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');

  constructor() {
    const router = inject(Router, { optional: true });

    if (router) {
      const subscription = router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.state.closeMenu();
        }
      });
      inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    }
  }

  /** Fecha a gaveta; com `restoreFocus`, devolve o foco ao botão que a abriu (ex.: Esc). */
  protected closeMenu(restoreFocus = false): void {
    if (!this.state.menuOpen()) {
      return;
    }

    this.state.closeMenu();

    if (restoreFocus) {
      this.menuToggle()?.nativeElement.focus();
    }
  }
}
