/**
 * Calendário das datas comemorativas, sempre no fuso de quem visita. Os períodos não se
 * sobrepõem, então no máximo uma ocasião vale por dia.
 */

export type SeasonalOccasion =
  'ano-novo' | 'carnaval' | 'pascoa' | 'aniversario' | 'halloween' | 'natal';

const DAY = 86_400_000;

/** Domingo de Páscoa no calendário gregoriano (algoritmo de Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/** Dias entre a data e o domingo de Páscoa do mesmo ano (negativo antes da Páscoa). */
function daysFromEaster(date: Date): number {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Math.round absorve dias de 23 ou 25 horas, caso o fuso tenha horário de verão.
  return Math.round((day.getTime() - easterSunday(day.getFullYear()).getTime()) / DAY);
}

/** Ano Novo: de 26/12 a 01/01. */
export function isAnoNovo(date = new Date()): boolean {
  return (
    (date.getMonth() === 11 && date.getDate() >= 26) ||
    (date.getMonth() === 0 && date.getDate() === 1)
  );
}

/** Carnaval: do sábado à terça-feira de Carnaval (Páscoa − 50 a − 47 dias). */
export function isCarnaval(date = new Date()): boolean {
  const days = daysFromEaster(date);
  return days >= -50 && days <= -47;
}

/** Páscoa: da Sexta-feira Santa ao domingo de Páscoa. */
export function isPascoa(date = new Date()): boolean {
  const days = daysFromEaster(date);
  return days >= -2 && days <= 0;
}

/** Aniversário do Vinícius: 01/10. */
export function isAniversario(date = new Date()): boolean {
  return date.getMonth() === 9 && date.getDate() === 1;
}

/** Halloween: 31/10. */
export function isHalloween(date = new Date()): boolean {
  return date.getMonth() === 9 && date.getDate() === 31;
}

/** Natal: de 01/12 a 25/12 (depois vem o Ano Novo). */
export function isNatal(date = new Date()): boolean {
  return date.getMonth() === 11 && date.getDate() <= 25;
}

const OCCASIONS: readonly [SeasonalOccasion, (date: Date) => boolean][] = [
  ['ano-novo', isAnoNovo],
  ['carnaval', isCarnaval],
  ['pascoa', isPascoa],
  ['aniversario', isAniversario],
  ['halloween', isHalloween],
  ['natal', isNatal],
];

/** A ocasião do dia, ou null num dia comum. */
export function seasonalOccasion(date = new Date()): SeasonalOccasion | null {
  return OCCASIONS.find(([, isToday]) => isToday(date))?.[0] ?? null;
}
