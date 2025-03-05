import React from 'react';
import AppFooter from '.';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
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

    expect(component.getByText('Cookies')).toBeInTheDocument();
    expect(component.getByText('Accessibility statement')).toBeInTheDocument();
    expect(component.getByText('Privacy policy')).toBeInTheDocument();
    expect(component.getByText('Terms and conditions')).toBeInTheDocument();
    expect(component.getByText('Help using GOV.UK')).toBeInTheDocument();
    expect(component.getByText('Contact')).toBeInTheDocument();
    expect(component.getByText('Rhestr o Wasanaethau Cymraeg')).toBeInTheDocument();
    expect(component.getByText('Open Government Licence v3.0')).toBeInTheDocument();
    expect(component.getByText('© Crown copyright')).toBeInTheDocument();
  });

  it('should render the footer links with appropriate text in welsh.', () => {
    act(() => {
      t.result.current.i18n.changeLanguage('cy');
    });

    const component = render(
      <I18nextProvider i18n={t.result.current.i18n}>
        <MemoryRouter initialEntries={[{ pathname: '/appeal-a-self-assessment-penalty' }]}>
          <Route path='/appeal-a-self-assessment-penalty'>
            <AppFooter baseurl='' />
          </Route>
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(component.getByText('Cwcis')).toBeInTheDocument();
    expect(component.getByText('Datganiad hygyrchedd')).toBeInTheDocument();
    expect(component.getByText('Polisi preifatrwydd')).toBeInTheDocument();
    expect(component.getByText('Telerau ac amodau')).toBeInTheDocument();
    expect(component.getByText('Help wrth ddefnyddio GOV.UK')).toBeInTheDocument();
    expect(component.getByText('Cysylltu')).toBeInTheDocument();
    expect(component.getByText('Rhestr o Wasanaethau Cymraeg')).toBeInTheDocument();
    expect(component.getByText('Drwydded Llywodraeth Agored, fersiwn 3.0')).toBeInTheDocument();
    expect(component.getByText('© Hawlfraint y Goron')).toBeInTheDocument();
  });

  it('should navigate to appropriate footer links when specific link is clicked.', () => {
    render(
      <I18nextProvider i18n={t.result.current.i18n}>
        <MemoryRouter initialEntries={[{ pathname: '/appeal-a-self-assessment-penalty' }]}>
          <Route path='/appeal-a-self-assessment-penalty'>
            <AppFooter baseurl='' />
          </Route>
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(screen.getByRole('link', { name: 'Cookies (opens in new tab)' })).toHaveAttribute(
      'href',
      'appeal-a-self-assessment-penalty-cookies'
    );
    expect(
      screen.getByRole('link', { name: 'Accessibility statement (opens in new tab)' })
    ).toHaveAttribute('href', 'appeal-a-self-assessment-penalty-accessibility');
    expect(screen.getByRole('link', { name: 'Privacy policy (opens in new tab)' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/publications/data-protection-act-dpa-information-hm-revenue-and-customs-hold-about-you'
    );
    expect(
      screen.getByRole('link', { name: 'Terms and conditions (opens in new tab)' })
    ).toHaveAttribute('href', 'https://www.tax.service.gov.uk/help/terms-and-conditions');
    expect(
      screen.getByRole('link', { name: 'Help using GOV.UK (opens in new tab)' })
    ).toHaveAttribute('href', 'https://www.gov.uk/help');
    expect(screen.getByRole('link', { name: 'Contact (opens in new tab)' })).toHaveAttribute(
      'href',
      'https://www.gov.uk/government/organisations/hm-revenue-customs/contact'
    );
    expect(
      screen.getByRole('link', { name: 'Rhestr o Wasanaethau Cymraeg (opens in new tab)' })
    ).toHaveAttribute('href', 'https://www.gov.uk/cymraeg');
    expect(screen.getByRole('link', { name: 'Open Government Licence v3.0' })).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
    );
    expect(screen.getByRole('link', { name: '© Crown copyright' })).toHaveAttribute(
      'href',
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
    );
  });
});
