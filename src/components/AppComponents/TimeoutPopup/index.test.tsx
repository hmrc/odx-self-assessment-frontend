import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeoutPopup from '.';
import { act } from 'react-dom/test-utils';

// Mock translation hook for translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mocking 'focus-trap-react' from modal tsx
jest.mock('focus-trap-react', () => {
  return ({ children }) => <div> {children}</div>;
});

describe('TimeoutPopup', () => {
  const defaultProps: React.ComponentProps<typeof TimeoutPopup> = {
    show: true,
    millisecondsTillSignout: 120000, // 2 minutes in milliseconds
    staySignedinHandler: jest.fn(),
    signoutHandler: jest.fn(),
    autoSignoutHandler: jest.fn(),
    isAuthorised: true,
    staySignedInButtonText: 'STAY_SIGNED_IN',
    signoutButtonText: 'SIGNOUT',
    children: null as ReactNode
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders if show is true', () => {
    render(<TimeoutPopup {...defaultProps} />);
    // @ts-ignore
    expect(screen.getByText('YOURE_ABOUT_TO_BE_SIGNED_OUT')).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText('STAY_SIGNED_IN')).toBeInTheDocument();
  });

  it('does not render if show is false', () => {
    render(<TimeoutPopup {...defaultProps} show={false} />);
    // @ts-ignore
    expect(screen.queryByText('YOURE_ABOUT_TO_BE_SIGNED_OUT')).not.toBeInTheDocument();
  });

  it('STAY_SIGNED_IN button click', () => {
    render(<TimeoutPopup {...defaultProps} />);

    fireEvent.click(screen.getByText('STAY_SIGNED_IN'));
    expect(defaultProps.staySignedinHandler).toHaveBeenCalled();
  });

  it('starts countdown when show is true and millisecondsTillSignout has elapsed', async () => {
    jest.useFakeTimers();
    render(<TimeoutPopup {...defaultProps} />);
    // @ts-ignore
    await screen.findByText('2_MINUTES.');

    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute to start countdown
    });
    await waitFor(() => {
      // @ts-ignore
      expect(screen.getByText('1_MINUTE.')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  // eslint-disable-next-line jest/expect-expect
  it('updates countdown display text every second after countdown starts', async () => {
    jest.useFakeTimers();
    render(<TimeoutPopup {...defaultProps} />);
    // @ts-ignore
    await screen.findByText('2_MINUTES.');

    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute to start countdown
    });
    // @ts-ignore
    await screen.findByText('1_MINUTE.');

    act(() => {
      jest.advanceTimersByTime(1000); // 1 second
    });
    // @ts-ignore
    await screen.findByText('59 SECONDS.');

    jest.useRealTimers();
  });

  it(`if 'Escape' is pressed`, () => {
    render(<TimeoutPopup {...defaultProps} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.staySignedinHandler).toHaveBeenCalled();
  });

  it('if children is present', () => {
    const dummyChildren = <div>Children</div>;
    render(<TimeoutPopup {...defaultProps}>{dummyChildren}</TimeoutPopup>);
    // @ts-ignore
    expect(screen.getByText('Children')).toBeInTheDocument();
  });
});
