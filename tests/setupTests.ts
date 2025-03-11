import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import 'jest-fetch-mock';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../assets/i18n/en.json';
import translationCY from '../assets/i18n/cy.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: translationEN
    },
    cy: {
      translation: translationCY
    }
  },
  fallbackLng: 'en',
  debug: false
});

export default i18n;

configure({ testIdAttribute: 'data-test-id' });
