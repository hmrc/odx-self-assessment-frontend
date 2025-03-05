import React, { useEffect, useState } from 'react';
import AppHeader from '../AppHeader';
import { useTranslation } from 'react-i18next';
import MainWrapper from '../../BaseComponents/MainWrapper';
import AppFooter from '../AppFooter';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import setPageTitle, { registerServiceName } from '../../helpers/setPageTitleHelpers';

export default function AppWrapper({ children, baseurl }) {
  const { t } = useTranslation();

  const [serviceName, setServiceName] = useState('');

  useEffect(() => {
    getSdkConfig().then(sdkConfig => {
      const { serviceName: name } = sdkConfig.applicationConfig[baseurl];
      setServiceName(name);
    });
  }, []);

  useEffect(() => {
    registerServiceName(t(serviceName));
    setPageTitle();
  }, [serviceName]);

  return (
    <>
      <AppHeader appname={t(serviceName)} hasLanguageToggle isPegaApp={false} />
      <div className='govuk-width-container'>
        <MainWrapper>{children}</MainWrapper>
      </div>
      <AppFooter baseurl={`${baseurl}`} />
    </>
  );
}
