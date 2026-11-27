import {
  DOCUMENT,
  DestroyRef,
  Directive,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { SeasonalOccasion } from '../calendar';
import {
  BurstOrigin,
  SEASONAL_GREETINGS,
  SeasonalGreeting,
  SeasonalGreetingMode,
  SeasonalGreetingText,
} from '../greeting';
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
  /** Ponto de saída (px); sem ele, a revoada sai do balão da saudação. */
  x?: number;
  y?: number;
}

/** Duração da animação .burst (shared/greeting.css), em ms. */
export const BURST_DURATION = 2400;
export const BURST_SIZE = 14;

export function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Para onde cada item da revoada voa. Do balão (canto inferior esquerdo), sobe e se espalha para
 * a direita; de outro ponto (`origin`), se espalha em volta dele, mais para baixo, porque esse
 * ponto costuma ficar no alto da página (ex.: uma busca).
 */
export function burstTarget(origin?: BurstOrigin): { dx: string; dy: string } {
  if (origin) {
    return {
      dx: `${Math.round(random(-40, 40))}vw`,
      dy: `${Math.round(random(-25, 60))}vh`,
    };
  }

  return {
    dx: `${Math.round(random(-5, 85))}vw`,
    dy: `${-Math.round(random(30, 90))}vh`,
  };
}

/**
 * Liga uma decoração ao SeasonalGreeting enquanto ela está na tela. Chame no navegador, quando
 * a data for confirmada.
 */
export function registerGreeting(
  occasion: SeasonalOccasion,
  release: (origin?: BurstOrigin) => void,
  destroyRef: DestroyRef,
  greeting: SeasonalGreeting,
): void {
  destroyRef.onDestroy(greeting.register(occasion, release));
}

/**
 * O que toda decoração faz igual: na data (no navegador, depois da primeira renderização)
 * prepara a cena, mostra, marca o <html> para o acento e registra a saudação no
 * SeasonalGreeting; ao sair da tela, desfaz tudo. O botão da saudação solta uma revoada que
 * some sozinha. Não há opção de fechar.
 */
@Directive()
export abstract class SeasonalDecoration {
  protected abstract readonly occasion: SeasonalOccasion;
  /** Atributo do <html> que troca o acento (ver styles/tokens.css). */
  protected abstract readonly attribute: string;
  protected abstract readonly burstIcons: readonly string[];
  protected abstract isToday(date: Date): boolean;

  /** Onde fica a saudação; ver SeasonalGreetingMode. */
  readonly greeting = input<SeasonalGreetingMode>('floating');

  protected readonly active = signal(false);
  protected readonly burst = signal<BurstItem[]>([]);

  private readonly root = inject(DOCUMENT).documentElement;
  private readonly today = inject(SEASONAL_DATE);
  private nextId = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const greeting = inject(SeasonalGreeting);

    afterNextRender(() => {
      if (!this.isToday(this.today())) {
        return;
      }
      this.prepare();
      this.active.set(true);
      this.root.setAttribute(this.attribute, '');
      registerGreeting(this.occasion, (origin) => this.release(origin), destroyRef, greeting);
    });
    // Ao sair da tela (ex.: uma área do app sem decoração), o acento volta ao normal.
    destroyRef.onDestroy(() => this.root.removeAttribute(this.attribute));
  }

  /** Textos da saudação (mensagem, emoji e ação do botão). */
  protected get text(): SeasonalGreetingText {
    return SEASONAL_GREETINGS[this.occasion];
  }

  /** Monta a cena (posições e ritmos aleatórios) antes de mostrar. */
  protected prepare(): void {
    // Cada decoração sobrescreve se precisar.
  }

  protected newId(): number {
    return this.nextId++;
  }

  protected release(origin?: BurstOrigin): void {
    const novos: BurstItem[] = Array.from({ length: BURST_SIZE }, () => ({
      id: this.newId(),
      icon: pick(this.burstIcons),
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
}
