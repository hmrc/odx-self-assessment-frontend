import React from 'react';
import { PenaltySection } from './PenaltyTypes';
import { formatDecimal } from '../../../components/helpers/utils';
import PenaltyRow from './PenaltyRow';

const PenaltyCard: React.FC<PenaltySection> = ({ penaltyType, results, totalAmount }) => {
  const hasMultiplePenalties = results.length > 1;

  return (
    <div className='govuk-summary-card'>
      <div className='govuk-summary-card__title-wrapper'>
        <h2 className='govuk-summary-card__title govuk-!-width-one-half'>{penaltyType}</h2>
        {hasMultiplePenalties && (
          <span className='govuk-body govuk-!-text-align-right govuk-!-width-one-quarter'>
            <strong>£{formatDecimal(totalAmount.toFixed(2))}</strong>
          </span>
        )}
      </div>
      <div className='govuk-summary-card__content'>
        <dl className='govuk-summary-list'>
          {results.map(row => (
            <PenaltyRow key={row.PenaltyNumber} {...row} />
          ))}
        </dl>
      </div>
    </div>
  );
};

export default PenaltyCard;
