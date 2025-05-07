import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CookiePageTable from './CookiePageTable';
import { scrollToTop } from '../../components/helpers/utils';
import { CookieDetail } from './interface';
import AnalyticCookieJson from '../../data/cookies/analyticCookies.json';
import GenericCookieJson from '../../data/cookies/genericCookies.json';
import { setUserConsentCookie } from '../../components/helpers/cookie';
import { enableGATracking, pushGAConsent } from '../../components/helpers/analyticsTracking';

export default function CookiePage() {
  const FIND_OUT_MORE_URL = 'https://www.tax.service.gov.uk/help/cookie-details';
  const cookies: CookieDetail[] = GenericCookieJson;
  const cookiesAnalytics: CookieDetail[] = AnalyticCookieJson;
  const errorRef = useRef(null);
  const { t } = useTranslation();
  const [analyticSelection, setAnalyticSelection] = useState<String | null>(null);
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [showError, setshowError] = useState(false);

  function assignCookies(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    scrollToTop();
    if (analyticSelection) {
      const consent = analyticSelection === 'yes';
      setshowError(false);
      setDisplaySuccess(true);
      setUserConsentCookie(consent);
      // Set consent in localStorage
      localStorage.setItem('userConsentGA', JSON.stringify({ preferences: { GA: consent } }));

      if (consent) {
        enableGATracking();
      }
      pushGAConsent(consent);
    } else {
      setshowError(true);
    }
  }

  useEffect(() => {
    if (showError) {
      errorRef.current.focus();
    }
  }, [showError]);

  return (
    <>
      {showError && (
        <div className='govuk-error-summary' data-module='govuk-error-summary'>
          <div role='alert'>
            <h2 className='govuk-error-summary__title'>{t('THERE_IS_A_PROBLEM')}</h2>
            <div className='govuk-error-summary__body'>
              <ul className='govuk-list govuk-error-summary__list'>
                <li>
                  <a href='#acceptAnalytics-1' ref={errorRef}>
                    {t('COOKIE_CHANGE_RADIO_EMPTY')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      {displaySuccess && (
        <div
          className='govuk-notification-banner govuk-notification-banner--success'
          role='alert'
          aria-labelledby='govuk-notification-banner-title'
          data-module='govuk-notification-banner'
        >
          <div className='govuk-notification-banner__header'>
            <h2 className='govuk-notification-banner__title' id='govuk-notification-banner-title'>
              {t('SUCCESS')}
            </h2>
          </div>
          <div className='govuk-notification-banner__content'>
            <p className='govuk-notification-banner__heading'>{t('COOKIE_PREFS_SET')}</p>
          </div>
        </div>
      )}
      <h1 className='govuk-heading-l test'>{t('COOKIES')}</h1>
      <p className='govuk-body'>{t('COOKIES_PAGE_P1')}</p>
      <p className='govuk-body'>{t('COOKIES_PAGE_P2')}</p>
      <CookiePageTable cookies={cookies} tableCaption={t('ESSENTIAL_COOKIES')} />
      <p className='govuk-body'>{t('ESSENTIAL_COOKIES_P1')}</p>
      <h2 className='govuk-heading-m'>{t('ANALYTICS_COOKIES_P_H1')}</h2>
      <p className='govuk-body'>{t('COOKIES_PAGE_P3')}</p>

      <CookiePageTable cookies={cookiesAnalytics} tableCaption={t('ANALYTICS_COOKIES_P_H2')} />

      <h2 className='govuk-heading-l'>{t('COOKIE_CHANGE_RADIO_LEGEND')}</h2>
      <form action=''>
        <div className={`govuk-form-group ${showError ? 'govuk-form-group--error' : ''}`}>
          <fieldset className='govuk-fieldset' aria-describedby='acceptAnalytics-error'>
            <legend className='govuk-fieldset__legend govuk-fieldset__legend--s'>{t('COOKIE_CHANGE_QUESTION')}</legend>
            {showError && (
              <p id='acceptAnalytics-error' className='govuk-error-message'>
                <span className='govuk-visually-hidden'>{t('ERROR')}:</span>
                {t('COOKIE_CHANGE_RADIO_EMPTY')}
              </p>
            )}
            <div className='govuk-radios' data-module='govuk-radios'>
              <div className='govuk-radios__item'>
                <input
                  className='govuk-radios__input'
                  id='acceptAnalytics-1'
                  name='acceptAnalytics'
                  type='radio'
                  value='yes'
                  onChange={() => setAnalyticSelection('yes')}
                />
                <label className='govuk-label govuk-radios__label' htmlFor='acceptAnalytics-1'>
                  {t('YES')}
                </label>
              </div>
              <div className='govuk-radios__item'>
                <input
                  className='govuk-radios__input'
                  id='acceptAnalytics-2'
                  name='acceptAnalytics'
                  type='radio'
                  value='no'
                  onChange={() => setAnalyticSelection('no')}
                />
                <label className='govuk-label govuk-radios__label' htmlFor='acceptAnalytics-2'>
                  {t('NO')}
                </label>
              </div>
            </div>
          </fieldset>
        </div>
        <button onClick={assignCookies} className='govuk-button' data-module='govuk-button' data-govuk-button-init='' type='submit'>
          {t('SAVE_COOKIE_BUTTON')}
        </button>
      </form>
      <p className='govuk-body'>
        <a href={FIND_OUT_MORE_URL} className='govuk-link govuk-link--no-visited-state'>
          {t('COOKIE_FIND_OUT_MORE')}
        </a>
      </p>
    </>
  );
}
