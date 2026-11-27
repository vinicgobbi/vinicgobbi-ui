import { ChangeDetectionStrategy, Component, effect, inject, input, model } from '@angular/core';
import { Tooltip } from '@vinicgobbi/ui/tooltip';
import { SidebarState } from './sidebar-state';

let nextId = 0;

/**
 * Item do menu que abre e fecha como uma pasta, mostrando os sub-itens logo abaixo (ex.:
 * categorias). Vai dentro de um <li> de .sidebar-links; o conteúdo projetado costuma ser uma
 * lista .sidebar-sublinks com .sidebar-link--sub.
 *
 * Com o menu recolhido, o grupo mostra só o ícone: clicar nele expande o menu e abre o grupo.
 * Fechado, o conteúdo fica `inert`, fora da ordem de foco.
 */
@Component({
  selector: 'vg-sidebar-group',
  imports: [Tooltip],
  templateUrl: './sidebar-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'sidebar-group',
    '[attr.data-expanded]': "expanded() ? '' : null",
  },
})
export class SidebarGroup {
  protected readonly state = inject(SidebarState);
  protected readonly panelId = `menu-grupo-${nextId++}`;

  readonly label = input.required<string>();
  /** Nome do ícone do Bootstrap Icons, sem o prefixo `bi-` (ex.: `folder2`). */
  readonly icon = input.required<string>();
  /** Marca o grupo como o da página atual; ao ficar true, o grupo abre. */
  readonly active = input(false);
  readonly expanded = model(false);

  constructor() {
    effect(() => {
      if (this.active()) {
        this.expanded.set(true);
      }
    });
  }

  protected toggle(): void {
    if (this.state.showTooltips()) {
      this.state.toggleCollapsed();
      this.expanded.set(true);

      return;
    }

    this.expanded.update((expanded) => !expanded);
  }
}
