import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import AlreadyRegisteredUserMessage from './AlreadyRegisteredUserMessage';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import { mockGetSdkConfigWithBasepath } from '../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

jest.mock('../../components/helpers/utils', () => ({
  getAskHmrcSubLink: jest.fn().mockReturnValue('self-assessment-cessation')
}));

describe('should render AlreadyRegisteredUserMessage component.', () => {
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

  it('should render AlreadyRegisteredUserMessage content in English.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AlreadyRegisteredUserMessage />
        </I18nextProvider>
      );
    });

    expect(
      screen.getByText("You've previously registered for Self Assessment")
      // @ts-ignore
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "It looks like you're already registered for Self Assessment or were registered in the past. This service is in Beta and can't process your request at the moment."
      )
      // @ts-ignore
    ).toBeInTheDocument();
    expect(
      screen.getByText('You can reactivate your online account for Self Assessment.')
      // @ts-ignore
    ).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("You'll need:")).toBeInTheDocument();
    expect(
      screen.getByText('Your Government Gateway user ID and password to sign in')
      // @ts-ignore
    ).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Unique Taxpayer Reference (UTR) number')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('If you cannot us the online form')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('form CWF1')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Send the completed form to:')).toBeInTheDocument();
    expect(
      screen.getByText(/Self Assessment*HM Revenue and Customs*BX9 1AN*United Kingdom/)
      // @ts-ignore
    ).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Unique Taxpayer Reference (UTR) number.')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Get help')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("HMRC's online assistant (opens in a new tab)")).toBeInTheDocument();
  });

  it('should render AlreadyRegisteredUserMessage content in Welsh.', async () => {
    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AlreadyRegisteredUserMessage />
        </I18nextProvider>
      );
    });

    expect(
      screen.getByText('Rydych wedi cofrestru ar gyfer Hunanasesiad yn flaenorol')
      // @ts-ignore
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Mae’n debyg eich bod eisoes wedi cofrestru ar gyfer Hunanasesiad, neu eich bod wedi cofrestru yn y gorffennol. Gwasanaeth Beta yw hwn ac felly nid oes modd prosesu’ch cais ar hyn o bryd.'
      ) // @ts-ignore
    ).toBeInTheDocument();
    expect(
      screen.getByText('Gallwch ailactifadu’ch cyfrif ar-lein ar gyfer Hunanasesiad.')
      // @ts-ignore
    ).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Bydd angen y canlynol arnoch:')).toBeInTheDocument();
    expect(
      screen.getByText('Eich Dynodydd Defnyddiwr (ID) a’ch cyfrinair ar gyfer Porth y Llywodraeth')
      // @ts-ignore
    ).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Cyfeirnod Unigryw y Trethdalwr (UTR)')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Os na allwch ddefnyddio’r ffurflen ar-lein')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('ffurflen CWF1')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Anfonwch y ffurflen wedi’i llenwi i:')).toBeInTheDocument();
    expect(
      screen.getByText(/Hunanasesiad*Gwasanaeth Cwsmeriaid Cymraeg CThEF*BX9 1ST*Y Deyrnas Unedig/)
      // @ts-ignore
    ).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Cyfeirnod Unigryw y Trethdalwr (UTR) arnoch.')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('Help')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('gynorthwyydd ar-lein CThEF (yn agor tab newydd)')).toBeInTheDocument();
  });

  it('should navigate to appropriate HMRC online assistent page when link is clicked.', async () => {
    await act(async () => {
      render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AlreadyRegisteredUserMessage />
        </I18nextProvider>
      );
    });

    expect(
      screen.getByRole('link', {
        name: 'Unique Taxpayer Reference (UTR) number (opens in new tab)'
      })
      // @ts-ignore
    ).toHaveAttribute('href', 'https://www.gov.uk/find-lost-utr-number');
    // @ts-ignore
    expect(screen.getByRole('link', { name: 'form CWF1 (opens in new tab)' })).toHaveAttribute(
      'href',
      'https://public-online.hmrc.gov.uk/lc/content/xfaforms/profiles/forms.html?contentRoot=repository:///Applications/NICs_iForms/1.0&template=CWF1_en_1.0.xdp'
    );

    expect(
      screen.getByRole('link', {
        name: 'Unique Taxpayer Reference (UTR) number. (opens in new tab)'
      }) // @ts-ignore
    ).toHaveAttribute('href', 'https://www.gov.uk/find-lost-utr-number');

    expect(
      screen.getByRole('link', {
        name: "HMRC's online assistant (opens in a new tab)"
      }) // @ts-ignore
    ).toHaveAttribute(
      'href',
      'https://test-www.tax.service.gov.uk/ask-hmrc/chat/self-assessment-cessation'
    );
  });
});
