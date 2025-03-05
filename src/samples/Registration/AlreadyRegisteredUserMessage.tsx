import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import AskHMRC from '../../components/AppComponents/AskHMRC';

const AlreadyRegisteredUserMessage = () => {
  const { t } = useTranslation();
  const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';

  useEffect(() => {
    setPageTitle();
  }, [lang]);

  return (
    <>
      <MainWrapper showPageNotWorkingLink={false}>
        <h1 className='govuk-heading-l'>
          {t('YOU_HAVE_PREVIOUSLY_REGISTERED_FOR_SELF_ASSESSMENT')}
        </h1>
        <div className='govuk-body'>
          <p className='govuk-body'>{t('IT_LOOKS_LIKE_YOU_ARE_ALREADY_REGISTERED')}</p>
          <p className='govuk-body'>{t('YOU_CAN_REACTIVATE_YOUR_ONLINE_ACCOUNT')}</p>
          <p className='govuk-body'>{t('YOU_WILL_NEED')}</p>
          <p className='govuk-body'>
            {t('YOUR_GOVERNMENT_GATEWAY_USER_ID_AND_PASSWORD_TO_SIGN_IN')}
          </p>
          <p className='govuk-body'>
            {t('YOUR')}
            <a
              href='https://www.gov.uk/find-lost-utr-number'
              className='govuk-link'
              target='_blank'
              rel='noreferrer noopener'
            >
              {t('YOUR_UNIQUE_TAXPAYER_REFERENCE_NUMBER')}
              <span className='govuk-visually-hidden'>{t('OPENS_IN_NEW_TAB')}</span>
            </a>
          </p>
          <p className='govuk-body'>{t('IF_YOU_CANNOT_US_THE_ONLINE_FORM')}</p>
          <p className='govuk-body'>
            {t('YOU_CAN_COMPLETE')}
            <a
              href='https://public-online.hmrc.gov.uk/lc/content/xfaforms/profiles/forms.html?contentRoot=repository:///Applications/NICs_iForms/1.0&template=CWF1_en_1.0.xdp'
              className='govuk-link'
              target='_blank'
              rel='noreferrer noopener'
            >
              {t('FORM_CWF1')}
              <span className='govuk-visually-hidden'>{t('OPENS_IN_NEW_TAB')}</span>
            </a>
            {t('TO_REACTIVATE_YOUR_ACCOUNT')}
          </p>
          <p className='govuk-body'>{t('SEND_THE_COMPLETED_FORM_TO')}</p>
          <p className='govuk-body'>
            {t('SELF_ASSESSMENT')}
            <br />
            {t('HM_REVENUE_AND_CUSTOMS')}
            <br />
            {lang === 'cy' && (
              <>
                HMRC
                <br />
              </>
            )}
            {t('BX9_1AN')}
            <br />
            {t('UNITED_KINGDOM')}
          </p>
          <p className='govuk-body'>
            {t('YOU_WILL_NEED_YOUR')}
            <a
              href='https://www.gov.uk/find-lost-utr-number'
              className='govuk-link'
              target='_blank'
              rel='noreferrer noopener'
            >
              {t('YOU_WILL_NEED_YOUR_UNIQUE_TAXPAYER_REFERENCE_NUMBER')}
              <span className='govuk-visually-hidden'>{t('OPENS_IN_NEW_TAB')}</span>
            </a>
          </p>
        </div>
        <AskHMRC />
      </MainWrapper>
    </>
  );
};

export default AlreadyRegisteredUserMessage;
