import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../BaseComponents/MainWrapper';
import setPageTitle from '../../helpers/setPageTitleHelpers';
import { getCurrentLanguage } from '../../helpers/utils';
import AskHMRC from '../AskHMRC';

interface ServiceFallbackPagesProps {
  shuttered: boolean;
  outage: boolean;
  time: string;
  date: string;
  time_cy: string;
  date_cy: string;
}

export default function ServiceFallbackPages({
  serviceStatus
}: {
  serviceStatus: ServiceFallbackPagesProps;
}) {
  const { shuttered, outage, time, date, time_cy, date_cy } = serviceStatus;
  const { t } = useTranslation();
  const lang = getCurrentLanguage();

  let timeWithLocale = time;
  let dateWithLocale = date;

  if (lang === 'cy') {
    timeWithLocale = time_cy;
    dateWithLocale = date_cy;
  }
  function getFallbackPage() {
    if (outage) {
      return (
        <>
          <h1 className='govuk-heading-l'>{t('SERVICE_NOT_AVAILABLE')}</h1>
          <p className='govuk-body'>
            {t('YOU_WILL_BE_ABLE_TO_USE_SERVICE')} {timeWithLocale} {t('ON')} {dateWithLocale}
          </p>
          <p className='govuk-body'>
            <a
              target='_blank'
              rel='noreferrer noopener'
              href='https://www.gov.uk/government/organisations/hm-revenue-customs/contact/self-assessment'
              className='govuk-link'
            >
              {t('CONTACT_HMRC_SELF_ASSESSMENT')} {t('OPENS_IN_NEW_TAB')}
            </a>{' '}
            {t('IF_YOU_NEED_TO_SPEAK')}
          </p>
        </>
      );
    }

    if (shuttered) {
      return (
        <>
          <h1 className='govuk-heading-l'>{t('SHUTTER_SERVICE_UNAVAILABLE')}</h1>
          <p className='govuk-body'>{t('SHUTTER_USE_SERVICE_LATER_MESSAGE')}</p>
        </>
      );
    }
  }

  useEffect(() => {
    setPageTitle();
  }, [lang]);

  return (
    <MainWrapper>
      <>
        {getFallbackPage()}
        <AskHMRC />
      </>
    </MainWrapper>
  );
}
