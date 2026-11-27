import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { isPascoa } from '../calendar';
import { SeasonalDecoration, pick, random } from '../shared/seasonal-decoration';

interface Egg {
  id: number;
  left: number;
  size: number;
  color: string;
  band: string;
  duration: number;
  delay: number;
  sway: number;
}

const EGG_COUNT = 14;
/** Pares de cor do ovo e da faixa, em tons pastel. */
const EGG_COLORS: readonly [string, string][] = [
  ['#f9a8d4', '#be185d'],
  ['#c4b5fd', '#6d28d9'],
  ['#fde68a', '#b45309'],
  ['#a7f3d0', '#047857'],
  ['#bae6fd', '#0369a1'],
];

/**
 * Decoração de Páscoa (Sexta-feira Santa ao domingo): ovinhos, coelho, saudação e acento lilás
 * (`data-pascoa`, ver styles/tokens.css). O coelho da saudação solta mais ovinhos.
 */
@Component({
  selector: 'vg-pascoa',
  templateUrl: './pascoa.html',
  styleUrls: ['../shared/greeting.css', './pascoa.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pascoa extends SeasonalDecoration {
  protected readonly occasion = 'pascoa' as const;
  protected readonly attribute = 'data-pascoa';
  protected readonly burstIcons = ['🥚', '🐣', '🐰', '🍫', '🌷'];
  protected readonly eggs = signal<Egg[]>([]);

  protected isToday(date: Date): boolean {
    return isPascoa(date);
  }

  protected override prepare(): void {
    this.eggs.set(
      Array.from({ length: EGG_COUNT }, () => {
        const [color, band] = pick(EGG_COLORS);
        const duration = random(14, 24);
        return {
          id: this.newId(),
          left: random(0, 100),
          size: random(12, 20),
          color,
          band,
          duration,
          // Atraso negativo: a página já abre com ovinhos descendo.
          delay: -random(0, duration),
          sway: random(15, 45) * (Math.random() < 0.5 ? -1 : 1),
        };
      }),
    );
  }
}
