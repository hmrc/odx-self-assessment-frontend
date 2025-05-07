import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessibilityAppealsAndPenalties from '.';

// Mock translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock the custom HMRCExternalLinks hook
jest.mock('../../../components/helpers/hooks/HMRCExternalLinks', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    referrerURL: 'mockReferrer',
    hmrcURL: 'https://mock.hmrc.gov.uk/'
  }))
}));

describe('AccessibilityAppealsAndPenalties', () => {
  test('renders without crashing', () => {
    const { container } = render(<AccessibilityAppealsAndPenalties />);
    // @ts-ignore
    expect(container).toBeInTheDocument();
  });

  test('matches the snapshot', () => {
    const { asFragment } = render(<AccessibilityAppealsAndPenalties />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders the main heading', () => {
    render(<AccessibilityAppealsAndPenalties />);
    // @ts-ignore
    expect(screen.getByText('ACCESSIBLITY_STATEMENT_FOR_APPEAL_SERVICE')).toBeInTheDocument();
  });

  test('renders all section headings', () => {
    render(<AccessibilityAppealsAndPenalties />);
    const headings = [
      'HOW_ACCESSIBLE_THIS_SERVICE_IS',
      'WHAT_TO_DO_IF_YOU_HAVE_DIFFICULTY_USING_THIS',
      'REPORTING_ACCESSIBILITY_PROBLEMS_WITH_THIS_SERVICE',
      'IF_YOU_ARE_NOT_HAPPY',
      'CONTACTING_US_BY',
      'TECHNICAL_INFO_ABOUT_THIS_SERVICE',
      'HOW_WE_TESTED_THIS'
    ];
    headings.forEach(heading => {
      // @ts-ignore
      expect(screen.getByText(heading)).toBeInTheDocument();
    });
  });

  test('ensures all links have target="_blank" and rel="noreferrer noopener"', () => {
    render(<AccessibilityAppealsAndPenalties />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      // @ts-ignore
      expect(link).toHaveAttribute('target', '_blank');
      // @ts-ignore
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    });
  });
});
