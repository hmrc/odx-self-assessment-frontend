import React from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage } from '../../../components/helpers/utils';

const DurationHeading: React.FC<{ duration: string }> = ({ duration }) => {
  const { t } = useTranslation();

  const getDurationHeading = () => {
    const currentLang = getCurrentLanguage();
    return `${t('PENALTIES_FOR_THE')} ${duration} ${currentLang === 'en' ? t('TAX_YEAR') : ''}`;
  };

  return <h2 className='govuk-heading-m'>{getDurationHeading()}</h2>;
};

export default DurationHeading;
