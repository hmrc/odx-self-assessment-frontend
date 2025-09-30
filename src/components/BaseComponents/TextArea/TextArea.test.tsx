/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextArea from './TextArea';
// Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
// unmount and cleanup DOM after the test is finished.

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({ getSdkConfig: jest.fn() }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

const baseProps = {
  name: 'test-area',
  fieldId: 'test-area-id',
  rows: 4,
  inputProps: { value: 'Hello', onChange: jest.fn() },
  expectedLength: 10,
  useCharacterCount: true,
  hintText: 'This is a hint',
  errorText: '',
  disabled: false,
  label: 'Test Label'
};

/**
 * SNAPHOTS
 */
describe('TextArea Snapshot', () => {
  it('matches snapshot in default state', () => {
    const { asFragment } = render(<TextArea {...baseProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { asFragment } = render(<TextArea {...baseProps} disabled />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with error text', () => {
    const props = { ...baseProps, errorText: 'This is an error' };
    const { asFragment } = render(<TextArea {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
/**
 * ASSERTIONS
 */
describe('TextArea Component', () => {
  it('renders textarea with value', () => {
    render(<TextArea {...baseProps} />);
    expect(screen.getByRole('textbox')).toHaveValue('Hello');
  });

  it('renders hint text', () => {
    render(<TextArea {...baseProps} />);
    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  it('renders character count message', () => {
    render(<TextArea {...baseProps} />);
    expect(screen.getByText('YOU_HAVE 5 CHARACTERS REMAINING')).toBeInTheDocument();
  });

  it('shows error class when characters exceed expectedLength', () => {
    const props = {
      ...baseProps,
      inputProps: { value: 'This is too long' }
    };
    const { container } = render(<TextArea {...props} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('govuk-textarea--error');
    expect(screen.getByText('YOU_HAVE 6 CHARACTERS TOO_MANY')).toBeInTheDocument();
  });

  it('renders read-only view when disabled', () => {
    const props = { ...baseProps, disabled: true };
    render(<TextArea {...props} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('adds aria-describedby when hint or error is present', () => {
    render(<TextArea {...baseProps} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby');
  });
});
