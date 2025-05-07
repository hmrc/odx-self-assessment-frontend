import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppSelector from '.';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

// Mock components
jest.mock('../Registration/index', () => () => <div>Registration Component</div>);
jest.mock('../Registration/cookiePage/index', () => () => <div>CookiePage Component</div>);
jest.mock('../Registration/AccessibilityPage', () => () => <div>Accessibility Component</div>);
jest.mock('../Cessation/AccessibilityPage', () => () => (
  <div>AccessibilityCessation Component</div>
));
jest.mock('../Cessation', () => () => <div>Cessation Component</div>);
jest.mock('../AppealsAndPenalties', () => () => <div>AppealsAndPenalties Component</div>);
jest.mock('../AppealsAndPenalties/AccessibilityPage', () => () => (
  <div>AccessibilityAppealsAndPenalties Component</div>
));
jest.mock('../../components/HOC/ProtectedRoute', () => ({ component: Component }) => (
  <div>
    ProtectedRoute: <Component />
  </div>
));
jest.mock('../../components/AppComponents/AppWrapper', () => ({ children }) => (
  <div>AppWrapper: {children}</div>
));

// Mock i18n initialization
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(() => Promise.resolve()),
  t: jest.fn(key => key)
}));

describe('AppSelector Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('renders nothing until i18n is loaded', async () => {
    render(
      <MemoryRouter>
        <AppSelector />
      </MemoryRouter>
    );

    expect(screen.queryByText('Registration Component')).toBeNull();

    await waitFor(() => {
      expect(screen.getByText('Registration Component')).toBeInTheDocument();
    });
  });

  test('redirects to /registration by default', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSelector />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Registration Component')).toBeInTheDocument();
    });
  });

  test('renders protected routes with ProtectedRoute wrapper', async () => {
    render(
      <MemoryRouter initialEntries={['/registration']}>
        <AppSelector />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ProtectedRoute:')).toBeInTheDocument();
    });

    expect(screen.getByText('Registration Component')).toBeInTheDocument();
  });

  test('renders public routes with AppWrapper', async () => {
    render(
      <MemoryRouter initialEntries={['/registration-cookies']}>
        <AppSelector />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AppWrapper:')).toBeInTheDocument();
    });

    expect(screen.getByText('CookiePage Component')).toBeInTheDocument();
  });

  test('renders cessation accessibility route', async () => {
    render(
      <MemoryRouter initialEntries={['/cessation-accessibility']}>
        <AppSelector />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AppWrapper:')).toBeInTheDocument();
    });

    expect(screen.getByText('AccessibilityCessation Component')).toBeInTheDocument();
  });

  test('renders appeals and penalties accessibility route', async () => {
    render(
      <MemoryRouter initialEntries={['/appeal-a-self-assessment-penalty-accessibility']}>
        <AppSelector />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('AppWrapper:')).toBeInTheDocument();
    });

    expect(screen.getByText('AccessibilityAppealsAndPenalties Component')).toBeInTheDocument();
  });
});
