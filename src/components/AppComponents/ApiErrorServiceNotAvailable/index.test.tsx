import React from 'react';
import ApiServiceNotAvailable from '.';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
// import '@testing-library/jest-dom/extend-expect';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { act } from 'react-dom/test-utils';
import useHMRCExternalLinks from '../../helpers/hooks/HMRCExternalLinks';
import { mockGetSdkConfigWithBasepath } from '../../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

jest.mock('../../helpers/utils', () => ({
  getApiServiceNotAvailableSubLink: jest.fn().mockReturnValue('self-assessment-cessation')
}));

jest.mock('../../helpers/utils', () => ({
  getAskHmrcSubLink: jest.fn().mockReturnValue('self-assessment-cessation')
}));

describe('should render', () => {
  let t;
  afterEach(cleanup);

  beforeEach(async () => {
    t = renderHook(() => useTranslation());
    mockGetSdkConfigWithBasepath();

    const { result } = renderHook(() => useHMRCExternalLinks());

    await act(async () => {
      t.result.current.i18n.changeLanguage('en');
      result.current.referrerURL = 'https://www.staging.tax.service.gov.uk/';
      result.current.hmrcURL = 'https://www.staging.tax.service.gov.uk/';
      result.current.hmrcUrlMigrated = 'https://test-www.tax.service.gov.uk/';
    });
  });

  it('should render ApiServiceNotAvailable content in English.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <ApiServiceNotAvailable />
        </I18nextProvider>
      );
    });

    // @ts-ignore
    expect(screen.getByText('Sorry, this service is unavailable')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('You will be able to use this service later.')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Find out how to', { exact: false })).toBeInTheDocument();
    // @ts-ignore
    expect(
      screen.getByText('if you still need to speak to someone.', { exact: false })
    ).toBeInTheDocument();
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'contact HMRC about Self Assessment (opens in new tab)' })
    ).toBeInTheDocument();
  });

  it('should render ApiServiceNotAvailable content in Welsh.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');

      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <ApiServiceNotAvailable />
        </I18nextProvider>
      );
    });

    // @ts-ignore
    expect(
      screen.getByText('Mae’n ddrwg gennym, ond nid yw’r gwasanaeth hwn ar gael')
    ).toBeInTheDocument();
    // @ts-ignore
    expect(
      screen.getByText('Byddwch yn gallu defnyddio’r gwasanaeth hwn yn nes ymlaen.')
    ).toBeInTheDocument();
    // @ts-ignore
    expect(
      screen.getByText('Os hoffech siarad â rhywun o hyd, dysgwch sut i', { exact: false })
    ).toBeInTheDocument();
    // @ts-ignore
    expect(
      screen.getByText('i gael help gyda Hunanasesiad.', { exact: false })
    ).toBeInTheDocument();
    // @ts-ignore
    expect(
      screen.getByRole('link', {
        name: 'gysylltu â CThEF ynghylch Hunanasesiad. (yn agor tab newydd)'
      })
    ).toBeInTheDocument();
  });

  it('should navigate to appropriate contact HMRC about self assistent page when link is clicked.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <ApiServiceNotAvailable />
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'contact HMRC about Self Assessment (opens in new tab)' })
    ).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/organisations/hm-revenue-customs/contact/self-assessment'
    );
  });
});
