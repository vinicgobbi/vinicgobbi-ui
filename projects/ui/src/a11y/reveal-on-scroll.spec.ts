import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealOnScroll } from './reveal-on-scroll';

@Component({
  imports: [RevealOnScroll],
  template: `<section vgRevealOnScroll>Conteúdo</section>`,
})
class Host {}

/** IntersectionObserver de mentira: guarda o callback para o teste disparar. */
class FakeObserver {
  static last?: FakeObserver;
  observed: Element[] = [];
  disconnected = false;

  constructor(readonly callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    FakeObserver.last = this;
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  disconnect(): void {
    this.disconnected = true;
  }
}

describe('RevealOnScroll', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeObserver.last = undefined;
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('section') as HTMLElement;
  }

  it('esconde o elemento até ele entrar na tela', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const section = await render();

    expect(section.classList).toContain('reveal');
    expect(section.classList).not.toContain('is-visible');
    expect(FakeObserver.last?.observed).toEqual([section]);
  });

  it('revela uma vez só, ao entrar na tela', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const section = await render();

    FakeObserver.last?.callback([{ isIntersecting: false }]);
    expect(section.classList).not.toContain('is-visible');

    FakeObserver.last?.callback([{ isIntersecting: true }]);
    expect(section.classList).toContain('is-visible');
    expect(FakeObserver.last?.disconnected).toBe(true);
  });

  it('sem IntersectionObserver, deixa o conteúdo visível', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    Reflect.deleteProperty(window, 'IntersectionObserver');
    const section = await render();

    expect(section.classList).not.toContain('reveal');
  });
});
