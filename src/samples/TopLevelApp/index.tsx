import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import AppSelector from '../AppSelector';
import { getCookie } from '../../components/helpers/cookie';
import { enableGATracking, pushGAConsent } from '../../components/helpers/analyticsTracking';

const TopLevelApp = () => {
  const [basepath, setBasepath] = useState('');

  const checkUserConsent = () => {
    try {
      const trackingConsent = getCookie('userConsent');

      if (trackingConsent) {
        const GAconsent = JSON.parse(trackingConsent).preferences.GA;
        if (GAconsent) {
          enableGATracking();
        }
        pushGAConsent(GAconsent);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing user consent or enabling GA tracking:', error);
    }
  };

  // Listen for changes in localStorage (triggered across tabs)
  const storageEventListener = (event: StorageEvent) => {
    if (event.key === 'userConsentGA') {
      checkUserConsent(); // Re-run the consent check when the consent changes in other tabs
    }
  };

  useEffect(() => {
    getSdkConfig()
      .then(sdkConfig => {
        const url = new URL(sdkConfig.serverConfig.sdkContentServerUrl);
        setBasepath(url.pathname);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error fetching SDK config:', error);
      });

    // Check user consent on initial load
    checkUserConsent();

    // Add the storage event listener
    window.addEventListener('storage', storageEventListener);

    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('storage', storageEventListener);
    };
  }, []);

  return (
    basepath && (
      <BrowserRouter basename={basepath}>
        <AppSelector />
      </BrowserRouter>
    )
  );
};

export default TopLevelApp;
