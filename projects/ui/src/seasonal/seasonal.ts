import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnoNovo } from './ano-novo/ano-novo';
import { Aniversario } from './aniversario/aniversario';
import { Carnaval } from './carnaval/carnaval';
import { Halloween } from './halloween/halloween';
import { Natal } from './natal/natal';
import { Pascoa } from './pascoa/pascoa';
import { SeasonalGreetingMode } from './greeting';
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
    <vg-ano-novo [greeting]="greeting()" />
    <vg-carnaval [greeting]="greeting()" />
    <vg-pascoa [greeting]="greeting()" />
    <vg-aniversario [greeting]="greeting()" />
    <vg-halloween [placement]="placement()" [greeting]="greeting()" />
    <vg-natal [placement]="placement()" [greeting]="greeting()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class Seasonal {
  /** Onde Natal e Halloween penduram enfeites e aranha; ver SeasonalPlacement. */
  readonly placement = input<SeasonalPlacement>('margins');
  /**
   * `none` tira o balão da saudação; o app a mostra onde quiser com o SeasonalGreeting. Ver
   * SeasonalGreetingMode.
   */
  readonly greeting = input<SeasonalGreetingMode>('floating');
}
