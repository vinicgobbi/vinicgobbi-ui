import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Revela o elemento com um fade sutil quando ele entra na tela (classes .reveal e .is-visible
 * de @vinicgobbi/ui/styles). A classe só entra no navegador: no SSR, no prerender ou sem
 * JavaScript, o conteúdo aparece normalmente. Com movimento reduzido, o CSS dispensa o efeito.
 */
@Directive({
  selector: '[vgRevealOnScroll]',
})
export class RevealOnScroll {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const element = this.elementRef.nativeElement;
      const view = element.ownerDocument.defaultView;

      // Sem IntersectionObserver não há como saber quando revelar: mostra de uma vez.
      if (!view || !('IntersectionObserver' in view)) {
        return;
      }

      element.classList.add('reveal');
      const observer = new view.IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }
          element.classList.add('is-visible');
          observer.disconnect();
        },
        { threshold: 0, rootMargin: '0px 0px -10% 0px' },
      );

      observer.observe(element);
    });
  }
}
