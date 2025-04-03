import React from 'react';
import { render, screen } from '@testing-library/react';
import PenaltyDatails from './PenaltyDatails';
import { mockGetSdkConfigWithBasepath } from '../../../../tests/mocks/getSdkConfigMock';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

beforeEach(() => {
  mockGetSdkConfigWithBasepath();
  sessionStorage.setItem('rsdk_locale', 'en');
});

const mockPenaltyData = [
  {
    duration: '2022-2023',
    penalties: [
      {
        penaltyType: 'Late filing penalties',
        results: [
          {
            PenaltyNumber: 1,
            AdditionalInfo: 'Additional information 1',
            Amount: 100.5
          },
          {
            PenaltyNumber: 2,
            AdditionalInfo: 'Additional information 2',
            Amount: 200.75
          }
        ],
        totalAmount: 301.25
      }
    ]
  }
];

describe('PenaltyDatails Component', () => {
  test('renders no penalties message when penaltyData is empty', () => {
    render(<PenaltyDatails penaltyData={[]} />);
    expect(screen.getByText('NO_PENALTIES_AVAILABLE')).toBeInTheDocument();
  });

  test('renders no penalties message when penaltyData is NULL', () => {
    render(<PenaltyDatails penaltyData={null} />);
    expect(screen.getByText('NO_PENALTIES_AVAILABLE')).toBeInTheDocument();
  });

  test('renders duration heading for penalties', () => {
    render(<PenaltyDatails penaltyData={mockPenaltyData} />);
    expect(screen.getByText('PENALTIES_FOR_THE 2022-2023 TAX_YEAR')).toBeInTheDocument();
  });

  test('renders duration heading without "tax year" content at the end in case of Welsh', () => {
    sessionStorage.setItem('rsdk_locale', 'cy');
    render(<PenaltyDatails penaltyData={mockPenaltyData} />);
    expect(screen.getByText('PENALTIES_FOR_THE 2022-2023')).toBeInTheDocument();
    sessionStorage.setItem('rsdk_locale', 'en');
  });

  test('renders penalty cards with correct details', () => {
    render(<PenaltyDatails penaltyData={mockPenaltyData} />);

    // Verify penalty type
    expect(screen.getByText('Late filing penalties')).toBeInTheDocument();

    // Verify penalty rows
    expect(screen.getByText('1st PENALTY')).toBeInTheDocument();
    expect(screen.getByText('Additional information 1')).toBeInTheDocument();
    expect(screen.getByText('£100.50')).toBeInTheDocument();

    expect(screen.getByText('2nd PENALTY')).toBeInTheDocument();
    expect(screen.getByText('Additional information 2')).toBeInTheDocument();
    expect(screen.getByText('£200.75')).toBeInTheDocument();

    // Verify total amount
    expect(screen.getByText('£301.25')).toBeInTheDocument();
  });

  test('renders multiple penalties if present', () => {
    const multiplePenaltiesData = [
      {
        duration: '2022-2023',
        penalties: [
          {
            penaltyType: 'Late filing penalties',
            results: [
              { PenaltyNumber: 1, AdditionalInfo: 'Missed deadline by 10 days', Amount: 150 }
            ],
            totalAmount: 150
          },
          {
            penaltyType: 'Late payment',
            results: [
              { PenaltyNumber: 1, AdditionalInfo: 'Payment delayed by 5 days', Amount: 50 }
            ],
            totalAmount: 50
          }
        ]
      }
    ];

    render(<PenaltyDatails penaltyData={multiplePenaltiesData} />);

    expect(screen.getByText('Late filing penalties')).toBeInTheDocument();
    expect(screen.getByText('Late payment')).toBeInTheDocument();
  });
});

describe('PenaltyDatails Component - Negative  Cases', () => {
  test('renders no penalties available message when penaltyData is undefined', () => {
    render(<PenaltyDatails penaltyData={undefined} />);
    expect(screen.getByText('NO_PENALTIES_AVAILABLE')).toBeInTheDocument();
  });

  test('handles penaltyData with empty penalties array', () => {
    const emptyPenaltiesData = [{ duration: '2022-2023', penalties: [] }];
    render(<PenaltyDatails penaltyData={emptyPenaltiesData} />);
    expect(screen.getByText('PENALTIES_FOR_THE 2022-2023 TAX_YEAR')).toBeInTheDocument();
    expect(screen.queryByText('PENALTY')).not.toBeInTheDocument();
  });

  test('handles penalties with 0 amount', () => {
    const zeroAmountPenaltyData = [
      {
        duration: '2022-2023',
        penalties: [
          {
            penaltyType: 'Late payment',
            results: [
              {
                PenaltyNumber: 1,
                AdditionalInfo: 'Issued 30 days after the payment deadline: 5% of tax owed',
                Amount: 0
              }
            ],
            totalAmount: 0
          }
        ]
      }
    ];
    render(<PenaltyDatails penaltyData={zeroAmountPenaltyData} />);
    expect(screen.getByText('Late payment')).toBeInTheDocument();
    expect(screen.getByText('1st PENALTY')).toBeInTheDocument();
    expect(
      screen.getByText('Issued 30 days after the payment deadline: 5% of tax owed')
    ).toBeInTheDocument();
    expect(screen.getByText('£0.00')).toBeInTheDocument();
  });

  test('renders multiple durations correctly', () => {
    const multipleDurationsData = [
      {
        duration: '2022-2023',
        penalties: [
          {
            penaltyType: 'Late filing penalties',
            results: [{ PenaltyNumber: 1, AdditionalInfo: 'Missed deadline', Amount: 100 }],
            totalAmount: 100
          }
        ]
      },
      {
        duration: '2021-2022',
        penalties: [
          {
            penaltyType: 'Late payment',
            results: [{ PenaltyNumber: 1, AdditionalInfo: 'Late payment', Amount: 50 }],
            totalAmount: 50
          }
        ]
      }
    ];
    render(<PenaltyDatails penaltyData={multipleDurationsData} />);
    expect(screen.getByText('PENALTIES_FOR_THE 2022-2023 TAX_YEAR')).toBeInTheDocument();
    expect(screen.getByText('PENALTIES_FOR_THE 2021-2022 TAX_YEAR')).toBeInTheDocument();
  });

  test('handles penalties with large amounts correctly', () => {
    const largeAmountPenaltyData = [
      {
        duration: '2022-2023',
        penalties: [
          {
            penaltyType: 'Late filing penalties penalties',
            results: [{ PenaltyNumber: 1, AdditionalInfo: 'Additional Info1', Amount: 1000.55 }],
            totalAmount: 1000.55
          }
        ]
      }
    ];
    render(<PenaltyDatails penaltyData={largeAmountPenaltyData} />);
    expect(screen.getByText('Late filing penalties penalties')).toBeInTheDocument();
    expect(screen.getByText('£1000.55')).toBeInTheDocument();
  });

  test('renders penaltyData with only a single penalty section', () => {
    const singlePenaltyData = [
      {
        duration: '2022-2023',
        penalties: [
          {
            penaltyType: 'Late filing penalties',
            results: [
              {
                PenaltyNumber: 1,
                AdditionalInfo:
                  'Issued when you missed the deadline for submitting your tax return.',
                Amount: 50.5
              }
            ],
            totalAmount: 50.5
          }
        ]
      }
    ];
    render(<PenaltyDatails penaltyData={singlePenaltyData} />);
    expect(screen.getByText('Late filing penalties')).toBeInTheDocument();
    expect(screen.getByText('1st PENALTY')).toBeInTheDocument();
    expect(
      screen.getByText('Issued when you missed the deadline for submitting your tax return.')
    ).toBeInTheDocument();
    expect(screen.getByText('£50.50')).toBeInTheDocument();
  });
});
