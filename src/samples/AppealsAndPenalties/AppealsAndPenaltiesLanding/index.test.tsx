import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { mockGetSdkConfigWithBasepath } from '../../../../tests/mocks/getSdkConfigMock';
import useHMRCExternalLinks from '../../../components/helpers/hooks/HMRCExternalLinks';
import AppealsAndPenaltiesLanding from '.';
import C11nEnv from '@pega/pcore-pconnect-typedefs/interpreter/c11n-env';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

const mockCreateCase = jest.fn();
const mockHandleCaseStart = jest.fn();

interface LandingPropsType {
  isLogout: boolean;
  pConn: Partial<C11nEnv>;
  penaltyDataEndpoint: string;
  createCaseEndpoint: string;
  handleCaseStart: () => void;
  penaltyDataEndpointParams: {};
}

const defaultProps: LandingPropsType = {
  isLogout: false,
  pConn: {
    getContextName: () => 'mockContext'
  },
  penaltyDataEndpoint: '/mock/penalty-data-endpoint',
  createCaseEndpoint: '/mock/create-case-endpoint',
  handleCaseStart: mockHandleCaseStart,
  penaltyDataEndpointParams: { LocalisedContent: true }
};

describe('AppealsAndPenaltiesLanding Component.', () => {
  let t;
  afterEach(cleanup);

  beforeEach(async () => {
    mockGetSdkConfigWithBasepath();

    // Mocking PCore
    (window as any).PCore = {
      getMashupApi: () => ({
        createCase: mockCreateCase
      })
    };

    t = renderHook(() => useTranslation());
    const { result } = renderHook(() => useHMRCExternalLinks());
    await act(async () => {
      t.result.current.i18n.changeLanguage('en');
      result.current.referrerURL = 'https://www.staging.tax.service.gov.uk/';
      result.current.hmrcURL = 'https://www.staging.tax.service.gov.uk/';
      result.current.hmrcUrlMigrated = 'https://test-www.tax.service.gov.uk/';
    });

    jest.clearAllMocks();
  });

  it('renders correctly with default props', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          render(
          <AppealsAndPenaltiesLanding {...defaultProps} />
          );
        </I18nextProvider>
      );
    });
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Your Self Assessment penalties')).toBeInTheDocument();
  });

  it('renders "no penalties" message when no data is fetched', async () => {
    mockCreateCase.mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          render(
          <AppealsAndPenaltiesLanding {...defaultProps} />
          );
        </I18nextProvider>
      );
    });
    await waitFor(() => {
      expect(screen.getByText('You do not have any Self Assessment penalties')).toBeInTheDocument();
    });
  });
});
