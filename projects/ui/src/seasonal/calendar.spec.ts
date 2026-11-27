import {
  easterSunday,
  isAniversario,
  isAnoNovo,
  isCarnaval,
  isHalloween,
  isNatal,
  isPascoa,
  seasonalOccasion,
} from './calendar';

describe('easterSunday', () => {
  it.each([
    [2024, 2, 31],
    [2025, 3, 20],
    [2026, 3, 5],
    [2027, 2, 28],
    [2028, 3, 16],
    [2029, 3, 1],
    [2030, 3, 21],
  ])('Páscoa de %i', (year, month, day) => {
    expect(easterSunday(year)).toEqual(new Date(year, month, day));
  });
});

describe('isAnoNovo', () => {
  it('vale de 26/12 a 01/01', () => {
    expect(isAnoNovo(new Date(2026, 11, 25, 23, 59))).toBe(false);
    expect(isAnoNovo(new Date(2026, 11, 26, 0, 0))).toBe(true);
    expect(isAnoNovo(new Date(2026, 11, 31, 23, 59))).toBe(true);
    expect(isAnoNovo(new Date(2027, 0, 1, 23, 59))).toBe(true);
    expect(isAnoNovo(new Date(2027, 0, 2, 0, 0))).toBe(false);
  });
});

describe('isCarnaval', () => {
  it('vale do sábado à terça de Carnaval (2026: 14 a 17/02)', () => {
    expect(isCarnaval(new Date(2026, 1, 13, 23, 59))).toBe(false);
    expect(isCarnaval(new Date(2026, 1, 14, 0, 0))).toBe(true);
    expect(isCarnaval(new Date(2026, 1, 17, 23, 59))).toBe(true);
    expect(isCarnaval(new Date(2026, 1, 18, 0, 0))).toBe(false);
  });

  it('acompanha a data da Páscoa de cada ano (2027: terça em 09/02)', () => {
    expect(isCarnaval(new Date(2027, 1, 9))).toBe(true);
    expect(isCarnaval(new Date(2027, 1, 17))).toBe(false);
  });
});

describe('isPascoa', () => {
  it('vale da Sexta-feira Santa ao domingo (2026: 03 a 05/04)', () => {
    expect(isPascoa(new Date(2026, 3, 2, 23, 59))).toBe(false);
    expect(isPascoa(new Date(2026, 3, 3, 0, 0))).toBe(true);
    expect(isPascoa(new Date(2026, 3, 5, 23, 59))).toBe(true);
    expect(isPascoa(new Date(2026, 3, 6, 0, 0))).toBe(false);
  });
});

describe('isAniversario', () => {
  it('vale só em 01/10', () => {
    expect(isAniversario(new Date(2026, 9, 1, 0, 0))).toBe(true);
    expect(isAniversario(new Date(2026, 9, 1, 23, 59))).toBe(true);
    expect(isAniversario(new Date(2026, 8, 30))).toBe(false);
    expect(isAniversario(new Date(2026, 9, 2))).toBe(false);
  });
});

describe('seasonalOccasion', () => {
  it.each([
    [new Date(2026, 5, 15), null],
    [new Date(2026, 1, 15), 'carnaval'],
    [new Date(2026, 3, 4), 'pascoa'],
    [new Date(2026, 9, 1), 'aniversario'],
    [new Date(2026, 9, 31), 'halloween'],
    [new Date(2026, 11, 10), 'natal'],
    [new Date(2026, 11, 31), 'ano-novo'],
    [new Date(2027, 0, 1), 'ano-novo'],
  ])('%s → %s', (date, occasion) => {
    expect(seasonalOccasion(date)).toBe(occasion);
  });

  it('nunca tem duas ocasiões no mesmo dia, em uma década inteira', () => {
    const checks = [isAnoNovo, isCarnaval, isPascoa, isAniversario, isHalloween, isNatal];
    for (let day = new Date(2026, 0, 1); day.getFullYear() < 2036; day.setDate(day.getDate() + 1)) {
      const date = new Date(day);
      const active = checks.filter((isToday) => isToday(date)).length;
      expect(active, date.toDateString()).toBeLessThanOrEqual(1);
    }
  });
});
