import React, { FunctionComponent, useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import AppFooter from '../../components/AppComponents/AppFooter';
import { resumeOnRefresh, triggerLogout } from '../../components/helpers/utils';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';
import ShutterServicePage from '../../components/AppComponents/ShutterServicePage';
import SummaryPage from '../../components/AppComponents/SummaryPage';
import {
  initTimeout,
  settingTimer,
  staySignedIn
} from '../../components/AppComponents/TimeoutPopup/timeOutUtils';

import AppHeader from '../../components/AppComponents/AppHeader';
import ApiServiceNotAvailable from '../../components/AppComponents/ApiErrorServiceNotAvailable';
import { useStartMashup } from '../../reuseables/PegaSetup';
import Landing from '../../components/AppComponents/Landing';
import AppContext from '../../reuseables/AppContext';
import { setJourneyName } from '../../components/helpers/journeyRegistry';
import { TIMEOUT_115_SECONDS } from '../../components/helpers/constants';
import { BundleLanguage, loadBundles } from '../../components/helpers/languageToggleHelper';

const Cessation: FunctionComponent<any> = ({ journeyName }) => {
  const { t } = useTranslation();

  const serviceParam = 'claim-child-benefit';
  // Adding hardcoded value as key to sort translation issue.
  const serviceNameAndHeader = 'LEAVE_SELF_ASSESSMENT';
  const inProgressCaseCountEndPoint = 'D_RegistrantWorkAssignmentSACases';
  const createCaseApi = 'HMRC-SA-Work-Cessation';
  const caseListApiParams = { CaseType: 'HMRC-SA-Work-Cessation' };

  const summaryPageRef = useRef<HTMLDivElement>(null);

  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [pCoreReady, setPCoreReady] = useState(false);
  const { showLanguageToggle } = useContext(AppContext);
  const [showLanguageToggleState, setShowLanguageToggleState] = useState(showLanguageToggle);
  const [currentDisplay, setCurrentDisplay] = useState<
    | 'pegapage'
    | 'resolutionpage'
    | 'servicenotavailable'
    | 'shutterpage'
    | 'loading'
    | 'landingpage'
  >('pegapage');
  const [summaryPageContent, setSummaryPageContent] = useState<any>({
    content: null,
    title: null,
    banner: null
  });
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [showPortalBanner, setShowPortalBanner] = useState(false);
  const [pConnect, setPconnect] = useState(null);
  const [isLogout, setIsLogout] = useState(false);
  const [shutterServicePage, setShutterServicePage] = useState(false);
  const [millisecondsTillSignout, setmillisecondsTillSignout] = useState(TIMEOUT_115_SECONDS);

  const { hmrcURL } = useHMRCExternalLinks();
  const checkDefaultShutteringEnabled = false;

  registerServiceName(t('LEAVE_SELF_ASSESSMENT'));
  setJourneyName(journeyName);

  useEffect(() => {
    initTimeout(setShowTimeoutModal, false, true, false);
  }, []);

  const {
    showPega,
    setShowPega,
    showResolutionPage,
    caseId,
    serviceNotAvailable,
    assignmentPConnect,
    assignmentCancelled,
    setAssignmentCancelled,
    containerClosed,
    renderRootComponent,
    rootProps
  } = useStartMashup(
    {
      appBacklinkProps: {},
      serviceParam,
      serviceName: serviceNameAndHeader,
      appNameHeader: serviceNameAndHeader
    },
    checkDefaultShutteringEnabled
  );

  // Function to force re-render the pega Root component
  const forceRefreshRootComponent = () => {
    renderRootComponent();
  };

  useEffect(() => {
    if (Object.keys(rootProps).length) {
      PCore.getPubSubUtils().subscribe(
        'forceRefreshRootComponent',
        forceRefreshRootComponent,
        'forceRefreshRootComponent'
      );
    }
    return () => {
      PCore?.getPubSubUtils().unsubscribe('forceRefreshRootComponent', 'forceRefreshRootComponent');
    };
  }, [rootProps]);

  useEffect(() => {
    if (assignmentPConnect) {
      setPconnect(assignmentPConnect);
    }
  }, [assignmentPConnect]);

  function handleSignout(e?) {
    e?.preventDefault();
    triggerLogout(setIsLogout);
  }

  const handleCaseStart = () => {
    setShowLandingPage(false);
    setShowPega(true);
  };

  function closeContainer() {
    if (PCore.getContainerUtils().getActiveContainerItemName('app/primary')) {
      PCore.getContainerUtils().closeContainerItem(
        PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
        { skipDirtyCheck: true }
      );
    }
  }

  function returnedToPortal(showBanner = false) {
    closeContainer();
    setShowPega(false);
    setShowLandingPage(true);
    setShowPortalBanner(showBanner);
    setAssignmentCancelled(false);
    setSummaryPageContent({
      content: null,
      title: null,
      banner: null
    });
  }

  useEffect(() => {
    if (assignmentCancelled) {
      // user clicked save and come back later link
      const showBanner = true;
      returnedToPortal(showBanner);
    }
  }, [assignmentCancelled]);

  useEffect(() => {
    function handleClick(e) {
      const targetId = e.target.id;
      if (targetId === 'homepage') {
        e.preventDefault();
        returnedToPortal(false);
        // setShowPortalPageDefault(true);
      }
    }

    const currentSummaryPageRef = summaryPageRef.current;
    if (currentSummaryPageRef) {
      currentSummaryPageRef.addEventListener('click', handleClick);
    }
    return () => {
      if (currentSummaryPageRef) {
        currentSummaryPageRef.removeEventListener('click', handleClick);
      }
    };
  }, [summaryPageContent]);

  useEffect(() => {
    if (shutterServicePage) {
      setCurrentDisplay('shutterpage');
    } else if (showLandingPage && pCoreReady && !showResolutionPage && !shutterServicePage) {
      setCurrentDisplay('landingpage');
    } else if (showPega) {
      setCurrentDisplay('pegapage');
    } else if (showResolutionPage) {
      setSummaryPageContent({
        content: null,
        title: null,
        banner: null
      });
      setCurrentDisplay('resolutionpage');
      setShowPega(false);
      getSdkConfig().then(config => {
        PCore.getRestClient()
          .invokeCustomRestApi(
            `${config.serverConfig.infinityRestServerUrl}/api/application/v2/cases/${caseId}?pageName=SubmissionSummary`,
            {
              method: 'GET',
              body: '',
              headers: '',
              withoutDefaultHeaders: false
            },
            ''
          )
          .then(response => {
            PCore.getPubSubUtils().unsubscribe(
              'languageToggleTriggered',
              'summarypageLanguageChange'
            );
            const summaryData: any[] =
              response.data.data.caseInfo.content.ScreenContent.LocalisedContent;
            const currentLang =
              sessionStorage.getItem('rsdk_locale')?.slice(0, 2).toUpperCase() || 'EN';

            setSummaryPageContent(summaryData.find(data => data.Language === currentLang));

            PCore.getPubSubUtils().subscribe(
              'languageToggleTriggered',
              ({ language }) => {
                setSummaryPageContent(
                  summaryData.find(data => data.Language === language.toUpperCase())
                );
              },
              'summarypageLanguageChange'
            );
          })
          .catch(() => {
            return false;
          });
      });
    } else if (serviceNotAvailable) {
      setCurrentDisplay('servicenotavailable');
    } else {
      setCurrentDisplay('loading');
    }
    if (!showPega) {
      setPageTitle();
    }
  }, [
    showResolutionPage,
    showPega,
    shutterServicePage,
    serviceNotAvailable,
    pCoreReady,
    showLandingPage,
    containerClosed
  ]);

  useEffect(() => {
    resumeOnRefresh(pConnect, pCoreReady, setShowLandingPage);
  }, [pCoreReady, showPega]);

  useEffect(() => {
    document.addEventListener('SdkConstellationReady', () => {
      PCore.onPCoreReady(() => {
        if (!pCoreReady) {
          setPCoreReady(true);
          PCore.getPubSubUtils().subscribe(
            PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
            () => {
              // console.log("SUBEVENT!!! showStartPageOnCloseContainerItem")
              setShowPega(false);
            },
            'showStartPageOnCloseContainerItem'
          );
          getSdkConfig().then(config => {
            if (config.timeoutConfig.secondsTilLogout) {
              setmillisecondsTillSignout(config.timeoutConfig.secondsTilLogout * 1000);
            }
          });
          loadBundles((sessionStorage.getItem('rsdk_locale') as BundleLanguage) || 'en_GB');
        }
      });
      settingTimer();
    });

    return () => {
      PCore?.getPubSubUtils().unsubscribe('CustomAssignmentFinished', 'CustomAssignmentFinished');
      PCore.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
        'showStartPageOnCloseContainerItem'
      );
    };
  }, []);

  /* ***
   * Application specific PCore subscriptions
   *
   * TODO Can this be made into a tidy helper? including its own clean up? A custom hook perhaps
   */
  document.addEventListener('SdkConstellationReady', () => {
    PCore.onPCoreReady(() => {
      PCore.getPubSubUtils().subscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
        () => {
          setShowPega(false);
        },
        'showStartPageOnCloseContainerItem'
      );
    });
    settingTimer();
    PCore.getStore().subscribe(() =>
      staySignedIn(
        setShowTimeoutModal,
        '',
        null,
        false,
        true,
        currentDisplay === 'resolutionpage',
        caseListApiParams
      )
    );

    PCore?.getPubSubUtils().subscribe(
      'CUSTOM_EVENT_BACK',
      () => {
        returnedToPortal(false);
      },
      'CUSTOM_EVENT_BACK'
    );
  });

  // And clean up

  useEffect(() => {
    return () => {
      PCore.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
        'showStartPageOnCloseContainerItem'
      );

      PCore.getPubSubUtils().unsubscribe('CUSTOM_EVENT_BACK', 'CUSTOM_EVENT_BACK');
    };
  }, []);

  useEffect(() => {
    getSdkConfig().then(config => {
      setShowLanguageToggleState(config?.cessationConfig?.showLanguageToggle);
    });
  }, []);

  if (currentDisplay === 'servicenotavailable') {
    return (
      <>
        <TimeoutPopup
          show={showTimeoutModal}
          millisecondsTillSignout={millisecondsTillSignout}
          staySignedinHandler={() =>
            staySignedIn(
              setShowTimeoutModal,
              inProgressCaseCountEndPoint,
              null,
              false,
              true,
              false,
              caseListApiParams
            )
          }
          signoutHandler={(e?) => {
            e?.preventDefault();
            triggerLogout(setIsLogout);
          }}
          autoSignoutHandler={(e?) => {
            e?.preventDefault();
            triggerLogout(setIsLogout, true);
          }}
          isAuthorised
          staySignedInButtonText='Stay signed in'
          signoutButtonText='Sign out'
        />
        <AppHeader
          appname={t('LEAVE_SELF_ASSESSMENT')}
          hasLanguageToggle={showLanguageToggleState}
          handleSignout={handleSignout}
          betafeedbackurl={`${hmrcURL}contact/beta-feedback?service=claim-child-benefit-frontend&backUrl=/fill-online/claim-child-benefit/recently-claimed-child-benefit`}
        />
        <div className='govuk-width-container'>
          <ApiServiceNotAvailable />
        </div>
        <AppFooter />
      </>
    );
  } else {
    return (
      <AppContext.Provider
        value={{
          appBacklinkProps: {},
          showLanguageToggle,
          serviceParam,
          serviceName: serviceNameAndHeader,
          appNameHeader: serviceNameAndHeader
        }}
      >
        <TimeoutPopup
          show={showTimeoutModal}
          millisecondsTillSignout={millisecondsTillSignout}
          staySignedinHandler={() =>
            staySignedIn(
              setShowTimeoutModal,
              inProgressCaseCountEndPoint,
              null,
              false,
              true,
              currentDisplay === 'resolutionpage',
              caseListApiParams
            )
          }
          signoutHandler={(e?) => {
            e?.preventDefault();
            triggerLogout(setIsLogout);
          }}
          autoSignoutHandler={(e?) => {
            e?.preventDefault();
            triggerLogout(setIsLogout, true);
          }}
          isAuthorised
          staySignedInButtonText='Stay signed in'
          signoutButtonText='Sign out'
        />
        {pConnect && (
          <AppHeader
            handleSignout={handleSignout}
            appname={t('LEAVE_SELF_ASSESSMENT')}
            hasLanguageToggle={showLanguageToggleState}
            isPegaApp={showPega}
            betafeedbackurl={`${hmrcURL}contact/beta-feedback?service=claim-child-benefit-frontend&backUrl=/fill-online/claim-child-benefit/recently-claimed-child-benefit`}
          />
        )}
        <div className='govuk-width-container'>
          {currentDisplay === 'shutterpage' ? (
            <ShutterServicePage />
          ) : (
            <>
              <div id='pega-part-of-page'>
                <div id='pega-root' className={`${isLogout ? 'visibility-hidden' : ''}`}></div>
              </div>
              {currentDisplay === 'landingpage' && pConnect && (
                <Landing
                  showPortalBanner={showPortalBanner}
                  isLogout={isLogout}
                  pConn={pConnect}
                  inProgressCaseCountEndPoint={inProgressCaseCountEndPoint}
                  createCaseEndpoint={createCaseApi}
                  buttonContent={t('CONTINUE_YOUR_REQUEST')}
                  title={t('YOUR_REQUEST')}
                  bannerContent={t('CES_PORTAL_NOTIFICATION_BANNER_CONTENT')}
                  handleCaseStart={handleCaseStart}
                  caseListApiParams={caseListApiParams}
                  setShutterServicePage={setShutterServicePage}
                ></Landing>
              )}
              {currentDisplay === 'resolutionpage' && (
                <SummaryPage
                  summaryContent={summaryPageContent?.Content}
                  summaryTitle={summaryPageContent?.Title}
                  summaryBanner={summaryPageContent?.Banner}
                  ref={summaryPageRef}
                />
              )}
            </>
          )}
        </div>

        {pConnect && <AppFooter />}
      </AppContext.Provider>
    );
  }
};
export default Cessation;
