import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import i18n from 'i18next';
import Registration from '../Registration/index';
import CookiePage from '../Registration/cookiePage/index';
import Accessibility from '../Registration/AccessibilityPage';
import AccessibilityCessation from '../Cessation/AccessibilityPage';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import ProtectedRoute from '../../components/HOC/ProtectedRoute';
import Cessation from '../Cessation';
import AppealsAndPenalties from '../AppealsAndPenalties';
import AppWrapper from '../../components/AppComponents/AppWrapper';
import AccessibilityAppealsAndPenalties from '../AppealsAndPenalties/AccessibilityPage';

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
    <Switch>
      <Route exact path='/' render={() => <Redirect to='/registration' />} />
      {/* Private Routes */}
      <ProtectedRoute
        exact
        path='/registration'
        journeyName='registration'
        component={Registration}
      />
      <ProtectedRoute exact path='/cessation' journeyName='cessation' component={Cessation} />
      <ProtectedRoute
        exact
        path='/appeal-a-self-assessment-penalty'
        journeyName='appeal-a-self-assessment-penalty'
        component={AppealsAndPenalties}
      />
      {/* Public Routes */}
      <Route
        exact
        path='/registration-cookies'
        render={() => {
          return (
            <AppWrapper baseurl='registration'>
              <CookiePage />
            </AppWrapper>
          );
        }}
      />
      <Route
        exact
        path='/registration-accessibility'
        render={() => (
          <AppWrapper baseurl='registration'>
            <Accessibility />
          </AppWrapper>
        )}
      />
      <Route
        exact
        path='/cessation-cookies'
        render={() => {
          return (
            <AppWrapper baseurl='cessation'>
              <CookiePage />
            </AppWrapper>
          );
        }}
      />
      <Route
        exact
        path='/cessation-accessibility'
        render={() => (
          <AppWrapper baseurl='cessation'>
            <AccessibilityCessation />
          </AppWrapper>
        )}
      />
      <Route
        exact
        path='/appeal-a-self-assessment-penalty-cookies'
        render={() => {
          return (
            <AppWrapper baseurl='appeal-a-self-assessment-penalty'>
              <CookiePage />
            </AppWrapper>
          );
        }}
      />
      <Route
        exact
        path='/appeal-a-self-assessment-penalty-accessibility'
        render={() => (
          <AppWrapper baseurl='appeal-a-self-assessment-penalty'>
            <AccessibilityAppealsAndPenalties />
          </AppWrapper>
        )}
      />
    </Switch>
  );
};

export default AppSelector;
