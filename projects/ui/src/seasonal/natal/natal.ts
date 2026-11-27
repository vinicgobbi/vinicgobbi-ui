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
import { isNatal } from '../calendar';
import {
  BurstOrigin,
  SEASONAL_GREETINGS,
  SeasonalGreeting,
  SeasonalGreetingMode,
} from '../greeting';
import { SeasonalPlacement } from '../placement';
import { SEASONAL_DATE } from '../seasonal-date';
import { burstTarget, registerGreeting } from '../shared/seasonal-decoration';

interface Flake {
  id: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  sway: number;
}

interface Burst {
  id: number;
  icon: string;
  dx: string;
  dy: string;
  size: number;
  delay: number;
  spin: string;
  x?: number;
  y?: number;
}

const FLAKE_COUNT = 36;
const BURST_SIZE = 14;
const BURST_DURATION = 2400;
const BURST_ICONS = ['🎁', '⭐', '❄️', '🔔', '🎄'];

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Decoração de Natal: neve, trenó, enfeites, saudação e acento vermelho (`data-natal`, ver
 * styles/tokens.css). Fica ativa de 01/12 a 25/12, sem opção de fechar. A data é checada no
 * navegador, no fuso de quem visita; no SSR e no prerender nada é renderizado.
 */
@Component({
  selector: 'vg-natal',
  templateUrl: './natal.html',
  styleUrl: './natal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-placement]': 'placement()' },
})
export class Natal {
  private readonly document = inject(DOCUMENT);
  private readonly today = inject(SEASONAL_DATE);
  private nextId = 0;

  /** Onde ficam os enfeites; ver SeasonalPlacement. */
  readonly placement = input<SeasonalPlacement>('margins');
  /** Onde fica a saudação; ver SeasonalGreetingMode. */
  readonly greeting = input<SeasonalGreetingMode>('floating');

  protected readonly text = SEASONAL_GREETINGS.natal;

  protected readonly active = signal(false);
  protected readonly flakes = signal<Flake[]>([]);
  /** Revoada solta ao clicar no presente. */
  protected readonly burst = signal<Burst[]>([]);
  /** Rena virada para a direita, no sentido do voo. */
  protected readonly reindeer =
    'M3 21 C5 17 16 16 22 18 L27 9 L34 9 C36 9 37 11 36 12 L30 14 L27 23 ' +
    'C25 26 22 27 21 27 L25 36 L22 37 L17 28 L10 28 L6 37 L3 36 L5 27 C3 26 2 23 3 21 Z';
  protected readonly antlers = 'M28 9 L25 2 M26.5 5.5 L22 3.5 M31 9 L33 2 M32 5.5 L37 4';

  constructor() {
    const destroyRef = inject(DestroyRef);
    const greeting = inject(SeasonalGreeting);

    afterNextRender(() => {
      if (isNatal(this.today())) {
        this.show();
        registerGreeting('natal', (origin) => this.release(origin), destroyRef, greeting);
      }
    });
    // Ao sair da tela (ex.: uma área do app sem decoração), o acento volta ao normal.
    destroyRef.onDestroy(() => this.document.documentElement.removeAttribute('data-natal'));
  }

  protected release(origin?: BurstOrigin): void {
    const novos: Burst[] = Array.from({ length: BURST_SIZE }, () => ({
      id: this.nextId++,
      icon: BURST_ICONS[Math.floor(Math.random() * BURST_ICONS.length)],
      ...burstTarget(origin),
      size: Math.round(random(16, 34)),
      delay: Math.round(random(0, 400)),
      spin: `${Math.round(random(-200, 200))}deg`,
      x: origin?.x,
      y: origin?.y,
    }));
    this.burst.update((atual) => [...atual, ...novos]);
    setTimeout(() => {
      this.burst.update((atual) => atual.filter((item) => !novos.includes(item)));
    }, BURST_DURATION + 400);
  }

  private show(): void {
    this.flakes.set(this.createFlakes());
    this.active.set(true);
    this.document.documentElement.setAttribute('data-natal', '');
  }

  private createFlakes(): Flake[] {
    return Array.from({ length: FLAKE_COUNT }, () => {
      const duration = random(10, 22);
      return {
        id: this.nextId++,
        left: random(0, 100),
        size: random(3, 8),
        opacity: random(0.35, 0.85),
        duration,
        // Atraso negativo: a página já abre nevando, em vez de a neve surgir toda do topo.
        delay: -random(0, duration),
        sway: random(10, 40) * (Math.random() < 0.5 ? -1 : 1),
      };
    });
  }
}
