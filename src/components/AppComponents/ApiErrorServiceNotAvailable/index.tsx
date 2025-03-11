import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../BaseComponents/MainWrapper';
import setPageTitle from '../../helpers/setPageTitleHelpers';
import AskHMRC from '../../AppComponents/AskHMRC';

export default function ApiServiceNotAvailable() {
  const { t } = useTranslation();
  const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
  useEffect(() => {
    setPageTitle();
  }, [lang]);
  return (
    <MainWrapper>
      <h1 className='govuk-heading-l'>{t('SORRY_SERVICE_NOT_AVAILABLE')}</h1>
      <div className='govuk-body'>
        <p>{t('YOU_WILL_USE_SERVICE_LATER')}</p>
        <p>
          {t('FIND_OUT_HOW_TO')}
          <a
            target='_blank'
            rel='noreferrer noopener'
            href='https://www.gov.uk/government/organisations/hm-revenue-customs/contact/self-assessment'
            className='govuk-link'
          >
            {t('CONTACT_HRMC_ABOUT_SA')}
          </a>
          {t('IF_STILL_NEED_TO_SPEAK')}
        </p>
      </div>
      <AskHMRC />
    </MainWrapper>
  );
}
