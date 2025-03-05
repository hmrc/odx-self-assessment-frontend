import React from 'react';
import { useTranslation } from 'react-i18next';
import PenaltyCard from './PenaltyCard';
import DurationHeading from './DurationHeading';

const PenaltyDatails = ({ penaltyData }) => {
  const { t } = useTranslation();

  if (!penaltyData || penaltyData.length === 0) {
    return <p>{t('NO_PENALTIES_AVAILABLE')}</p>;
  }

  return (
    <div>
      {penaltyData.map(({ duration, penalties }) => (
        <div key={duration}>
          <DurationHeading duration={duration} />
          {penalties.map(penaltySection => (
            <PenaltyCard key={penaltySection.penaltyType} {...penaltySection} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PenaltyDatails;
