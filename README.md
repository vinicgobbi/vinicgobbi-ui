# vinicgobbi-ui

Minha identidade visual: tokens de cor e tipografia, CSS base e componentes Angular, usados pelo [portfólio](https://github.com/vinicgobbi/website), pela [página de links](https://github.com/vinicgobbi/links), pelo [blog](https://github.com/vinicgobbi/blog-front) e pelos sistemas que eu vier a criar. Publicado no GitHub Packages como `@vinicgobbi/ui`.

O CSS não depende de framework e serve para qualquer projeto (Angular, Laravel/Blade, React, HTML puro). Os componentes e serviços em Angular são opcionais.

## Estrutura

```
projects/ui/         # a biblioteca publicada (@vinicgobbi/ui)
projects/showcase/   # vitrine para ver tokens e componentes nos dois temas
```

Cada área da biblioteca é um entry point secundário, declarado em `projects/ui/package.json > exports`, para os apps importarem só o que usam.

## Desenvolvimento

```bash
pnpm install
pnpm build:lib        # compila a biblioteca em dist/vinicgobbi/ui
pnpm start            # showcase em http://localhost:4200: tokens e componentes nos dois temas
pnpm watch:lib        # recompila a biblioteca a cada alteração, junto com o start
pnpm test             # testes da biblioteca e do showcase (Vitest)
pnpm lint             # ESLint (angular-eslint)
pnpm format:check     # Prettier
```

### Testando num app antes de publicar

```bash
pnpm build:lib
cd ../blog_novo && pnpm link ../vinicgobbi-ui/dist/vinicgobbi/ui
```

## Usando os estilos

`@vinicgobbi/ui/styles/index.css` traz tokens, fontes (Inter e Manrope, self-hosted), Bootstrap Icons, base, layout e componentes. Cada parte também existe sozinha (`tokens.css`, `fonts.css`, `base.css`, `layout.css`, `components.css`). O menu lateral é opcional: `sidebar.css`, importado depois do `index.css`.

Em Angular, por `angular.json`:

```json
"styles": ["node_modules/@vinicgobbi/ui/styles/index.css", "src/styles.css"]
```

Ou no `styles.scss`, com `@import` e a extensão `.css`:

```scss
@import '@vinicgobbi/ui/styles/index.css';
```

Não use `@use` nesse caso: ele copia o CSS para dentro do arquivo do app, e os `@import` internos do pacote (as outras partes, `@fontsource`, `bootstrap-icons`) deixam de resolver. Com `@import` e `.css`, o Sass mantém a regra como CSS puro e o bundler a resolve a partir do pacote.

O tema vem de `<html data-theme="light|dark">`, e as datas comemorativas, de `data-halloween` e `data-natal`. O brilho do acento no topo da página é opcional:

```css
:root {
  --page-glow: var(--glow-accent);
}
```

## Usando em Angular

Cada área é um entry point, importado só por quem usa:

| Entry point               | O que tem                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `@vinicgobbi/ui/theme`    | `ThemeService` (claro/escuro), `THEME_INIT_SCRIPT`                                        |
| `@vinicgobbi/ui/sidebar`  | `<vg-sidebar>`, `<vg-sidebar-group>`, `provideSidebar(nome)`, `SIDEBAR_INIT_SCRIPT`       |
| `@vinicgobbi/ui/tooltip`  | diretiva `vgTooltip`                                                                      |
| `@vinicgobbi/ui/seasonal` | `<vg-seasonal>` (todas as datas comemorativas), `SeasonalGreeting`, `provideSeasonalDate` |
| `@vinicgobbi/ui/consent`  | `<vg-cookie-banner>`, `AnalyticsService`, `provideAnalytics({ measurementId })`           |
| `@vinicgobbi/ui/a11y`     | `<vg-vlibras>`, diretiva `vgRevealOnScroll`                                               |

Tudo funciona com zone.js ou zoneless, e com SSR ou prerender: o que depende do navegador só roda depois da primeira renderização.

### Scripts anti-flash

Tema e menu recolhido precisam estar certos antes da primeira pintura, então cada um tem um script que vai **inline no `<head>`**. No `angular.json > scripts` ele entraria no fim do `<body>`, tarde demais. Cole o conteúdo de `THEME_INIT_SCRIPT` num `<script>`. Com SSR ou prerender e `<vg-sidebar>`, cole também o de `SIDEBAR_INIT_SCRIPT`. Um teste no app garante que a cópia acompanha a biblioteca:

```ts
import { hasThemeInitScript } from '@vinicgobbi/ui/theme';
import indexHtml from '../index.html' with { loader: 'text' };

it('o index.html traz o script anti-flash do tema', () => {
  expect(hasThemeInitScript(indexHtml)).toBe(true);
});
```

### Datas comemorativas

`<vg-seasonal />` reúne todas as ocasiões num elemento só. Cada uma aparece só na sua data, no fuso de quem visita, e fica ativa o período inteiro, sem opção de fechar:

| Ocasião     | Período                      | Acento            | Cena                   |
| ----------- | ---------------------------- | ----------------- | ---------------------- |
| Ano Novo    | 26/12 a 01/01                | dourado           | fogos de artifício     |
| Carnaval    | sábado a terça de Carnaval   | magenta           | confete e serpentinas  |
| Páscoa      | Sexta-feira Santa ao domingo | lilás             | ovinhos e coelho       |
| Aniversário | 01/10                        | o normal da marca | balões                 |
| Halloween   | 31/10                        | laranja           | morcegos e aranha      |
| Natal       | 01/12 a 25/12                | vermelho          | neve, trenó e enfeites |

Carnaval e Páscoa mudam a cada ano e são calculados a partir do domingo de Páscoa (`easterSunday`). Fora das datas nada é renderizado; com movimento reduzido, só o acento e a saudação aparecem. Ao sair da tela, a decoração devolve o acento normal. Cada ocasião também existe como componente próprio (`<vg-natal />`, `<vg-carnaval />`...).

Para ver uma ocasião fora da data (numa vitrine ou num teste), troque o relógio: `provideSeasonalDate(() => new Date(2026, 11, 31))`.

O input `placement` (de `<vg-seasonal>`, `<vg-natal>` e `<vg-halloween>`) escolhe onde pendurar os enfeites de Natal e a aranha de Halloween: `margins` (padrão, nas margens do container) ou `edges` (a 12% das laterais, para páginas estreitas). Ajustes no `:root` do app:

| Variável                                 | Padrão      | Para quê                                                                                                |
| ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `--seasonal-start`                       | `0px`       | Onde começa a área de conteúdo. Com menu lateral fixo, a largura dele, para nada ficar por cima do menu |
| `--seasonal-hanging-display`             | `block`     | `none` esconde enfeites e aranha quando a margem livre do layout for estreita demais                    |
| `--seasonal-z` / `--seasonal-greeting-z` | `40` / `55` | Camadas da decoração e da saudação (o aviso de cookies fica em 60)                                      |

A saudação aparece num balão no canto inferior esquerdo. Para mostrá-la em outro lugar (ex.: no placeholder de uma busca), use `<vg-seasonal greeting="none" />` e leia o `SeasonalGreeting`: `occasion()` e `text()` (mensagem, emoji e ação do botão) ficam `null` fora das datas, e `release({ x, y })` solta a revoada a partir de um ponto da tela.

### Menu lateral

```ts
@Component({
  imports: [Sidebar, SidebarGroup, Tooltip],
  providers: [provideSidebar('admin')],
  host: { class: 'layout--sidebar' },
  template: `
    <vg-sidebar>
      <a sidebarBrand class="brand" href="/">
        <span class="brand__mark" aria-hidden="true">VG</span>
        <span class="brand__name">Admin</span>
      </a>
      <button
        sidebarActions
        type="button"
        class="sidebar-action"
        aria-label="Trocar tema"
        vgTooltip="Trocar tema"
        (click)="theme.toggle()"
      >
        <i class="bi bi-moon-stars" aria-hidden="true"></i>
      </button>
      <nav aria-label="Principal">
        <ul class="sidebar-links">
          <li>
            <a
              class="sidebar-link"
              routerLink="/posts"
              routerLinkActive="active"
              vgTooltip="Posts"
              [vgTooltipDisabled]="!sidebar.showTooltips()"
            >
              <i class="bi bi-file-earmark-text" aria-hidden="true"></i>
              <span class="sidebar-link__label">Posts</span>
            </a>
          </li>
          <li>
            <vg-sidebar-group label="Categorias" icon="folder2" [active]="naCategoria()">
              <ul class="sidebar-sublinks">
                <li>
                  <a class="sidebar-link sidebar-link--sub" routerLink="/categorias/angular">
                    <i class="bi bi-folder" aria-hidden="true"></i>
                    <span class="sidebar-link__label">Angular</span>
                    <span class="sidebar-link__count">3</span>
                  </a>
                </li>
              </ul>
            </vg-sidebar-group>
          </li>
        </ul>
      </nav>
      <ng-container sidebarFooter><!-- opcional: usuário, sair... --></ng-container>
    </vg-sidebar>
    <div class="layout__content"><main id="conteudo">...</main></div>
  `,
})
export class AdminLayout {
  protected readonly sidebar = inject(SidebarState);
}
```

Cada nome guarda o próprio estado recolhido (`localStorage`: `sidebar.<nome>`).

- `[sidebarActions]`: botões só com ícone numa linha abaixo da marca. O de recolher fica sempre no fim dela e, com o menu recolhido, vai para o topo da pilha.
- `<vg-sidebar-group>`: abre e fecha como pasta. Abre sozinho quando `active` fica true; com o menu recolhido, o clique expande o menu e abre o grupo.
- `[sidebarFooter]`: opcional; some quando está vazio.

## Instalando num app

O GitHub Packages exige autenticação até para instalar pacotes públicos. No app, o `.npmrc` só aponta o escopo para o registry do GitHub:

```ini
@vinicgobbi:registry=https://npm.pkg.github.com
```

O token **não** vai nesse arquivo: o pnpm 12 não expande variáveis em credenciais do `.npmrc` do repositório, para um repo não conseguir vazar tokens. Ele vem da configuração do usuário:

- **Localmente:** uma vez só, no `~/.npmrc`, `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}`. Antes de instalar, `export NODE_AUTH_TOKEN=$(gh auth token)`, com um token que tenha o escopo `read:packages` (`gh auth refresh -s read:packages`).
- **No GitHub Actions:** dê `packages: read` ao job, passe `registry-url: https://npm.pkg.github.com` e `scope: '@vinicgobbi'` ao `actions/setup-node` (ele gera o `.npmrc` de usuário) e `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` no `pnpm install`. O pacote é público, então o `GITHUB_TOKEN` de qualquer repositório consegue lê-lo.

Logo depois de cada versão nova, o `minimumReleaseAge` do pnpm recusa o pacote por um tempo; o `pnpm add` registra uma exceção só para aquela versão em `pnpm-workspace.yaml`.

## Versões e publicação

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). A cada push na `main`, o workflow [`release.yml`](.github/workflows/release.yml) roda o `cz bump` (versão, CHANGELOG e tag), cria a release no GitHub e publica no GitHub Packages com o `GITHUB_TOKEN` do workflow. Enquanto estiver em `0.x`, mudanças incompatíveis sobem o minor.

## Licença

[MIT](LICENSE).
