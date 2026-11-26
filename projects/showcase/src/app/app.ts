import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UI_VERSION } from '@vinicgobbi/ui';

/** Vitrine do @vinicgobbi/ui: cada fase adiciona aqui as páginas de tokens e componentes. */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly version = UI_VERSION;
}
