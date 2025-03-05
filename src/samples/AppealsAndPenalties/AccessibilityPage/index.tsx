import React from 'react';
import { useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../../components/helpers/hooks/HMRCExternalLinks';

const Link = ({ href, text, extraText }) => (
  <a className='govuk-link' href={href} target='_blank' rel='noreferrer noopener'>
    {text} {extraText}
  </a>
);

const List = ({ listNumber, entries }) => {
  const { t } = useTranslation();
  return (
    <ul className='govuk-list govuk-list--bullet'>
      {Array.from({ length: entries }, (_, i) => (
        <li key={`${listNumber}${i}`}>{t(`ACCESSIBILITY_LIST_${listNumber}_${i}`)}</li>
      ))}
    </ul>
  );
};

const Section = ({ title, children }) => (
  <>
    <h2 className='govuk-heading-l'>{title}</h2>
    {children}
  </>
);

export default function AccessibilityAppealsAndPenalties() {
  const { t } = useTranslation();
  const { referrerURL, hmrcURL } = useHMRCExternalLinks();

  return (
    <>
      <h1 className='govuk-heading-xl'>{t('ACCESSIBLITY_STATEMENT_FOR_APPEAL_SERVICE')}</h1>
      <p className='govuk-body'>
        {t('THIS_SERVICE_IS_A_PART_GOVUK_WEBSITE')}{' '}
        <Link
          href='https://www.gov.uk/help/accessibility-statement'
          text={t('SEPARATE_AS_FOR_MAIN_GOVUK_WEBSITE')}
          extraText={t('OPENS_IN_NEW_TAB')}
        />
        .
      </p>
      <p className='govuk-body'>
        {t('THIS_PAGE_CONTAINS_INFO_ABOUT_APPEAL_SERVICE')}{' '}
        <Link
          href='https://account.hmrc.gov.uk/self-assessment/appeal-a-self-assessment-penalty'
          text='https://account.hmrc.gov.uk/self-assessment/appeal-a-self-assessment-penalty'
          extraText={t('OPENS_IN_NEW_TAB')}
        />
      </p>
      <p className='govuk-body'>{t('THIS_IS_RUN_BY_HMRC')}</p>
      <List listNumber={1} entries={5} />
      <p className='govuk-body'>{t('WE_HAVE_MADE_TEXTS_SIMPLER')}</p>
      <p className='govuk-body'>
        <Link
          href='https://mcmw.abilitynet.org.uk/'
          text={t('ABILITYNET_HAS_ADVICE')}
          extraText={t('OPENS_IN_NEW_TAB')}
        />{' '}
        {t('MAKING_YOUR_DEVICE_EASIER')}
      </p>

      <Section title={t('HOW_ACCESSIBLE_THIS_SERVICE_IS')}>
        <p className='govuk-body'>
          {t('SERVICE_IS_NONCOMPLIANT')}{' '}
          <Link
            href='https://www.w3.org/TR/WCAG22/'
            text={t('WEB_CONTENT_ACCESSIBILITY_VERSION')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />
          . {t('THIS_SERVICE_HAS_NOT_YET_BEEN_CHECKED')}
        </p>
      </Section>

      <Section title={t('WHAT_TO_DO_IF_YOU_HAVE_DIFFICULTY_USING_THIS')}>
        <p className='govuk-body'>
          {t('YOU_CAN')}{' '}
          <Link
            href='https://www.gov.uk/get-help-hmrc-extra-support'
            text={t('CONTACT_HMRC_FOR_EXTRA_SUPPORT')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />{' '}
          {t('IF_YOU_NEED_HELP_WITH_AUDIORECORDING_BRAILLE_ETC')}
        </p>
      </Section>

      <Section title={t('REPORTING_ACCESSIBILITY_PROBLEMS_WITH_THIS_SERVICE')}>
        <p className='govuk-body'>
          {t('WE_ARE_ALWAYS_LOOKING_TO_IMPROVE')}{' '}
          <Link
            href={`${hmrcURL}contact/accessibility?service=463&referrerUrl=${referrerURL}`}
            text={t('REPORT_THE_ACCESSIBILITY_PROBLEM')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />
          .
        </p>
      </Section>

      <Section title={t('IF_YOU_ARE_NOT_HAPPY')}>
        <p className='govuk-body'>
          {t('EHRC_ENFORCES_ACCESSIBILITY_REGULATIONS')}{' '}
          <Link
            href='https://www.equalityadvisoryservice.com/'
            text={t('CONTACT_THE_EASS')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />
          {t('OR_THE')}{' '}
          <Link
            href='https://www.equalityni.org/Home'
            text={t('ECNI')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />
          {t('IF_YOU_LIVE_IN_NORTHERN_IRELAND')}
        </p>
      </Section>

      <Section title={t('CONTACTING_US_BY')}>
        <p className='govuk-body'>{t('FOR_HEARING_IMPAIRED')}</p>
        <p className='govuk-body'>{t('BRITISH_SIGN_LANGUGAE')}</p>
        <p className='govuk-body'>
          {t('FIND_OUT')}{' '}
          <Link
            href='https://www.gov.uk/get-help-hmrc-extra-support'
            text={t('HOW_TO_GET_EXTRA_SUPPORT')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />
          .
        </p>
      </Section>

      <Section title={t('TECHNICAL_INFO_ABOUT_THIS_SERVICE')}>
        <p className='govuk-body'>{t('HMRC_IS_COMMITTED_TO_MAKING_THIS_ACCESSIBLE')}</p>
        <p className='govuk-body'>
          {t('SERVICE_IS_NONCOMPLIANT')}{' '}
          <Link
            href='https://www.w3.org/TR/WCAG22/'
            text={t('WEB_CONTENT_ACCESSIBILITY_VERSION')}
            extraText={t('OPENS_IN_NEW_TAB')}
          />{' '}
          {t('DUE_TO_THESE_NONCOMPLIANCES')}
        </p>
        <p className='govuk-body'>{t('IT_HAS_NOT_BEEN_TESTED')}</p>
      </Section>

      <Section title={t('HOW_WE_TESTED_THIS')}>
        <p className='govuk-body'>{t('THIS_SERVICE_HAS_NOT_BEEN_TESTED')}</p>
        <p className='govuk-body'>{t('PREPARED_AND_LAST_UPDATED')}</p>
      </Section>
    </>
  );
}
