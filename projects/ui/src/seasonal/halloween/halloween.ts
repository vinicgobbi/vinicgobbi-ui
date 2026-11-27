import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { isHalloween } from '../calendar';
import {
  BurstOrigin,
  SEASONAL_GREETINGS,
  SeasonalGreeting,
  SeasonalGreetingMode,
} from '../greeting';
import { SeasonalPlacement } from '../placement';
import { SEASONAL_DATE } from '../seasonal-date';
import { random, registerGreeting } from '../shared/seasonal-decoration';

interface SwarmBat {
  id: number;
  dx: string;
  dy: string;
  size: number;
  delay: number;
  x?: number;
  y?: number;
}

const SWARM_SIZE = 14;
const SWARM_DURATION = 2400;

/**
 * Decoração de Halloween: morcegos, aranha, saudação e acento laranja (`data-halloween`, ver
 * styles/tokens.css). Fica ativa o dia inteiro, sem opção de fechar. A data é checada no
 * navegador, no fuso de quem visita; no SSR e no prerender nada é renderizado.
 */
@Component({
  selector: 'vg-halloween',
  imports: [NgTemplateOutlet],
  templateUrl: './halloween.html',
  styleUrl: './halloween.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-placement]': 'placement()' },
})
export class Halloween {
  private readonly document = inject(DOCUMENT);
  private readonly today = inject(SEASONAL_DATE);
  private nextId = 0;

  /** Onde fica a aranha; ver SeasonalPlacement. */
  readonly placement = input<SeasonalPlacement>('margins');
  /** Onde fica a saudação; ver SeasonalGreetingMode. */
  readonly greeting = input<SeasonalGreetingMode>('floating');

  protected readonly text = SEASONAL_GREETINGS.halloween;

  protected readonly active = signal(false);
  protected readonly bats = [1, 2, 3, 4];
  /** Revoada solta ao clicar na abóbora. */
  protected readonly swarm = signal<SwarmBat[]>([]);
  /** Asa esquerda, presa ao ombro; a direita é a mesma espelhada. */
  protected readonly wing =
    'M-3 -4 C-12 -16 -30 -19 -47 -10 C-41 -7 -39 -2 -39 3 C-34 -1 -29 -1 -26 4 ' +
    'C-22 0 -16 0 -13 5 C-10 1 -6 1 -3 4 Z';

  constructor() {
    const destroyRef = inject(DestroyRef);
    const greeting = inject(SeasonalGreeting);

    afterNextRender(() => {
      if (!isHalloween(this.today())) {
        return;
      }
      this.active.set(true);
      this.document.documentElement.setAttribute('data-halloween', '');
      registerGreeting('halloween', (origin) => this.release(origin), destroyRef, greeting);
    });
    // Ao sair da tela (ex.: uma área do app sem decoração), o acento volta ao normal.
    destroyRef.onDestroy(() => this.document.documentElement.removeAttribute('data-halloween'));
  }

  protected release(origin?: BurstOrigin): void {
    const novos: SwarmBat[] = Array.from({ length: SWARM_SIZE }, () => ({
      id: this.nextId++,
      // Do balão, a revoada sobe para a direita; de outro ponto, se espalha em volta dele.
      dx: `${Math.round(origin ? random(-40, 40) : random(-5, 85))}vw`,
      dy: `${Math.round(origin ? random(-25, 60) : -random(30, 90))}vh`,
      size: Math.round(random(24, 52)),
      delay: Math.round(random(0, 400)),
      x: origin?.x,
      y: origin?.y,
    }));
    this.swarm.update((atual) => [...atual, ...novos]);
    setTimeout(() => {
      this.swarm.update((atual) => atual.filter((bat) => !novos.includes(bat)));
    }, SWARM_DURATION + 400);
  }
}
