export interface PenaltyRowProps {
  PenaltyNumber: number;
  AdditionalInfo: string;
  Amount: number;
}

export interface PenaltySection {
  penaltyType: string;
  results: PenaltyRowProps[];
  totalAmount: number;
}

export interface PenaltyDuration {
  duration: string;
  penalties: PenaltySection[];
}

export interface PenaltyDataProps {
  resultCount: number;
  Language: string;
  penaltyData: PenaltyDuration[] | null;
  InstructionText: string;
}

export interface Content {
  data: [
    {
      pyHTTPResponseCode: number;
      LocalisedContent: PenaltyDataProps[];
    }
  ];
}
