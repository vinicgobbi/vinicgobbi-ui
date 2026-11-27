import { Injectable, computed, signal } from '@angular/core';
import { SeasonalOccasion } from './calendar';

/**
 * Onde fica a saudação da data:
 * - `floating` (padrão): balão fixo no canto inferior esquerdo, com o botão que solta a revoada;
 * - `none`: sem balão; o app mostra a saudação onde quiser, lendo o SeasonalGreeting (ex.: no
 *   placeholder de uma busca).
 */
export type SeasonalGreetingMode = 'floating' | 'none';

/** Ponto da tela (px, relativo à janela) de onde sai a revoada. */
export interface BurstOrigin {
  x: number;
  y: number;
}

/** Textos da saudação de uma data. */
export interface SeasonalGreetingText {
  /** Ex.: "Feliz Halloween!". */
  message: string;
  /** Emoji do botão que solta a revoada. */
  icon: string;
  /** O que o botão faz, para aria-label e title (ex.: "Soltar morcegos"). */
  action: string;
}

export const SEASONAL_GREETINGS: Readonly<Record<SeasonalOccasion, SeasonalGreetingText>> = {
  'ano-novo': { message: 'Feliz Ano Novo!', icon: '🥂', action: 'Soltar fogos' },
  carnaval: { message: 'Bom Carnaval!', icon: '🎭', action: 'Soltar confete' },
  pascoa: { message: 'Feliz Páscoa!', icon: '🐰', action: 'Soltar ovinhos' },
  aniversario: { message: 'Hoje é meu aniversário!', icon: '🎂', action: 'Soltar balões' },
  halloween: { message: 'Feliz Halloween!', icon: '🎃', action: 'Soltar morcegos' },
  natal: { message: 'Feliz Natal!', icon: '🎁', action: 'Abrir presente' },
};

interface ActiveGreeting {
  occasion: SeasonalOccasion;
  release: (origin?: BurstOrigin) => void;
}

/**
 * A data comemorativa que está na tela, para o app levar a saudação para outro lugar (com
 * `<vg-seasonal greeting="none">`) e soltar a revoada de lá. Fica null fora das datas, no SSR
 * e enquanto as decorações não carregam (ex.: num `@defer`).
 */
@Injectable({ providedIn: 'root' })
export class SeasonalGreeting {
  private readonly current = signal<ActiveGreeting | null>(null);

  readonly occasion = computed(() => this.current()?.occasion ?? null);
  readonly text = computed(() => {
    const occasion = this.occasion();
    return occasion ? SEASONAL_GREETINGS[occasion] : null;
  });

  /** Solta a revoada da data atual; com `origin`, ela sai desse ponto (ex.: um botão). */
  release(origin?: BurstOrigin): void {
    this.current()?.release(origin);
  }

  /**
   * Usado pelas decorações ao aparecer. Devolve a função que desfaz o registro, chamada quando a
   * decoração sai da tela.
   */
  register(occasion: SeasonalOccasion, release: (origin?: BurstOrigin) => void): () => void {
    const entry = { occasion, release };
    this.current.set(entry);

    return () => {
      if (this.current() === entry) {
        this.current.set(null);
      }
    };
  }
}
