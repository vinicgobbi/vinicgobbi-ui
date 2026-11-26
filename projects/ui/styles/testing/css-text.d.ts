/** Folhas de estilo importadas como texto nos testes: `import css from './x.css' with { loader: 'text' }`. */
declare module '*.css' {
  const content: string;
  export default content;
}
