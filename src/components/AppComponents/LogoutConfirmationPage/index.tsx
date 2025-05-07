import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/BaseComponents/Button/Button';
import AskHMRC from '../AskHMRC';

export default function LogoutConfirmationPage(props) {
  const [isAnsSaved, setIsAnsSaved] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    setIsAnsSaved(sessionStorage.getItem('isAnsSaved'));
  }, [t]);

  useEffect(() => {
    setBaseUrl(props.baseurl);
  }, []);

  const handleSignIn = () => {
    sessionStorage.removeItem('isAnsSaved');
    window.location.href = `${baseUrl}`;
  };

  return (
    <>
      <h1 className='govuk-heading-xl'>{t('FOR_SECURITY_WE_SIGNED_YOU_OUT')}</h1>
      {isAnsSaved && <p className='govuk-body'>{t('WE_SAVED_YOUR_ANSWERS')}</p>}
      <div className='govuk-form-group'>
        <Button
          variant='primary'
          onClick={e => {
            e.target.blur();
            handleSignIn();
          }}
          attributes={{
            type: 'button',
            className: 'govuk-button govuk-!-margin-bottom-0'
          }}
        >
          {t('SIGN_IN')}
        </Button>
      </div>
      <AskHMRC />
    </>
  );
}
