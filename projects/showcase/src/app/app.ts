import { Component, Injectable, computed, inject, signal } from '@angular/core';
import { UI_VERSION } from '@vinicgobbi/ui';
import { RevealOnScroll } from '@vinicgobbi/ui/a11y';
import { SEASONAL_DATE, Seasonal, easterSunday } from '@vinicgobbi/ui/seasonal';
import { Sidebar, SidebarState, provideSidebar } from '@vinicgobbi/ui/sidebar';
import { type Theme, ThemeService } from '@vinicgobbi/ui/theme';
import { Tooltip } from '@vinicgobbi/ui/tooltip';

type Festa = 'nenhuma' | 'ano-novo' | 'carnaval' | 'pascoa' | 'aniversario' | 'halloween' | 'natal';

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

const YEAR = new Date().getFullYear();
const EASTER = easterSunday(YEAR);

/** Um dia representativo de cada ocasião, no ano atual; "nenhuma" é um dia comum. */
export const FESTA_DATES: Record<Festa, Date> = {
  nenhuma: new Date(YEAR, 5, 15),
  'ano-novo': new Date(YEAR, 11, 31),
  carnaval: new Date(YEAR, EASTER.getMonth(), EASTER.getDate() - 48),
  pascoa: EASTER,
  aniversario: new Date(YEAR, 9, 1),
  halloween: new Date(YEAR, 9, 31),
  natal: new Date(YEAR, 11, 10),
};

/** Data que as decorações enxergam na vitrine: a da ocasião escolhida. */
@Injectable()
export class SeasonalPreview {
  readonly date = signal(FESTA_DATES.nenhuma);
}

/** Seções da vitrine, também usadas como itens do menu lateral. */
export const SECTIONS = [
  { id: 'cores', label: 'Cores', icon: 'bi-palette' },
  { id: 'tipografia', label: 'Tipografia', icon: 'bi-type' },
  { id: 'componentes', label: 'Componentes', icon: 'bi-ui-checks-grid' },
] as const;

/**
 * Vitrine do @vinicgobbi/ui, montada com a própria biblioteca: menu lateral, tema, dicas,
 * revelar ao rolar e as datas comemorativas, vistas fora da data com provideSeasonalDate.
 */
@Component({
  selector: 'app-root',
  imports: [RevealOnScroll, Seasonal, Sidebar, Tooltip],
  styleUrl: './app.scss',
  templateUrl: './app.html',
  providers: [
    provideSidebar('showcase'),
    SeasonalPreview,
    {
      provide: SEASONAL_DATE,
      useFactory: () => {
        const preview = inject(SeasonalPreview);
        return () => preview.date();
      },
    },
  ],
  host: { class: 'layout--sidebar' },
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly preview = inject(SeasonalPreview);
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
    { value: 'ano-novo', label: 'Ano Novo' },
    { value: 'carnaval', label: 'Carnaval' },
    { value: 'pascoa', label: 'Páscoa' },
    { value: 'aniversario', label: 'Aniversário' },
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

  /** A decoração lê a data ao aparecer; o @for do template a recria a cada troca. */
  protected setFesta(festa: Festa): void {
    this.preview.date.set(FESTA_DATES[festa]);
    this.festa.set(festa);
  }
}
