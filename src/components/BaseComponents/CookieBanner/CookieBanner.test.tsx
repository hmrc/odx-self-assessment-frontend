import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CookieBanner from './CookieBanner';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

const clearCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};

describe('CookieBanner', () => {
  beforeEach(() => {
    clearCookies();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows if no cookie is set', () => {
    render(
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <CookieBanner />
      </BrowserRouter>
    );
    expect(screen.getByRole('region', { name: /Cookies on HMRC Services/i })).toBeInTheDocument();
  });

  test('clicking "Accept analytics cookies" sets the cookie and shows confirmation', () => {
    render(
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <CookieBanner />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/accept analytics cookies/i));

    expect(document.cookie).toMatch(/userConsent=/);

    const region = screen.getByRole('region');
    expect(region).toHaveTextContent(/you've accepted analytics cookies./i);
  });

  test('clicking "Reject analytics cookies" sets the cookie and shows confirmation', () => {
    render(
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <CookieBanner />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/reject analytics cookies/i));

    expect(document.cookie).toMatch(/userConsent=/);

    const region = screen.getByRole('region');
    expect(region).toHaveTextContent(/you've rejected analytics cookies./i);
  });

  test('does not show if cookie already exists', () => {
    const consent = {
      version: '2025.1',
      datetimeSet: new Date().toISOString(),
      preferences: { GA: true }
    };
    document.cookie = `userConsent=${encodeURIComponent(JSON.stringify(consent))}; path=/`;

    render(
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <CookieBanner />
      </BrowserRouter>
    );
    expect(
      screen.queryByRole('dialog', { name: /Cookies on HMRC Services/i })
    ).not.toBeInTheDocument();
  });
});
