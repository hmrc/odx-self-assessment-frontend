import React from 'react';
import PageNotWorkingProperly from '.';
import { cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react-hooks';
import useHMRCExternalLinks from '../../helpers/hooks/HMRCExternalLinks';
import { mockGetSdkConfigWithBasepath } from '../../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('should render component PageNotWorkingProperly.', () => {
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

  it('should render PageNotWorkingProperly content in English.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <PageNotWorkingProperly />
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(
      screen.getByText('Is this page not working properly? (opens in new tab)')
    ).toBeInTheDocument();
  });

  it('should render PageNotWorkingProperly content in Welsh.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');

      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <PageNotWorkingProperly />
        </I18nextProvider>
      );
    });

    expect(
      screen.getByText('A yw’r dudalen hon yn gweithio’n iawn? (yn agor tab newydd)')
    ).toBeInTheDocument();
  });

  it('should navigate to appropriate path when link is clicked.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <PageNotWorkingProperly />
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'Is this page not working properly? (opens in new tab)' })
    ).toHaveAttribute(
      'href',
      'https://www.staging.tax.service.gov.uk/contact/report-technical-problem?service=427&referrerUrl=http://localhost/'
    );
  });
});
