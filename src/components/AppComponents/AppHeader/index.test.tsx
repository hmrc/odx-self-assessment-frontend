import React from 'react';
import AppHeader from '.';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
import { I18nextProvider, useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../helpers/hooks/HMRCExternalLinks';
import { act } from 'react-dom/test-utils';
import { mockGetSdkConfigWithBasepath } from '../../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
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

  it('should render the header content with appropriate text in English.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AppHeader
            handleSignout={() => {}}
            appname='Appeal a Self Assessment penalty'
            hasLanguageToggle={false}
            languageToggleCallback={() => {}}
          />
        </I18nextProvider>
      );
    });

    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByText('Appeal a Self Assessment penalty')).toBeInTheDocument();
    expect(screen.getByText('GOV.UK')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('feedback')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.getByTitle('GOV.UK')).toBeInTheDocument();
  });

  it('should render the header content with appropriate text in Welsh.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');

      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AppHeader
            handleSignout={() => {}}
            appname='Appeal a Self Assessment penalty'
            hasLanguageToggle={false}
            languageToggleCallback={() => {}}
          />
        </I18nextProvider>
      );
    });

    expect(screen.getByText('Ewch yn syth i’r prif gynnwys')).toBeInTheDocument();
    expect(screen.getByText('Appeal a Self Assessment penalty')).toBeInTheDocument();
    expect(screen.getByText('GOV.UK')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('adborth')).toBeInTheDocument();
    expect(screen.getByText('Allgofnodi')).toBeInTheDocument();
    expect(screen.getByTitle('GOV.UK')).toBeInTheDocument();
  });

  it('should navigate to appropriate page when link is clicked.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('en');

      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AppHeader
            handleSignout={() => {}}
            appname='Appeal a Self Assessment penalty'
            hasLanguageToggle={false}
            languageToggleCallback={() => {}}
          />
        </I18nextProvider>
      );
    });

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main-content'
    );

    expect(screen.getByRole('link', { name: 'GOV.UK' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/'
    );

    expect(screen.getByRole('link', { name: 'Sign out' })).toHaveAttribute('href', '#');

    expect(screen.getByRole('link', { name: 'feedback (opens in new tab)' })).toHaveAttribute(
      'href',
      'https://www.staging.tax.service.gov.uk/contact/beta-feedback?service=427&referrerUrl=http://localhost/'
    );
  });
});
