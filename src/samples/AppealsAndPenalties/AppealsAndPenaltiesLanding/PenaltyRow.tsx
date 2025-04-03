import React from 'react';
import { PenaltyRowProps } from './PenaltyTypes';
import { getOrdinalSuffix, getCurrentLanguage } from '../../../components/helpers/utils';
import { useTranslation } from 'react-i18next';

const PenaltyRow: React.FC<PenaltyRowProps> = ({ PenaltyNumber, AdditionalInfo, Amount }) => {
  const { t } = useTranslation();
  const getPenaltyNumberHeading = () => {
    const currentLang = getCurrentLanguage();
    if (currentLang === 'cy') {
      return `${t('PENALTY')} ${PenaltyNumber}`;
    } else {
      return `${PenaltyNumber}${getOrdinalSuffix(PenaltyNumber)} ${t('PENALTY')}`;
    }
  };

  return (
    <div className='govuk-summary-list__row'>
      <dt className='govuk-summary-list__key govuk-!-width-one-half'>
        <strong>{getPenaltyNumberHeading()}</strong>
        <p className='govuk-!-margin-bottom-0 govuk-!-margin-top-1 font-weight-normal'>
          {AdditionalInfo}
        </p>
      </dt>
      <dd className='govuk-summary-list__value govuk-!-text-align-right govuk-!-width-one-quarter'>
        £{Amount.toFixed(2)}
      </dd>
    </div>
  );
};

export default PenaltyRow;
