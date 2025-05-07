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

const responseContentObject = {
  fetchDateTime: '2025-03-18T17:26:45.613Z',
  pxObjClass: 'Pega-API-DataExploration-Data',
  resultCount: 1,
  data: [
    {
      pxObjClass: 'HMRC-SA-Data-Appeal',
      LocalisedContent: [
        {
          pxObjClass: 'HMRC-SA-Data-LocalisedContent',
          Language: 'EN',
          penaltyData: [
            {
              duration: '6 April 2024 to 5 April 2025',
              pxObjClass: 'HMRC-SA-Data-PenaltyData',
              penalties: [
                {
                  pxObjClass: 'HMRC-SA-Data-PenaltyData-Results',
                  totalAmount: 1600.0,
                  penaltyType: 'Late filing penalties',
                  results: [
                    {
                      pxObjClass: 'HMRC-SA-Data-Penalty',
                      AdditionalInfo:
                        'Issued when you missed the deadline for submitting your tax return.',
                      PenaltyNumber: 1,
                      Amount: 100.0,
                      RelevantDueDate: '2024-04-20'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          pxObjClass: 'HMRC-SA-Data-LocalisedContent',
          Language: 'CY',
          penaltyData: [
            {
              duration: '6 Ebrill 2024 i 5 Ebrill 2025',
              pxObjClass: 'HMRC-SA-Data-PenaltyData',
              penalties: [
                {
                  pxObjClass: 'HMRC-SA-Data-PenaltyData-Results',
                  totalAmount: 1600.0,
                  penaltyType: 'Cosbau am gyflwyno’n hwyr',
                  results: [
                    {
                      pxObjClass: 'HMRC-SA-Data-Penalty',
                      AdditionalInfo:
                        'Codwyd pan wnaethoch fethu’r dyddiad cau ar gyfer cyflwyno’ch Ffurflen Dreth.',
                      PenaltyNumber: 1,
                      Amount: 100.0,
                      RelevantDueDate: '2024-04-20'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

describe('AppealsAndPenaltiesLanding Component.', () => {
  let t;
  afterEach(cleanup);
  let mockGetPageDataAsync;

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

    sessionStorage.setItem('rsdk_locale', `en_GB`);
    mockCreateCase.mockResolvedValue({ data: [] });
    mockGetPageDataAsync = jest.fn();
    const mockEventEmitter = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn()
    };

    (window as any).PCore = {
      getDataPageUtils: jest.fn(() => ({
        getDataAsync: mockGetPageDataAsync
      })),
      getPubSubUtils: jest.fn(() => {
        return mockEventEmitter;
      })
    };
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
    // @ts-ignore
    expect(screen.getByRole('main')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Your Self Assessment penalties')).toBeInTheDocument();
  });

  it('renders "no penalties" message in english when no data is fetched', async () => {
    mockCreateCase.mockResolvedValue({ data: [] });

    mockGetPageDataAsync.mockResolvedValue(null);

    await act(async () => {
      t.result.current.i18n.changeLanguage('en');
      render(<AppealsAndPenaltiesLanding {...defaultProps} />);
    });

    await waitFor(() => {
      // @ts-ignore
      expect(screen.getByText('You do not have any Self Assessment penalties')).toBeInTheDocument();
    });
  });

  it('renders "no penalties" message in welsh when no data is fetched', async () => {
    mockCreateCase.mockResolvedValue({ data: [] });

    mockGetPageDataAsync.mockResolvedValue(null);

    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');
      render(<AppealsAndPenaltiesLanding {...defaultProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Nid oes gennych unrhyw gosbau Hunanasesiad')).toBeInTheDocument();
    });
  });

  it('renders dashboard common content in english', async () => {
    sessionStorage.setItem('rsdk_locale', `en_GB`);
    mockGetPageDataAsync.mockResolvedValue(responseContentObject);

    await act(async () => {
      t.result.current.i18n.changeLanguage('en');
      render(<AppealsAndPenaltiesLanding {...defaultProps} />);
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          'Make an appeal if you have received a penalty for filing your tax return or paying your tax bill late.'
        )
      ).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(
        screen.getByText('You can use this service to appeal penalties issued after', {
          exact: false
        })
      ).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(
        screen.getByRole('link', { name: 'use the SA370 form (opens in new tab)' })
      ).toHaveAttribute(
        'href',
        'https://assets.publishing.service.gov.uk/media/657af4f6095987001295e0d7/SA370__Appeal.pdf'
      );
    });
  });

  it('renders dashboard common content in welsh', async () => {
    sessionStorage.setItem('rsdk_locale', `cy_GB`);
    mockGetPageDataAsync.mockResolvedValue(responseContentObject);

    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');
      render(<AppealsAndPenaltiesLanding {...defaultProps} />);
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Gwnewch apêl os ydych wedi cael cosb am gyflwyno neu dalu eich bil treth yn hwyr.'
        )
      ).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(
        screen.getByText(
          'Gallwch ddefnyddio’r gwasanaeth hwn i apelio yn erbyn cosbau a godwyd ar ôl',
          { exact: false }
        )
      ).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(
        screen.getByRole('link', { name: 'defnyddiwch ffurflen SA370. (yn agor tab newydd)' })
      ).toHaveAttribute(
        'href',
        'https://assets.publishing.service.gov.uk/media/657af4f6095987001295e0d7/SA370__Appeal.pdf'
      );
    });
  });
});
