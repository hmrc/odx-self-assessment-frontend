import { useTranslation } from 'react-i18next';
import CookiePageTable from './CookiePageTable';
import { CookieDetail } from './interface';
import GenericCookieJson from '../../data/cookies/genericCookies.json';

export default function CookiePage() {
  const FIND_OUT_MORE_URL = 'https://www.tax.service.gov.uk/help/cookie-details';
  const cookies: CookieDetail[] = GenericCookieJson;
  const { t } = useTranslation();

  return (
    <>
      <h1 className='govuk-heading-l test'>{t('COOKIES')}</h1>
      <p className='govuk-body'>{t('COOKIES_PAGE_P1')}</p>
      <p className='govuk-body'>{t('COOKIES_PAGE_P2')}</p>
      <CookiePageTable cookies={cookies} tableCaption={t('ESSENTIAL_COOKIES')} />
      <p className='govuk-body'>{t('ESSENTIAL_COOKIES_P1')}</p>
      <p className='govuk-body'>
        <a href={FIND_OUT_MORE_URL} className='govuk-link govuk-link--no-visited-state'>
          {t('COOKIE_FIND_OUT_MORE')}
        </a>
      </p>
    </>
  );
}
