import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import AskHMRC from '../../components/AppComponents/AskHMRC';

const RegistrationAgeRestrictionInfo = () => {
  const { t } = useTranslation();
  const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';

  useEffect(() => {
    setPageTitle();
  }, [lang]);

  return (
    <>
      <MainWrapper showPageNotWorkingLink={false}>
        <h1 className='govuk-heading-l'>{t('CALL_HMRC_TO_REGISTER_FOR_SELF_ASSESSMENT')}</h1>
        <div className='govuk-body'>
          <p className='govuk-body'>{t('YOU_NEED_TO_BE_OLDER_THAN_15_YEARS_AND_9_MONTHS')}</p>
          <p className='govuk-body'>{t('IF_YOU_NEED_TO_REGISTER_CALL_HMRC')}</p>
        </div>
        <AskHMRC />
      </MainWrapper>
    </>
  );
};

export default RegistrationAgeRestrictionInfo;
