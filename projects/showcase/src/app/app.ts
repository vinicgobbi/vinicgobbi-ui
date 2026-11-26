import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { UI_VERSION } from '@vinicgobbi/ui';

type Theme = 'light' | 'dark';
type Festa = 'nenhuma' | 'halloween' | 'natal';

interface Swatch {
  token: string;
  description: string;
}

/** Tokens de cor exibidos na vitrine, na ordem de tokens.css. */
export const COLOR_TOKENS: readonly Swatch[] = [
  { token: '--bg', description: 'Fundo da página' },
  { token: '--surface', description: 'Cards e painéis' },
  { token: '--surface-2', description: 'Seções alternadas, hover' },
  { token: '--text', description: 'Texto principal' },
  { token: '--text-muted', description: 'Texto secundário' },
  { token: '--text-subtle', description: 'Legendas, ajuda' },
  { token: '--border', description: 'Bordas' },
  { token: '--accent', description: 'Acento (botão primário)' },
  { token: '--accent-hover', description: 'Acento no hover' },
  { token: '--accent-contrast', description: 'Texto sobre o acento' },
  { token: '--accent-soft', description: 'Fundo suave do acento' },
  { token: '--accent-text', description: 'Links e texto de acento' },
  { token: '--danger', description: 'Erro' },
  { token: '--danger-soft', description: 'Fundo de erro' },
  { token: '--warning', description: 'Atenção' },
  { token: '--warning-soft', description: 'Fundo de atenção' },
  { token: '--warning-text', description: 'Texto de atenção' },
  { token: '--info', description: 'Informação' },
];

/**
 * Vitrine do @vinicgobbi/ui: tokens e componentes em CSS, com troca de tema e de data
 * comemorativa direto nos atributos do <html>, como os apps fazem.
 */
@Component({
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly root = inject(DOCUMENT).documentElement;

  protected readonly version = UI_VERSION;
  protected readonly colorTokens = COLOR_TOKENS;
  protected readonly themes: readonly { value: Theme; label: string }[] = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
  ];
  protected readonly festas: readonly { value: Festa; label: string }[] = [
    { value: 'nenhuma', label: 'Nenhuma' },
    { value: 'halloween', label: 'Halloween' },
    { value: 'natal', label: 'Natal' },
  ];

  protected readonly theme = signal<Theme>(
    this.root.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
  );
  protected readonly festa = signal<Festa>('nenhuma');

  protected setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.root.setAttribute('data-theme', theme);
  }

  protected setFesta(festa: Festa): void {
    this.festa.set(festa);
    this.root.toggleAttribute('data-halloween', festa === 'halloween');
    this.root.toggleAttribute('data-natal', festa === 'natal');
  }
}
