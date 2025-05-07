import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import i18n from 'i18next';
import Registration from '../Registration/index';
import CookiePage from '../cookiePage/index';
import Accessibility from '../Registration/AccessibilityPage';
import AccessibilityCessation from '../Cessation/AccessibilityPage';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import ProtectedRoute from '../../components/HOC/ProtectedRoute';
import Cessation from '../Cessation';
import AppealsAndPenalties from '../AppealsAndPenalties';
import AppWrapper from '../../components/AppComponents/AppWrapper';
import AccessibilityAppealsAndPenalties from '../AppealsAndPenalties/AccessibilityPage';
import LogoutConfirmationPage from '../../components/AppComponents/LogoutConfirmationPage';

const AppSelector = () => {
  const [i18nloaded, seti18nloaded] = useState(false);

  useEffect(() => {
    i18n
      .use(Backend)
      .use(initReactI18next)
      .init({
        lng: sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en',
        backend: {
          loadPath: `assets/i18n/{{lng}}.json`
        },
        fallbackLng: 'en',
        debug: false,
        returnNull: false,
        react: {
          useSuspense: false
        }
      })
      .finally(() => {
        seti18nloaded(true);
        setPageTitle();
      });
  }, []);

  return !i18nloaded ? null : (
    <Routes>
      <Route path='/' element={<Navigate to='/registration' replace />} />

      {/* Private Routes */}
      <Route
        path='/registration'
        element={<ProtectedRoute component={Registration} journeyName='registration' />}
      />
      <Route
        path='/cessation'
        element={<ProtectedRoute component={Cessation} journeyName='cessation' />}
      />
      <Route
        path='/appeal-a-self-assessment-penalty'
        element={
          <ProtectedRoute
            component={AppealsAndPenalties}
            journeyName='appeal-a-self-assessment-penalty'
          />
        }
      />

      {/* Public Routes */}
      <Route
        path='/registration-cookies'
        element={
          <AppWrapper baseurl='registration'>
            <CookiePage />
          </AppWrapper>
        }
      />
      <Route
        path='/registration-accessibility'
        element={
          <AppWrapper baseurl='registration'>
            <Accessibility />
          </AppWrapper>
        }
      />
      <Route
        path='/cessation-cookies'
        element={
          <AppWrapper baseurl='cessation'>
            <CookiePage />
          </AppWrapper>
        }
      />
      <Route
        path='/cessation-accessibility'
        element={
          <AppWrapper baseurl='cessation'>
            <AccessibilityCessation />
          </AppWrapper>
        }
      />
      <Route
        path='/appeal-a-self-assessment-penalty-cookies'
        element={
          <AppWrapper baseurl='appeal-a-self-assessment-penalty'>
            <CookiePage />
          </AppWrapper>
        }
      />
      <Route
        path='/appeal-a-self-assessment-penalty-accessibility'
        element={
          <AppWrapper baseurl='appeal-a-self-assessment-penalty'>
            <AccessibilityAppealsAndPenalties />
          </AppWrapper>
        }
      />
      <Route
        path='/cessation-loggedout'
        element={
          <AppWrapper baseurl='cessation'>
            <LogoutConfirmationPage baseurl='cessation' />
          </AppWrapper>
        }
      />
      <Route
        path='/registration-loggedout'
        element={
          <AppWrapper baseurl='registration'>
            <LogoutConfirmationPage baseurl='registration' />
          </AppWrapper>
        }
      />
      <Route
        path='/appeal-a-self-assessment-penalty-loggedout'
        element={
          <AppWrapper baseurl='appeal-a-self-assessment-penalty'>
            <LogoutConfirmationPage baseurl='appeal-a-self-assessment-penalty' />
          </AppWrapper>
        }
      />
    </Routes>
  );
};

export default AppSelector;
