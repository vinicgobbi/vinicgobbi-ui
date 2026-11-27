import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { isAnoNovo } from '../calendar';
import { SeasonalDecoration, pick, random } from '../shared/seasonal-decoration';

interface Firework {
  id: number;
  /** Posição do estouro, em % da tela. */
  x: number;
  y: number;
  color: string;
  /** Raio do estouro, em px. */
  radius: number;
  duration: number;
  delay: number;
}

const FIREWORK_COUNT = 8;
const COLORS = ['#facc15', '#fbbf24', '#fde68a', '#f97316', '#f472b6', '#60a5fa', '#ffffff'];
/** Doze faíscas por estouro, uma a cada 30°. */
const SPARK_ANGLES = Array.from({ length: 12 }, (_, index) => index * 30);

/**
 * Decoração de Ano Novo (26/12 a 01/01): fogos de artifício, saudação e acento dourado
 * (`data-ano-novo`, ver styles/tokens.css). A taça solta mais fogos.
 */
@Component({
  selector: 'vg-ano-novo',
  templateUrl: './ano-novo.html',
  styleUrls: ['../shared/greeting.css', './ano-novo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnoNovo extends SeasonalDecoration {
  protected readonly occasion = 'ano-novo' as const;
  protected readonly attribute = 'data-ano-novo';
  protected readonly burstIcons = ['🎆', '🎇', '✨', '🥂', '🎉'];
  protected readonly sparkAngles = SPARK_ANGLES;
  protected readonly fireworks = signal<Firework[]>([]);

  protected isToday(date: Date): boolean {
    return isAnoNovo(date);
  }

  protected override prepare(): void {
    this.fireworks.set(
      Array.from({ length: FIREWORK_COUNT }, () => {
        const duration = random(2.2, 3.4);
        return {
          id: this.newId(),
          x: random(8, 92),
          y: random(10, 55),
          color: pick(COLORS),
          radius: Math.round(random(45, 90)),
          duration,
          // Atraso negativo em parte: a página já abre com fogos estourando.
          delay: random(-duration, duration * 2),
        };
      }),
    );
  }
}
