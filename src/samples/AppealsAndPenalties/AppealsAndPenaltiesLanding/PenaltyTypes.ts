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

export interface PenaltyData {
  penaltyData: Array<PenaltyDuration>;
}

export interface PenaltyDataProps {
  resultCount: number;
  data: Array<{
    penaltyData: Array<PenaltyDuration>;
  }>;
}
