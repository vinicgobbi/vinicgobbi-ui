import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { isCarnaval } from '../calendar';
import { SeasonalDecoration, pick, random } from '../shared/seasonal-decoration';

interface Confetto {
  id: number;
  left: number;
  size: number;
  color: string;
  round: boolean;
  duration: number;
  delay: number;
  sway: number;
  spin: number;
}

interface Serpentine {
  id: number;
  left: number;
  color: string;
  duration: number;
  delay: number;
  spin: number;
}

const CONFETTI_COUNT = 40;
const SERPENTINE_COUNT = 6;
const COLORS = ['#ec4899', '#a855f7', '#facc15', '#22c55e', '#3b82f6', '#f97316'];

/**
 * Decoração de Carnaval (sábado a terça de Carnaval): confete, serpentinas, saudação e acento
 * magenta (`data-carnaval`, ver styles/tokens.css). A máscara solta mais confete.
 */
@Component({
  selector: 'vg-carnaval',
  templateUrl: './carnaval.html',
  styleUrls: ['../shared/greeting.css', './carnaval.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Carnaval extends SeasonalDecoration {
  protected readonly occasion = 'carnaval' as const;
  protected readonly attribute = 'data-carnaval';
  protected readonly burstIcons = ['🎉', '🎊', '🎭', '✨', '🥁'];
  protected readonly confetti = signal<Confetto[]>([]);
  protected readonly serpentines = signal<Serpentine[]>([]);
  /** Serpentina ondulada, desenhada de cima para baixo. */
  protected readonly serpentinePath = 'M10 0 C20 15 0 25 10 40 S20 65 10 80 S0 105 10 120';

  protected isToday(date: Date): boolean {
    return isCarnaval(date);
  }

  protected override prepare(): void {
    this.confetti.set(
      Array.from({ length: CONFETTI_COUNT }, () => {
        const duration = random(7, 14);
        return {
          id: this.newId(),
          left: random(0, 100),
          size: random(6, 11),
          color: pick(COLORS),
          round: Math.random() < 0.3,
          duration,
          // Atraso negativo: a página já abre com confete caindo.
          delay: -random(0, duration),
          sway: random(20, 60) * (Math.random() < 0.5 ? -1 : 1),
          spin: Math.round(random(360, 900)) * (Math.random() < 0.5 ? -1 : 1),
        };
      }),
    );
    this.serpentines.set(
      Array.from({ length: SERPENTINE_COUNT }, () => {
        const duration = random(14, 22);
        return {
          id: this.newId(),
          left: random(5, 95),
          color: pick(COLORS),
          duration,
          delay: -random(0, duration),
          spin: Math.round(random(-40, 40)),
        };
      }),
    );
  }
}
