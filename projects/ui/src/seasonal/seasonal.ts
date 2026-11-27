import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnoNovo } from './ano-novo/ano-novo';
import { Aniversario } from './aniversario/aniversario';
import { Carnaval } from './carnaval/carnaval';
import { Halloween } from './halloween/halloween';
import { Natal } from './natal/natal';
import { Pascoa } from './pascoa/pascoa';
import { SeasonalPlacement } from './placement';

/**
 * Todas as datas comemorativas num elemento só: Ano Novo, Carnaval, Páscoa, aniversário,
 * Halloween e Natal. Cada decoração só aparece na sua data, e os períodos não se sobrepõem
 * (ver calendar.ts); fora delas, nada é renderizado.
 */
@Component({
  selector: 'vg-seasonal',
  imports: [AnoNovo, Carnaval, Pascoa, Aniversario, Halloween, Natal],
  template: `
    <vg-ano-novo />
    <vg-carnaval />
    <vg-pascoa />
    <vg-aniversario />
    <vg-halloween [placement]="placement()" />
    <vg-natal [placement]="placement()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class Seasonal {
  /** Onde Natal e Halloween penduram enfeites e aranha; ver SeasonalPlacement. */
  readonly placement = input<SeasonalPlacement>('margins');
}
