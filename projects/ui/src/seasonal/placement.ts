/**
 * Onde a decoração pendura os enfeites (Natal) e a aranha (Halloween):
 * - `margins`: no meio das margens laterais, fora do container e abaixo da barra fixa
 *   (`--nav-height`). Some quando não há margem livre. Para páginas largas com container.
 * - `edges`: a 12% das laterais, a partir do topo. Para páginas estreitas, sem barra fixa.
 */
export type SeasonalPlacement = 'margins' | 'edges';
