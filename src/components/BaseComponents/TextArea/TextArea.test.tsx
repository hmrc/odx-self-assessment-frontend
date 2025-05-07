/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import TextArea from './TextArea';
// Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
// unmount and cleanup DOM after the test is finished.

afterEach(cleanup);

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({ getSdkConfig: jest.fn() }));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key
  })
}));

/**
 * SNAPHOTS
 */

describe('TextArea Component Snapshot', () => {
  const defaultProps = {
    name: 'test-textarea',
    id: 'test-textarea-id',
    inputProps: { value: 'Initial value' },
    expectedLength: 100,
    hintText: 'This is a hint',
    errorText: 'This is an error',
    onBlur: jest.fn()
  };

  it('matches the snapshot', () => {
    const { asFragment } = render(<TextArea {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('matches the snapshot when disabled', () => {
    const { asFragment } = render(<TextArea {...defaultProps} disabled />);
    expect(asFragment()).toMatchSnapshot();
  });
});

/**
 * ASSERTIONS
 */

describe('TextArea Component', () => {
  test('renders with hint text', () => {
    render(<TextArea name='test' hintText='This is a hint' />);
    expect(screen.getByText('This is a hint')).toBeInTheDocument();
  });

  test('displays remaining characters', () => {
    render(<TextArea name='test' expectedLength={10} inputProps={{ value: '12345' }} />);
    expect(screen.getByText('YOU_HAVE 5 CHARACTERS REMAINING')).toBeInTheDocument();
  });

  test('displays error message when characters exceed expectedLength', () => {
    render(<TextArea name='test' expectedLength={5} inputProps={{ value: '123456' }} />);
    expect(screen.getByText('YOU_HAVE 1 CHARACTER TOO_MANY')).toBeInTheDocument();
  });

  test('calls onBlur when textarea loses focus', () => {
    const handleBlur = jest.fn();
    render(<TextArea name='test' onBlur={handleBlur} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('renders character count when useCharacterCount is true', () => {
    render(
      <TextArea name='test' expectedLength={10} inputProps={{ value: '12345' }} useCharacterCount />
    );
    expect(screen.getByText('YOU_HAVE 5 CHARACTERS REMAINING')).toBeInTheDocument();
  });

  test('does not render character count when useCharacterCount is false', () => {
    render(
      <TextArea
        name='test'
        expectedLength={10}
        inputProps={{ defaultValue: '12345' }}
        useCharacterCount={false}
      />
    );
    expect(screen.queryByText('YOU_HAVE 5 CHARACTERS_REMAINING')).not.toBeInTheDocument();
  });

  test('adds govuk-character-count class when useCharacterCount is true', () => {
    const { container } = render(<TextArea name='test' useCharacterCount />);
    expect(container.querySelector('.govuk-character-count')).toBeInTheDocument();
  });

  test('does not add govuk-character-count class when useCharacterCount is false', () => {
    const { container } = render(<TextArea name='test' useCharacterCount={false} />);

    expect(container.querySelector('.govuk-character-count')).not.toBeInTheDocument();
  });

  test('adds error class when characters exceed expectedLength and textarea loses focus', () => {
    const { container } = render(
      <TextArea name='test' expectedLength={5} inputProps={{ value: '123456' }} />
    );

    // Simulate blur event
    fireEvent.blur(screen.getByRole('textbox'));

    // Check if the textarea has the error class
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('govuk-textarea--error');
  });
});
