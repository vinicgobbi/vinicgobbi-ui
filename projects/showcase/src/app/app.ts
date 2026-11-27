import { Component, DOCUMENT, computed, inject, signal } from '@angular/core';
import { UI_VERSION } from '@vinicgobbi/ui';
import { RevealOnScroll } from '@vinicgobbi/ui/a11y';
import { Sidebar, SidebarState, provideSidebar } from '@vinicgobbi/ui/sidebar';
import { type Theme, ThemeService } from '@vinicgobbi/ui/theme';
import { Tooltip } from '@vinicgobbi/ui/tooltip';

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

/** Seções da vitrine, também usadas como itens do menu lateral. */
export const SECTIONS = [
  { id: 'cores', label: 'Cores', icon: 'bi-palette' },
  { id: 'tipografia', label: 'Tipografia', icon: 'bi-type' },
  { id: 'componentes', label: 'Componentes', icon: 'bi-ui-checks-grid' },
] as const;

/**
 * Vitrine do @vinicgobbi/ui, montada com a própria biblioteca: menu lateral, tema, dicas e
 * revelar ao rolar. A data comemorativa é trocada direto nos atributos do <html>, para ver
 * o acento de Halloween e Natal fora das datas.
 */
@Component({
  selector: 'app-root',
  imports: [RevealOnScroll, Sidebar, Tooltip],
  styleUrl: './app.scss',
  templateUrl: './app.html',
  providers: [provideSidebar('showcase')],
  host: { class: 'layout--sidebar' },
})
export class App {
  private readonly root = inject(DOCUMENT).documentElement;
  protected readonly theme = inject(ThemeService);
  protected readonly sidebar = inject(SidebarState);
  protected readonly sections = SECTIONS;

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

  protected readonly themeLabel = computed(() =>
    this.theme.theme() === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro',
  );
  protected readonly festa = signal<Festa>('nenhuma');

  protected setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  protected setFesta(festa: Festa): void {
    this.festa.set(festa);
    this.root.toggleAttribute('data-halloween', festa === 'halloween');
    this.root.toggleAttribute('data-natal', festa === 'natal');
  }
}
