import { DOCUMENT, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { SEASONAL_DATE } from '../seasonal-date';

/** Item da revoada solta pelo botão da saudação. */
export interface BurstItem {
  id: number;
  icon: string;
  dx: string;
  dy: string;
  size: number;
  delay: number;
  spin: string;
}

/** Duração da animação .burst (shared/greeting.css), em ms. */
export const BURST_DURATION = 2400;
const BURST_SIZE = 14;

export function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * O que toda decoração faz igual: na data (no navegador, depois da primeira renderização)
 * prepara a cena, mostra e marca o <html> para o acento; ao sair da tela, desmarca; e o botão
 * da saudação solta uma revoada que some sozinha. Não há opção de fechar.
 */
export abstract class SeasonalDecoration {
  /** Atributo do <html> que troca o acento (ver styles/tokens.css). */
  protected abstract readonly attribute: string;
  protected abstract readonly burstIcons: readonly string[];
  protected abstract isToday(date: Date): boolean;

  protected readonly active = signal(false);
  protected readonly burst = signal<BurstItem[]>([]);

  private readonly root = inject(DOCUMENT).documentElement;
  private readonly today = inject(SEASONAL_DATE);
  private nextId = 0;

  constructor() {
    afterNextRender(() => {
      if (!this.isToday(this.today())) {
        return;
      }
      this.prepare();
      this.active.set(true);
      this.root.setAttribute(this.attribute, '');
    });
    // Ao sair da tela (ex.: uma área do app sem decoração), o acento volta ao normal.
    inject(DestroyRef).onDestroy(() => this.root.removeAttribute(this.attribute));
  }

  /** Monta a cena (posições e ritmos aleatórios) antes de mostrar. */
  protected prepare(): void {
    // Cada decoração sobrescreve se precisar.
  }

  protected newId(): number {
    return this.nextId++;
  }

  protected release(): void {
    const novos = Array.from({ length: BURST_SIZE }, () => ({
      id: this.newId(),
      icon: pick(this.burstIcons),
      dx: `${Math.round(random(-5, 85))}vw`,
      dy: `${-Math.round(random(30, 90))}vh`,
      size: Math.round(random(16, 34)),
      delay: Math.round(random(0, 400)),
      spin: `${Math.round(random(-200, 200))}deg`,
    }));
    this.burst.update((atual) => [...atual, ...novos]);
    setTimeout(() => {
      this.burst.update((atual) => atual.filter((item) => !novos.includes(item)));
    }, BURST_DURATION + 400);
  }
}
