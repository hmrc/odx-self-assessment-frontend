import React from 'react';
import AskHMRC from '.';
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
  getAskHmrcSubLink: jest.fn().mockReturnValue('self-assessment-cessation')
}));

describe('should render component AskHMRC.', () => {
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

  it('should render AskHMRC content in English.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AskHMRC />
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(screen.getByText('Get help')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("HMRC's online assistant (opens in a new tab)")).toBeInTheDocument();
  });

  it('should render AskHMRC content in Welsh.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');

      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AskHMRC />
        </I18nextProvider>
      );
    });

    expect(screen.getByText('Cael help')).toBeInTheDocument();
    expect(screen.getByText('gynorthwyydd ar-lein CThEF (yn agor tab newydd)')).toBeInTheDocument();
  });

  it('should navigate to appropriate HMRC online assistent page when link is clicked.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AskHMRC />
        </I18nextProvider>
      );
    });
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: "HMRC's online assistant (opens in a new tab)" })
    ).toHaveAttribute(
      'href',
      'https://test-www.tax.service.gov.uk/ask-hmrc/chat/self-assessment-cessation'
    );
  });
});
