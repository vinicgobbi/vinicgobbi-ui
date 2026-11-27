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

| Entry point               | O que tem                                                                       |
| ------------------------- | ------------------------------------------------------------------------------- |
| `@vinicgobbi/ui/theme`    | `ThemeService` (claro/escuro), `THEME_INIT_SCRIPT`                              |
| `@vinicgobbi/ui/sidebar`  | `<vg-sidebar>`, `provideSidebar(nome)`, `SIDEBAR_INIT_SCRIPT`                   |
| `@vinicgobbi/ui/tooltip`  | diretiva `vgTooltip`                                                            |
| `@vinicgobbi/ui/seasonal` | `<vg-natal>` (dezembro), `<vg-halloween>` (31/10)                               |
| `@vinicgobbi/ui/consent`  | `<vg-cookie-banner>`, `AnalyticsService`, `provideAnalytics({ measurementId })` |
| `@vinicgobbi/ui/a11y`     | `<vg-vlibras>`, diretiva `vgRevealOnScroll`                                     |

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

### Menu lateral

```ts
@Component({
  imports: [Sidebar, Tooltip],
  providers: [provideSidebar('admin')],
  host: { class: 'layout--sidebar' },
  template: `
    <vg-sidebar>
      <a sidebarBrand class="brand" href="/">
        <span class="brand__mark" aria-hidden="true">VG</span>
        <span class="brand__name">Admin</span>
      </a>
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
        </ul>
      </nav>
      <ng-container sidebarFooter><!-- tema, sair... --></ng-container>
    </vg-sidebar>
    <div class="layout__content"><main id="conteudo">...</main></div>
  `,
})
export class AdminLayout {
  protected readonly sidebar = inject(SidebarState);
}
```

Cada nome guarda o próprio estado recolhido (`localStorage`: `sidebar.<nome>`).

## Instalando num app

O GitHub Packages exige autenticação até para instalar pacotes públicos. No app, um `.npmrc` aponta o escopo para o registry do GitHub:

```ini
@vinicgobbi:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

- **Localmente:** exporte `NODE_AUTH_TOKEN` com um token do GitHub com o escopo `read:packages`.
- **No GitHub Actions:** dê `packages: read` ao job e passe `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` no `pnpm install`. Em `@vinicgobbi/ui > Package settings > Manage Actions access`, libere o repositório do app.

## Versões e publicação

Commits seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/). A cada push na `main`, o workflow [`release.yml`](.github/workflows/release.yml) roda o `cz bump` (versão, CHANGELOG e tag), cria a release no GitHub e publica no GitHub Packages com o `GITHUB_TOKEN` do workflow. Enquanto estiver em `0.x`, mudanças incompatíveis sobem o minor.

## Licença

[MIT](LICENSE).
