import { formatDecimal, getOrdinalSuffix } from './utils';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('utils tests', () => {
  describe('formatDecimal method test', () => {
    test('formatDecimal returns 1.05 when we pass "1.05"', () => {
      expect(formatDecimal('1.05')).toBe(1.05);
    });

    test('formatDecimal returns 1 when we pass "1.00"', () => {
      expect(formatDecimal('1.00')).toBe(1);
    });
  });

  describe('getOrdinalSuffix method test', () => {
    test('getOrdinalSuffix returns "0" when we pass 0', () => {
      expect(getOrdinalSuffix(0)).toBe('0');
    });

    test('getOrdinalSuffix returns ST when we pass 1', () => {
      expect(getOrdinalSuffix(1)).toBe('st');
    });

    test('getOrdinalSuffix returns ND when we pass 2', () => {
      expect(getOrdinalSuffix(2)).toBe('nd');
    });

    test('getOrdinalSuffix returns RD when we pass 3', () => {
      expect(getOrdinalSuffix(3)).toBe('rd');
    });

    test('getOrdinalSuffix returns TH when we pass 4', () => {
      expect(getOrdinalSuffix(4)).toBe('th');
    });

    test('getOrdinalSuffix returns TH when we pass 11', () => {
      expect(getOrdinalSuffix(11)).toBe('th');
    });

    test('getOrdinalSuffix returns TH when we pass 12', () => {
      expect(getOrdinalSuffix(12)).toBe('th');
    });

    test('getOrdinalSuffix returns TH when we pass 13', () => {
      expect(getOrdinalSuffix(13)).toBe('th');
    });
  });
});
