import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { isAniversario } from '../calendar';
import { SeasonalDecoration, pick, random } from '../shared/seasonal-decoration';

interface Balloon {
  id: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  sway: number;
}

const BALLOON_COUNT = 12;
/** O acento da marca entra junto: é o aniversário do dono dela. */
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899', 'var(--accent)'];

/**
 * Decoração do aniversário do Vinícius (01/10): balões subindo e saudação, com o acento normal
 * da marca. Marca o <html> com `data-aniversario`, para o app reagir se quiser. O bolo solta
 * mais balões.
 */
@Component({
  selector: 'vg-aniversario',
  templateUrl: './aniversario.html',
  styleUrls: ['../shared/greeting.css', './aniversario.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Aniversario extends SeasonalDecoration {
  protected readonly attribute = 'data-aniversario';
  protected readonly burstIcons = ['🎈', '🎉', '🎁', '✨', '🎂'];
  protected readonly balloons = signal<Balloon[]>([]);

  protected isToday(date: Date): boolean {
    return isAniversario(date);
  }

  protected override prepare(): void {
    this.balloons.set(
      Array.from({ length: BALLOON_COUNT }, () => {
        const duration = random(12, 20);
        return {
          id: this.newId(),
          left: random(2, 95),
          size: random(26, 42),
          color: pick(COLORS),
          duration,
          // Atraso negativo: a página já abre com balões no ar.
          delay: -random(0, duration),
          sway: random(15, 40) * (Math.random() < 0.5 ? -1 : 1),
        };
      }),
    );
  }
}
