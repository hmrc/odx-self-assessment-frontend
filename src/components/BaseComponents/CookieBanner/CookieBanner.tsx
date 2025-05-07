import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { setUserConsentCookie } from '../../helpers/cookie';
import { enableGATracking, pushGAConsent } from '../../helpers/analyticsTracking';

const CookieBanner = props => {
  const [isVisible, setIsVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const { t } = useTranslation();
  const { pageUrl } = props;
  const cookiesPagePath = `/${pageUrl}-cookies`;
  const isLocationCookies: boolean = useLocation().pathname === cookiesPagePath;

  useEffect(() => {
    // Check if the userConsent cookie exists
    const existingCookie = document.cookie.split('; ').find(row => row.startsWith('userConsent='));
    if (!existingCookie) {
      setIsVisible(true);
    }
  }, []);

  const setCookie = (consent: boolean) => {
    setUserConsentCookie(consent);
    // Set consent in localStorage
    localStorage.setItem('userConsentGA', JSON.stringify({ preferences: { GA: consent } }));

    if (consent) {
      enableGATracking();
    }
    pushGAConsent(consent);

    setIsVisible(false);
    setConfirmationMessage(consent ? 'COOKIE_BANNER.CONFIRMATION_ACCEPTED' : 'COOKIE_BANNER.CONFIRMATION_REJECTED');
  };

  return (
    <>
      {!isLocationCookies && (
        <>
          {isVisible && (
            <div className='govuk-cookie-banner' data-nosnippet role='region' aria-label='Cookies on HMRC Services'>
              <div className='govuk-cookie-banner__message govuk-width-container'>
                <div className='govuk-grid-row'>
                  <div className='govuk-grid-column-two-thirds'>
                    <h2 className='govuk-cookie-banner__heading govuk-heading-m'>{t('COOKIE_BANNER.TITLE')}</h2>
                    <div className='govuk-cookie-banner__content'>
                      <p className='govuk-body'>{t('COOKIE_BANNER.P1')}</p>
                      <p className='govuk-body'>{t('COOKIE_BANNER.P2')}</p>
                    </div>
                  </div>
                </div>
                <div className='govuk-button-group'>
                  <button type='button' className='govuk-button' data-module='govuk-button' onClick={() => setCookie(true)}>
                    {t('COOKIE_BANNER.CTA_ACCEPT')}
                  </button>
                  <button type='button' className='govuk-button' data-module='govuk-button' onClick={() => setCookie(false)}>
                    {t('COOKIE_BANNER.CTA_REJECT')}
                  </button>
                  <Link className='govuk-link' target='_blank' to={cookiesPagePath} rel='noreferrer noopener'>
                    {t('COOKIE_BANNER.CTA_VIEW')} {t('OPENS_IN_NEW_TAB')}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {confirmationMessage && (
            <div className='govuk-cookie-banner' data-nosnippet role='region' aria-label='Cookies on HMRC Services'>
              <div className='govuk-cookie-banner__message govuk-width-container'>
                <div className='govuk-grid-row'>
                  <div className='govuk-grid-column-two-thirds'>
                    <div className='govuk-cookie-banner__content'>
                      <p className='govuk-body'>
                        {t(confirmationMessage)}.{' '}
                        <Trans
                          i18nKey='COOKIE_BANNER.CONFIG_CHANGE_LINK'
                          components={{
                            Link: <Link className='govuk-link' target='_blank' to={cookiesPagePath} rel='noreferrer noopener'></Link>
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </div>
                <div className='govuk-button-group'>
                  <button type='button' className='govuk-button' data-module='govuk-button' onClick={() => setConfirmationMessage(null)}>
                    {t('COOKIE_BANNER.CTA_HIDE')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CookieBanner;
