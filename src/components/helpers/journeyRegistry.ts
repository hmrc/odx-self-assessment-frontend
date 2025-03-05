let journeyName = '';

export const setJourneyName = (journeyNameReceived: string) => {
  journeyName = journeyNameReceived;
};

export const getJourneyName = () => {
  return journeyName;
};
