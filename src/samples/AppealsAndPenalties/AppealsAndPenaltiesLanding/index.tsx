import React, { useEffect, useState } from 'react';
import AskHMRC from '../../../components/AppComponents/AskHMRC';
import Button from '../../../components/BaseComponents/Button/Button';
import { useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../../components/helpers/hooks/HMRCExternalLinks';
import PenaltyDatails from './PenaltyDatails';
import setPageTitle from '../../../components/helpers/setPageTitleHelpers';
import { Content, PenaltyDataProps } from './PenaltyTypes';
import C11nEnv from '@pega/pcore-pconnect-typedefs/interpreter/c11n-env';
import { getCurrentLanguage } from '../../../components/helpers/utils';

interface LandingProps {
  isLogout: boolean;
  pConn: Partial<C11nEnv>;
  penaltyDataEndpoint: string;
  createCaseEndpoint: string;
  handleCaseStart: () => void;
  penaltyDataEndpointParams: {};
}

const AppealsAndPenaltiesLanding: React.FC<LandingProps> = props => {
  const { isLogout, pConn, penaltyDataEndpoint, createCaseEndpoint, handleCaseStart, penaltyDataEndpointParams } = props;

  const [dashboardData, setDashboardData] = useState<PenaltyDataProps>(null);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState<boolean>(false);
  const { t } = useTranslation();
  const { hmrcURL } = useHMRCExternalLinks();

  function createCase() {
    const startingFields = {
      NotificationLanguage: getCurrentLanguage()
    };

    PCore.getMashupApi().createCase(createCaseEndpoint, PCore.getConstants().APP.APP, {
      // @ts-ignore
      startingFields,
      pageName: '',
      channelName: ''
    });

    handleCaseStart();
  }

  const fetchInProgressCaseDetailData = async () => {
    const context = pConn.getContextName();
    const options = { invalidateCache: true };
    try {
      // @ts-ignore
      const response: Content = await PCore.getDataPageUtils().getDataAsync(
        penaltyDataEndpoint,
        context,
        { ...penaltyDataEndpointParams },
        {},
        {},
        options
      );

      PCore.getPubSubUtils().unsubscribe('languageToggleTriggered', 'PenaltiesLandingPageLanguageChange');

      const currentLang = getCurrentLanguage();

      const data: PenaltyDataProps =
        response?.data?.length > 0 && response.data[0].LocalisedContent?.length > 0
          ? response.data[0].LocalisedContent.find(item => item.Language.toLowerCase() === currentLang)
          : null;

      setDashboardData(data);
      PCore.getPubSubUtils().subscribe(
        'languageToggleTriggered',
        ({ language }) => {
          setDashboardData(response?.data[0].LocalisedContent?.find(item => item.Language.toLowerCase() === language.toLowerCase()));
        },
        'PenaltiesLandingPageLanguageChange'
      );
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
        <p>
          {t('YOU_CAN_USE_THIS_SERVICE')} {dashboardData.InstructionText}
          {t('IF_YOUR_PENALTY_WAS_ISSUED_EARLIER')}
          <a
            className='govuk-link'
            rel='noreferrer noopener'
            href='https://assets.publishing.service.gov.uk/media/657af4f6095987001295e0d7/SA370__Appeal.pdf'
            target='_blank'
          >
            {t('USE_THE_SA370_FORM')} {t('OPENS_IN_NEW_TAB')}
          </a>
          .
        </p>
      </div>
      <PenaltyDatails penaltyData={dashboardData.penaltyData} />
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
      <main className={`govuk-main-wrapper ${isLogout ? 'visibility-hidden' : ''}`} id='main-content' role='main'>
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-full govuk-prototype-kit-common-templates-mainstream-guide-body govuk-!-padding-right-0 govuk-!-padding-left-0'>
            <div className='govuk-grid-column-two-thirds'>
              <h1 className='govuk-heading-l'>{t('YOUR_SELF_ASSESSMENT_PENALTIES')}</h1>
              {dashboardData === null || dashboardData.penaltyData.length === 0 ? (
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
