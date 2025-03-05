import React from 'react';
import { useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../helpers/hooks/HMRCExternalLinks';
import { getAskHmrcSubLink } from '../../helpers/utils';

const AskHMRC = () => {
  const { t } = useTranslation();
  const { hmrcUrlMigrated } = useHMRCExternalLinks();

  return (
    <>
      <hr className='govuk-section-break govuk-section-break--l govuk-section-break--visible'></hr>
      <h2 className='govuk-heading-m'>{t('GET_HELP')}</h2>
      <div className='govuk-body'>
        <p>
          {t('USE')}{' '}
          <a
            href={`${hmrcUrlMigrated}ask-hmrc/chat/${getAskHmrcSubLink()}`}
            rel='noreferrer noopener'
            target='_blank'
            className='govuk-link'
          >
            {t('HRMC_ONLINE_ASSISTANT')}
          </a>{' '}
          {t('TO_GET_HELP_WITH_SELF_ASSESSMENT')}
        </p>
      </div>
    </>
  );
};

export default AskHMRC;
