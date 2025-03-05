import React from 'react';
import { PenaltyRowProps } from './PenaltyTypes';
import { useTranslation } from 'react-i18next';
import { formatDecimal, getOrdinalSuffix } from '../../../components/helpers/utils';

const PenaltyRow: React.FC<PenaltyRowProps> = ({ PenaltyNumber, AdditionalInfo, Amount }) => {
  const { t } = useTranslation();

  return (
    <div className='govuk-summary-list__row'>
      <dt className='govuk-summary-list__key govuk-!-width-one-half'>
        <strong>
          {PenaltyNumber}
          {t(getOrdinalSuffix(PenaltyNumber))} {t('PENALTY')}
        </strong>
        <p className='govuk-!-margin-bottom-0 govuk-!-margin-top-1 font-weight-normal'>
          {AdditionalInfo}
        </p>
      </dt>
      <dd className='govuk-summary-list__value govuk-!-text-align-right govuk-!-width-one-quarter'>
        £{formatDecimal(Amount.toFixed(2))}
      </dd>
    </div>
  );
};

export default PenaltyRow;
