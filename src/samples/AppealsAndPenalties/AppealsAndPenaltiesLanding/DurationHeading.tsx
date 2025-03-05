import React from 'react';
import { useTranslation } from 'react-i18next';

const DurationHeading: React.FC<{ duration: string }> = ({ duration }) => {
  const { t } = useTranslation();
  return (
    <h2 className='govuk-heading-m'>
      {t('PENALTIES_FOR_THE')} {duration} {t('TAX_YEAR')}
    </h2>
  );
};

export default DurationHeading;
