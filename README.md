# vinicgobbi-ui

Tema e componentes compartilhados dos meus sites: [portfólio](https://github.com/vinicgobbi/website), [links](https://github.com/vinicgobbi/links) e [blog](https://github.com/vinicgobbi/blog-front). Publicado no GitHub Packages como `@vinicgobbi/ui`.

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
pnpm start            # showcase em http://localhost:4200 (usa a biblioteca compilada)
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
