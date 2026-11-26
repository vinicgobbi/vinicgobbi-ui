import { TestBed } from '@angular/core/testing';
import { UI_VERSION } from '@vinicgobbi/ui';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('mostra o nome e a versão da biblioteca', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('@vinicgobbi/ui');
    expect(compiled.textContent).toContain(`Versão ${UI_VERSION}`);
  });
});
