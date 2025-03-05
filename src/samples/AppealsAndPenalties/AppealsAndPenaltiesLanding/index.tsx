import React, { useEffect, useState } from 'react';
import AskHMRC from '../../../components/AppComponents/AskHMRC';
import Button from '../../../components/BaseComponents/Button/Button';
import { useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../../components/helpers/hooks/HMRCExternalLinks';
import PenaltyDatails from './PenaltyDatails';
import setPageTitle from '../../../components/helpers/setPageTitleHelpers';
import { PenaltyDuration, PenaltyDataProps } from './PenaltyTypes';
import C11nEnv from '@pega/pcore-pconnect-typedefs/interpreter/c11n-env';

interface LandingProps {
  isLogout: boolean;
  pConn: Partial<C11nEnv>;
  penaltyDataEndpoint: string;
  createCaseEndpoint: string;
  handleCaseStart: () => void;
}

const AppealsAndPenaltiesLanding: React.FC<LandingProps> = props => {
  const { isLogout, pConn, penaltyDataEndpoint, createCaseEndpoint, handleCaseStart } = props;

  const [dashboardData, setDashboardData] = useState<Array<PenaltyDuration>>(null);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState<boolean>(false);
  const { t } = useTranslation();
  const { hmrcURL } = useHMRCExternalLinks();

  const createCase = (): void => {
    PCore.getMashupApi().createCase(createCaseEndpoint, PCore.getConstants().APP.APP);
    handleCaseStart();
  };

  const fetchInProgressCaseDetailData = async () => {
    const context = pConn.getContextName();
    try {
      // @ts-ignore
      const response: PenaltyDataProps = await PCore.getDataPageUtils().getDataAsync(
        penaltyDataEndpoint,
        context
      );
      const data: Array<PenaltyDuration> =
        response.data.length > 0 ? response.data[0].penaltyData : [];

      setDashboardData(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error fetching dashboard detail:', error);
    } finally {
      setDashboardDataLoaded(true);
    }
    sessionStorage.setItem('assignmentFinishedFlag', 'false');
  };

  useEffect(() => {
    setPageTitle();
    fetchInProgressCaseDetailData();
  }, []);

  const renderPenaltiesSection = () => (
    <>
      <div className='govuk-body'>
        <p>{t('MAKE_AN_APPEAL_YOU_HAVE')}</p>
        <p>{t('THIS_PAGE_ONLY_SHOW_PENALTY')}</p>
        <p>
          <a
            className='govuk-link'
            rel='noreferrer noopener'
            href='https://www.gov.uk/guidance/check-when-you-can-expect-a-reply-from-hmrc'
            target='_blank'
          >
            {t('CHECK_REPLY_FROM_HMRC')} {t('OPENS_IN_NEW_TAB')}
          </a>
          .
        </p>
      </div>
      <PenaltyDatails penaltyData={dashboardData} />
      <div className='govuk-body govuk-!-static-margin-bottom-6'>
        <h2 className='govuk-heading-m'>{t('MAKE_AN_APPEAL')}</h2>
        <p>{t('IF_YOU_DONT_THINK')}</p>
        <p>{t('YOU_WILL_BE_ASKED_ABOUT_YOUR_REASON')}</p>
        <p>{t('YOU_CAN_ALSO_TELL_US')}</p>
        <h2 className='govuk-heading-m'>{t('IF_YOU_HAVE_MORE_THAN_ONE')}</h2>
        <p>{t('THERE_ARE_2_TYPES')}</p>
        <ul className='govuk-list govuk-list--bullet'>
          <li>{t('LFP')}</li>
          <li>{t('LPP')}</li>
        </ul>
        <p>{t('APPEAL_MULTIPLE_PENALTIES')}</p>
        <p>{t('IF_YOU_HAVE_MORE_THAN_ONE_ACROSS_MULTIPLE_TAX_YEARS')}</p>
      </div>
      <Button
        id='continueToPortal'
        onClick={createCase}
        data-prevent-double-click='true'
        attributes={{ className: 'govuk-!-static-margin-bottom-1' }}
      >
        {t('START_AN_APPEAL')}
      </Button>
      <AskHMRC />
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
    </>
  );

  return (
    dashboardDataLoaded && (
      <main
        className={`govuk-main-wrapper ${isLogout ? 'visibility-hidden' : ''}`}
        id='main-content'
        role='main'
      >
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-full govuk-prototype-kit-common-templates-mainstream-guide-body govuk-!-padding-right-0 govuk-!-padding-left-0'>
            <div className='govuk-grid-column-two-thirds'>
              <h1 className='govuk-heading-l'>{t('YOUR_SELF_ASSESSMENT_PENALTIES')}</h1>
              {dashboardData === null || dashboardData.length === 0 ? (
                <p>{t('YOU_DO_NOT_HAVE_SA_PENALTIES')}</p>
              ) : (
                dashboardData && renderPenaltiesSection()
              )}
            </div>
          </div>
        </div>
      </main>
    )
  );
};

export default AppealsAndPenaltiesLanding;
