import { formatDecimal, getOrdinalSuffix, triggerLogout } from './utils';
import { setJourneyName } from './journeyRegistry';
import { mockGetSdkConfigWithBasepath } from '../../../tests/mocks/getSdkConfigMock';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import { act } from 'react-dom/test-utils';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn(),
  logout: jest.fn().mockResolvedValue({})
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

  describe('triggerLogout method test', () => {
    setJourneyName('Cessation');
    mockGetSdkConfigWithBasepath();

    (window as any).PCore = {
      getContainerUtils: jest.fn(() => ({
        getActiveContainerItemContext: jest.fn(),
        closeContainerItem: jest.fn(),
        getDataPageUtils: jest.fn()
      })),
      getDataPageUtils: jest.fn(() => ({
        getPageDataAsync: jest.fn().mockResolvedValue({ URLResourcePath2: '#' })
      }))
    };
    const setIsLogout = jest.fn();

    test('triggerLogout method internally call pcore methods', async () => {
      await act(async () => {
        triggerLogout(setIsLogout);
      });
      expect(setIsLogout).toHaveBeenCalled();
      expect(PCore.getContainerUtils).toHaveBeenCalled();
      expect(PCore.getDataPageUtils).toHaveBeenCalled();
      expect(getSdkConfig).toHaveBeenCalled();
    });
  });
});
