import React from 'react';
import AppFooter from '.';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
// import '@testing-library/jest-dom/extend-expect';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Route } from 'react-router-dom';

describe('should render component AppFooter', () => {
  let t;
  afterEach(cleanup);

  beforeEach(() => {
    t = renderHook(() => useTranslation());

    act(() => {
      t.result.current.i18n.changeLanguage('en');
    });
  });

  it('should render the footer links with appropriate text in English.', () => {
    const component = render(
      <I18nextProvider i18n={t.result.current.i18n}>
        <MemoryRouter initialEntries={[{ pathname: '/appeal-a-self-assessment-penalty' }]}>
          <Route path='/appeal-a-self-assessment-penalty'>
            <AppFooter baseurl='' />
          </Route>
        </MemoryRouter>
      </I18nextProvider>
    );
    // @ts-ignore
    expect(component.getByText('Cookies')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Accessibility statement')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Privacy policy')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Terms and conditions')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Help using GOV.UK')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Contact')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Rhestr o Wasanaethau Cymraeg')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Open Government Licence v3.0')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('© Crown copyright')).toBeInTheDocument();
  });

  it('should render the footer links with appropriate text in welsh.', () => {
    act(() => {
      t.result.current.i18n.changeLanguage('cy');
    });

    const component = render(
      <I18nextProvider i18n={t.result.current.i18n}>
        <MemoryRouter initialEntries={['/appeal-a-self-assessment-penalty']}>
          <AppFooter baseurl='' />
        </MemoryRouter>
      </I18nextProvider>
    );
    // @ts-ignore
    expect(component.getByText('Cwcis')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Datganiad hygyrchedd')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Polisi preifatrwydd')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Telerau ac amodau')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Help wrth ddefnyddio GOV.UK')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Cysylltu')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Rhestr o Wasanaethau Cymraeg')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('Drwydded Llywodraeth Agored, fersiwn 3.0')).toBeInTheDocument();
    // @ts-ignore
    expect(component.getByText('© Hawlfraint y Goron')).toBeInTheDocument();
  });

  it('should navigate to appropriate footer links when specific link is clicked.', () => {
    render(
      <I18nextProvider i18n={t.result.current.i18n}>
        <MemoryRouter initialEntries={['/appeal-a-self-assessment-penalty']}>
          <AppFooter baseurl='' />
        </MemoryRouter>
      </I18nextProvider>
    );
    // @ts-ignore
    expect(screen.getByRole('link', { name: 'Cookies (opens in new tab)' })).toHaveAttribute(
      'href',
      'appeal-a-self-assessment-penalty-cookies'
    );
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'Accessibility statement (opens in new tab)' })
    ).toHaveAttribute('href', 'appeal-a-self-assessment-penalty-accessibility');
    // @ts-ignore
    expect(screen.getByRole('link', { name: 'Privacy policy (opens in new tab)' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/publications/data-protection-act-dpa-information-hm-revenue-and-customs-hold-about-you'
    );
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'Terms and conditions (opens in new tab)' })
    ).toHaveAttribute('href', 'https://www.tax.service.gov.uk/help/terms-and-conditions');
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'Help using GOV.UK (opens in new tab)' })
    ).toHaveAttribute('href', 'https://www.gov.uk/help');
    // @ts-ignore
    expect(screen.getByRole('link', { name: 'Contact (opens in new tab)' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/organisations/hm-revenue-customs/contact'
    );
    // @ts-ignore
    expect(
      screen.getByRole('link', { name: 'Rhestr o Wasanaethau Cymraeg (opens in new tab)' })
    ).toHaveAttribute('href', 'https://www.gov.uk/cymraeg');
    // @ts-ignore
    expect(screen.getByRole('link', { name: 'Open Government Licence v3.0' })).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
    );
    // @ts-ignore
    expect(screen.getByRole('link', { name: '© Crown copyright' })).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
    );
  });
});
