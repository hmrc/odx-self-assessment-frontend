import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import UserPortal from './UserPortal';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import { mockGetSdkConfigWithBasepath } from '../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

jest.mock('../../components/helpers/utils', () => ({
  getAskHmrcSubLink: jest.fn().mockReturnValue('self-assessment-cessation')
}));

describe('should render RegistrationAgeRestrictionInfo component.', () => {
  let t;
  afterEach(cleanup);

  beforeEach(async () => {
    mockGetSdkConfigWithBasepath();
    t = renderHook(() => useTranslation());
    const { result } = renderHook(() => useHMRCExternalLinks());
    await act(async () => {
      t.result.current.i18n.changeLanguage('en');
      result.current.referrerURL = 'https://www.staging.tax.service.gov.uk/';
      result.current.hmrcURL = 'https://www.staging.tax.service.gov.uk/';
      result.current.hmrcUrlMigrated = 'https://test-www.tax.service.gov.uk/';
    });
  });

  it('should render UserPortal without PortalBanner if showPortalBanner is false.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <UserPortal showPortalBanner={false} isLogout={false}>
            <div>
              <p>childern</p>
            </div>
          </UserPortal>
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(screen.getByText('childern')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.queryByText('Important')).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        'We saved your progress and will store your information for 28 days from the registration creation date.'
      ) // @ts-ignore
    ).not.toBeInTheDocument();
  });

  it('should render UserPortal with PortalBanner and content in English if showPortalBanner is true.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <UserPortal showPortalBanner isLogout={false}>
            <div>
              <p>childern</p>
            </div>
          </UserPortal>
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(screen.getByText('childern')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Important');
    expect(
      screen.getByText(
        'We saved your progress and will store your information for 28 days from the registration creation date.'
      ) // @ts-ignore
    ).toBeInTheDocument();
  });

  it('should render UserPortal with PortalBanner and content in Welsh if showPortalBanner is true.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <UserPortal showPortalBanner isLogout={false}>
            <div>
              <p>childern</p>
            </div>
          </UserPortal>
        </I18nextProvider>
      );
    });

    // expect(screen.getByText('childern')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pwysig');
    expect(
      screen.getByText(
        'Gwnaethom gadw’ch cynnydd, a byddwn yn cadw’ch gwybodaeth am 28 diwrnod (o’r dyddiad y crëwyd y cofrestriad).'
      ) // @ts-ignore
    ).toBeInTheDocument();
  });
});
