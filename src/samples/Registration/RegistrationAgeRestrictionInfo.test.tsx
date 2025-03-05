import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import RegistrationAgeRestrictionInfo from './RegistrationAgeRestrictionInfo';
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

  it('should render RegistrationAgeRestrictionInfo content in English.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <RegistrationAgeRestrictionInfo />
        </I18nextProvider>
      );
    });

    expect(screen.getByText('Call HMRC to register for Self Assessment')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You need to be older than 15 years and 9 months to register for Self Assessment online.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('If you need to register, call HMRC.')).toBeInTheDocument();
    expect(screen.getByText('Get help')).toBeInTheDocument();
    expect(screen.getByText("HMRC's online assistant (opens in a new tab)")).toBeInTheDocument();
  });

  it('should render RegistrationAgeRestrictionInfo content in Welsh.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <RegistrationAgeRestrictionInfo />
        </I18nextProvider>
      );
    });

    expect(
      screen.getByText('Ffoniwch CThEF i gofrestru ar gyfer Hunanasesiad')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Mae angen i chi fod yn hŷn na 15 mlynedd a 9 mis oed i gofrestru ar gyfer Hunanasesiad ar-lein.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Os bydd angen i chi gofrestru, ffoniwch CThEF.')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('gynorthwyydd ar-lein CThEF (yn agor tab newydd)')).toBeInTheDocument();
  });

  it('should navigate to appropriate HMRC online assistent page when link is clicked.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <RegistrationAgeRestrictionInfo />
        </I18nextProvider>
      );
    });

    expect(
      screen.getByRole('link', { name: "HMRC's online assistant (opens in a new tab)" })
    ).toHaveAttribute(
      'href',
      'https://test-www.tax.service.gov.uk/ask-hmrc/chat/self-assessment-cessation'
    );
  });
});
