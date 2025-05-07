import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import CookiePage from '.';
import { mockGetSdkConfigWithBasepath } from '../../../tests/mocks/getSdkConfigMock';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

describe('should render CookiePage component.', () => {
  let t;
  afterEach(cleanup);

  beforeEach(async () => {
    mockGetSdkConfigWithBasepath();
    t = renderHook(() => useTranslation());

    await act(async () => {
      t.result.current.i18n.changeLanguage('en');
    });
  });

  it('should render CookiePage content in English.', async () => {
    let asFragment;

    await act(async () => {
      const component = render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <CookiePage />
        </I18nextProvider>
      );
      asFragment = component.asFragment;
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render CookiePage content in Welsh.', async () => {
    let asFragment;

    await act(async () => {
      t.result.current.i18n.changeLanguage('cy');

      const component = render(
        <I18nextProvider i18n={t.result.current.i18n}>
          <CookiePage />
        </I18nextProvider>
      );
      asFragment = component.asFragment;
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
