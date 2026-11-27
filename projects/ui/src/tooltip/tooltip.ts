import { DestroyRef, Directive, ElementRef, effect, inject, input } from '@angular/core';
import { TooltipLayer } from './tooltip-layer';

/**
 * Dica no tema (classe .tooltip de @vinicgobbi/ui/styles), à direita do elemento, ao passar o mouse (com uma
 * pequena espera) ou focar com o teclado (na hora). Fecha com Esc. Ver
 * TooltipLayer para o comportamento entre itens vizinhos.
 *
 * É só visual (aria-hidden): o elemento precisa ter o próprio nome acessível,
 * como um rótulo escondido visualmente.
 */
@Directive({
  selector: '[vgTooltip]',
  host: {
    '(mouseenter)': 'show(false)',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show(true)',
    '(focusout)': 'hide()',
    '(click)': 'dismiss()',
    '(document:keydown.escape)': 'dismiss()',
  },
})
export class Tooltip {
  readonly text = input.required<string>({ alias: 'vgTooltip' });
  /** Com true a dica não aparece (ex.: menu expandido, com os rótulos visíveis). */
  readonly disabled = input(false, { alias: 'vgTooltipDisabled' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly layer = inject(TooltipLayer);

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.dismiss();
      }
    });
    inject(DestroyRef).onDestroy(() => this.dismiss());
  }

  protected show(immediate: boolean): void {
    const text = this.text();

    if (this.disabled() || !text) {
      return;
    }

    this.layer.show({ owner: this, text, anchor: this.host.nativeElement, immediate });
  }

  protected hide(): void {
    this.layer.hide(this);
  }

  protected dismiss(): void {
    this.layer.dismiss(this);
  }
}
