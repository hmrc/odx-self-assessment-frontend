export interface PenaltyRowProps {
  PenaltyNumber: number;
  AdditionalInfo: string;
  Amount: number;
}

export interface PenaltySection {
  penaltyType: string;
  results: Array<PenaltyRowProps>;
  totalAmount: number;
}

export interface PenaltyDuration {
  duration: string;
  penalties: Array<PenaltySection>;
}

export interface PenaltyDataProps {
  resultCount: number;
  Language: string;
  penaltyData: Array<PenaltyDuration>;
}

export interface Content {
  data: [
    {
      LocalisedContent: Array<PenaltyDataProps>;
    }
  ];
}
