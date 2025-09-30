import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../helpers/hooks/HMRCExternalLinks';

const PageNotWorkingProperly = () => {
  const { t } = useTranslation();
  const { hmrcURL } = useHMRCExternalLinks();

  return (
    <p className='govuk-body'>
      <a
        className='govuk-link'
        rel='noreferrer noopener'
        target='_blank'
        href={`${hmrcURL}contact/report-technical-problem?service=427&referrerUrl=${window.location}`}
      >
        {t('PAGE_NOT_WORKING_PROPERLY')} {t('OPENS_IN_NEW_TAB')}
      </a>
    </p>
  );
};

export default memo(PageNotWorkingProperly);
