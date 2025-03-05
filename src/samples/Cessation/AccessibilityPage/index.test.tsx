import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import AccessibilityCessation from '.';
import useHMRCExternalLinks from '../../../components/helpers/hooks/HMRCExternalLinks';
import { mockGetSdkConfigWithBasepath } from '../../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('should render component AccessibilityCessation.', () => {
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

  it('should render AccessibilityCessation content in English.', async () => {
    let asFragment;

    await act(async () => {
      const component = render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AccessibilityCessation />
        </I18nextProvider>
      );
      asFragment = component.asFragment;
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render AccessibilityCessation content in Welsh.', async () => {
    let asFragment;

    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');

      const component = render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <AccessibilityCessation />
        </I18nextProvider>
      );
      asFragment = component.asFragment;
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
