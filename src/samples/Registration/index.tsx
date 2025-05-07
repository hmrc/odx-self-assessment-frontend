// @ts-nocheck - TypeScript type checking to be added soon
import React, { FunctionComponent, useState, useEffect } from 'react';
import { render } from 'react-dom';
import { useTranslation } from 'react-i18next';

import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';

import { sdkIsLoggedIn, getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import {
  initTimeout,
  staySignedIn
} from '../../components/AppComponents/TimeoutPopup/timeOutUtils';

import UserPortal from './UserPortal';
import AskHMRC from '../../components/AppComponents/AskHMRC';
import CaseDetails from '../../components/AppComponents/Landing/CaseDetails';
import setPageTitle, { registerServiceName } from '../../components/helpers/setPageTitleHelpers';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';

import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../sdk-local-component-map';
import { checkCookie, setCookie } from '../../components/helpers/cookie';
import ShutterServicePage from '../../components/AppComponents/ShutterServicePage';
import {
  triggerLogout,
  checkStatus,
  getCaseId,
  getCurrentLanguage
} from '../../components/helpers/utils';
import RegistrationAgeRestrictionInfo from './RegistrationAgeRestrictionInfo';
import AlreadyRegisteredUserMessage from './AlreadyRegisteredUserMessage';
import ApiServiceNotAvailable from '../../components/AppComponents/ApiErrorServiceNotAvailable';
import { setJourneyName } from '../../components/helpers/journeyRegistry';
import { TIMEOUT_115_SECONDS } from '../../components/helpers/constants';
import SummaryPage from '../../components/AppComponents/SummaryPage';
import checkAuthAndRedirectIfTens from '../../components/helpers/checkAuthAndRedirectIfTens';

declare const myLoadMashup: any;
let millisecondsTillSignout = TIMEOUT_115_SECONDS;

const Registration: FunctionComponent<any> = ({ journeyName }) => {
  const [pConn, setPConn] = useState<any>(null);
  const [bShowPega, setShowPega] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);
  const [bShowAppName, setShowAppName] = useState(false);
  const [bShowResolutionScreen, setShowResolutionScreen] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [serviceNotAvailable, setServiceNotAvailable] = useState(false);
  const [shutterServicePage, setShutterServicePage] = useState(false);
  const [showPortalBanner, setShowPortalBanner] = useState(false);
  const [inprogressRegistration, setInprogressRegistration] = useState([]);
  const [showAgeRestrictionInfo, setshowAgeRestrictionInfo] = useState(false);
  const [showAlreadyRegisteredUserMessage, setShowAlreadyRegisteredUserMessage] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [summaryPageContent, setSummaryPageContent] = useState<any>({
    content: null,
    title: null,
    banner: null
  });
  const [rootProps, setRootProps] = useState({});
  const { t } = useTranslation();
  // This needs to be changed in future when we handle the shutter for multiple service, for now this one's for single service
  const featureID = 'SA';
  const featureType = 'Service';
  const caseStatusForRestrictedUser = 'resolved-rejectedvulnerable';
  const caseStatusForAlreadyRegisteredUser = 'resolved-rejectedutrexists';

  function resetAppDisplay() {
    setShowUserPortal(false);
    setShowResolutionScreen(false);
    setShowPega(false);
    setshowAgeRestrictionInfo(false);
    setShowAlreadyRegisteredUserMessage(false);
  }

  function displayPega() {
    resetAppDisplay();
    setShowPega(true);
  }

  function displayUserPortal() {
    resetAppDisplay();
    setShowUserPortal(true);
  }

  function displayServiceNotAvailable() {
    setServiceNotAvailable(true);
  }

  function getResolutionContent() {
    setSummaryPageContent({
      content: null,
      title: null,
      banner: null
    });

    const caseId = getCaseId();

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

          PCore.getPubSubUtils().subscribe('summarypageLanguageChange');

          resetAppDisplay();
          setShowResolutionScreen(true);
        })
        .catch(() => {
          return false;
        });
    });
  }

  function assignmentFinished() {
    setShowPega(false);

    getResolutionContent();
  }

  function displayShowAgeRestrictionInfo() {
    resetAppDisplay();
    setshowAgeRestrictionInfo(true);
  }

  function displayShowAlreadyRegisteredUserMessage() {
    resetAppDisplay();
    setShowAlreadyRegisteredUserMessage(true);
  }

  const serviceName = t('REGISTER_FOR_SELF_ASSESSMENT');
  registerServiceName(serviceName);
  setJourneyName(journeyName);

  useEffect(() => {
    setPageTitle();
  }, [showUserPortal, bShowPega, bShowResolutionScreen, serviceName]);

  function createCase() {
    displayPega();

    const startingFields = {
      NotificationLanguage: getCurrentLanguage()
    };

    PCore.getMashupApi()
      .createCase('HMRC-SA-Work-Registration', PCore.getConstants().APP.APP, {
        startingFields,
        pageName: '',
        channelName: ''
      })
      .then(() => {
        const status = checkStatus();
        if (status?.toLowerCase() === caseStatusForRestrictedUser) {
          displayShowAgeRestrictionInfo();
        } else if (status?.toLowerCase() === caseStatusForAlreadyRegisteredUser) {
          displayShowAlreadyRegisteredUserMessage();
        }
      });
  }

  function closeContainer() {
    setShowPega(false);
  }

  // Calls data page to fetch in progress registration,
  // This then sets inprogress registration state value to the registration details.
  // This function also sets 'isloading' value to true before making d_page calls
  function fetchInProgressRegistrationData() {
    // setLoadingInProgressRegistration(true);
    const pyAssignmentID = sessionStorage.getItem('assignmentID');
    if (
      !pyAssignmentID ||
      pyAssignmentID === 'undefined' ||
      pyAssignmentID.includes('MANUALINVESTIGATION')
    ) {
      let inProgressRegData: any = [];
      const options = { invalidateCache: true };

      // @ts-ignore
      PCore.getDataPageUtils()
        .getDataAsync(
          'D_RegistrantWorkAssignmentSACases',
          'root',
          {
            CaseType: 'HMRC-SA-Work-Registration'
          },
          {},
          {},
          options
        )
        .then(resp => {
          if (!resp.resultCount) {
            createCase();
          } else {
            resp = resp.data.slice(0, 10);
            inProgressRegData = resp;
            setInprogressRegistration(inProgressRegData);
          }
          // setLoadingInProgressRegistration(false);
        });
    } else {
      const container = PCore.getContainerUtils().getActiveContainerItemName(
        `${PCore.getConstants().APP.APP}/primary`
      );
      const target = `${PCore.getConstants().APP.APP}/${container}`;
      const openAssignmentOptions = { containerName: container };
      const assignmentID = sessionStorage.getItem('assignmentID');
      PCore.getMashupApi()
        .openAssignment(assignmentID, target, openAssignmentOptions)
        .then(() => {
          scrollToTop();
        })
        .catch((err: Error) => console.log('Error : ', err)); // eslint-disable-line no-console
    }
    sessionStorage.setItem('assignmentFinishedFlag', 'false');
  }

  function cancelAssignment() {
    fetchInProgressRegistrationData();
    displayUserPortal();
    PCore.getContainerUtils().closeContainerItem(
      PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
      { skipDirtyCheck: true }
    );
  }

  async function customAssignmentFinished() {
    const sdkConfig = await getSdkConfig();
    if (sdkConfig.showResolutionStatuses?.includes(checkStatus())) {
      setShowPega(false);
      getResolutionContent();
    }
  }

  function establishPCoreSubscriptions() {
    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
      () => {
        assignmentFinished();
      },
      'assignmentFinished'
    );
    PCore.getPubSubUtils().subscribe(
      'assignmentFinished',
      () => {
        const assignmentFinishedFlag = sessionStorage.getItem('assignmentFinishedFlag');
        if (assignmentFinishedFlag !== 'true') {
          setShowUserPortal(false);
          setShowPega(false);
          const containername = PCore.getContainerUtils().getActiveContainerItemName(
            `${PCore.getConstants().APP.APP}/primary`
          );

          const status = PCore.getStoreValue('.pyStatusWork', 'caseInfo.content', containername);

          if (status === 'Resolved-Discarded') {
            displayServiceNotAvailable();

            PCore.getContainerUtils().closeContainerItem(containername);

            sessionStorage.setItem('assignmentFinishedFlag', 'true');
            PCore?.getPubSubUtils().unsubscribe(
              PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
              'assignmentFinished'
            );
          } else {
            setShowPega(false);
            getResolutionContent();
          }
        }
      },
      'assignmentFinished'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        cancelAssignment();
        setShowPortalBanner(true);
      },
      'cancelAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
      () => {
        closeContainer();
      },
      'closeContainer'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_OPENED,
      () => {
        displayPega();
      },
      'continueAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_CREATED,
      () => {
        displayPega();
      },
      'continueCase'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED,
      () => {
        cancelAssignment();
        setShowPortalBanner(true);
      },
      'savedCase'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_OPENED,
      () => {
        displayPega();
      },
      'continueCase'
    );

    PCore.getPubSubUtils().subscribe('CustomAssignmentFinished', customAssignmentFinished);
  }

  useEffect(() => {
    if (!sdkIsLoggedIn()) {
      // login();     // Login now handled at TopLevelApp
    } else {
      setShowUserPortal(true);
    }
  }, [bShowAppName]);

  // from react_root.js with some modifications
  function RootComponent(props) {
    const PegaConnectObj = createPConnectComponent();
    const thePConnObj = <PegaConnectObj {...props} />;

    const theComp = (
      <StoreContext.Provider
        value={{
          store: PCore.getStore(),
          displayOnlyFA: true,
          isMashup: true
        }}
      >
        {thePConnObj}
      </StoreContext.Provider>
    );

    return theComp;
  }

  // Function to force re-render the pega Root component
  const forceRefreshRootComponent = () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    initialRender(rootProps);
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

  /**
   * Callback from onPCoreReady that's called once the top-level render object
   * is ready to be rendered
   * @param inRenderObj the initial, top-level PConnect object to render
   */
  function initialRender(inRenderObj) {
    // loadMashup does its own thing so we don't need to do much/anything here
    // // modified from react_root.js render
    const {
      props,
      domContainerID = null,
      componentName,
      portalTarget,
      styleSheetTarget
    } = inRenderObj;

    const thePConn = props.getPConnect();

    setPConn(thePConn);

    let target: any = null;

    if (domContainerID !== null) {
      target = document.getElementById(domContainerID);
    } else if (portalTarget !== null) {
      target = portalTarget;
    }

    // Note: RootComponent is just a function (declared below)
    const Component: any = RootComponent;

    if (componentName) {
      Component.displayName = componentName;
    }

    const theComponent = (
      <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />
    );

    // Initial render of component passed in (which should be a RootContainer)
    render(<React.Fragment>{theComponent}</React.Fragment>, target);
  }

  /**
   * kick off the application's portal that we're trying to serve up
   */
  function startMashup() {
    // NOTE: When loadMashup is complete, this will be called.
    PCore.onPCoreReady(async renderObj => {
      if (await checkAuthAndRedirectIfTens()) {
        return;
      }
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();
      establishPCoreSubscriptions();
      setShowAppName(true);

      // Fetches timeout length config
      getSdkConfig()
        .then(sdkConfig => {
          if (sdkConfig.timeoutConfig.secondsTilLogout)
            millisecondsTillSignout = sdkConfig.timeoutConfig.secondsTilLogout * 1000;
        })
        .finally(() => {
          // Subscribe to any store change to reset timeout counter
          PCore.getStore().subscribe(() => {
            staySignedIn(
              setShowTimeoutModal,
              'D_RegistrantWorkAssignmentSACases',
              null,
              false,
              false,
              bShowResolutionScreen,
              {
                CaseType: 'HMRC-SA-Work-Registration'
              }
            );
          });
          initTimeout(setShowTimeoutModal, setIsLogout);
        });

      // TODO : Consider refactoring 'en_GB' reference as this may need to be set elsewhere
      PCore.getEnvironmentInfo().setLocale(sessionStorage.getItem('rsdk_locale') || 'en_GB');
      // PCore.getLocaleUtils().resetLocaleStore();
      // PCore.getLocaleUtils().loadLocaleResources([
      //   PCore.getLocaleUtils().GENERIC_BUNDLE_KEY,
      //   '@BASECLASS!DATAPAGE!D_LISTREFERENCEDATABYTYPE'
      // ]);
      setRootProps(renderObj);
      initialRender(renderObj);

      // operatorId = PCore.getEnvironmentInfo().getOperatorIdentifier();

      /* Functionality to set the device id in the header for use in CIP.
      Device id is unique and will be stored on the user device / browser cookie */
      const COOKIE_PEGAODXDI = 'pegaodxdi';
      let deviceID = checkCookie(COOKIE_PEGAODXDI);
      if (deviceID) {
        setCookie(COOKIE_PEGAODXDI, deviceID, 3650);
        PCore.getRestClient().getHeaderProcessor().registerHeader('deviceid', deviceID);
      } else {
        PCore.getDataPageUtils()
          .getPageDataAsync('D_UserSession', 'root')
          .then(res => {
            deviceID = res.DeviceId;
            setCookie(COOKIE_PEGAODXDI, deviceID, 3650);
            PCore.getRestClient().getHeaderProcessor().registerHeader('deviceid', deviceID);
          });
      }
      fetchInProgressRegistrationData();
    });

    // Initialize the SdkComponentMap (local and pega-provided)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
      // eslint-disable-next-line no-console
      console.log(`SdkComponentMap initialized`);
    });
    PCore.getDataPageUtils()
      .getPageDataAsync('D_ShutterLookup', 'root', {
        FeatureID: featureID,
        FeatureType: featureType
      })
      .then(resp => {
        const isShuttered = resp.Shuttered;
        if (isShuttered) {
          setShutterServicePage(true);
          resetAppDisplay();
        } else {
          setShutterServicePage(false);
          displayUserPortal();
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      });

    // load the Mashup and handle the onPCoreEntry response that establishes the
    //  top level Pega root element (likely a RootContainer)

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  // One time (initialization) subscriptions and related unsubscribe
  useEffect(() => {
    document.addEventListener('SdkConstellationReady', () => {
      // start the portal
      startMashup();
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
        'cancelAssignment'
      );
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.ASSIGNMENT_OPENED,
        'continueAssignment'
      );
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_OPENED,
        'continueCase'
      );

      PCore?.getPubSubUtils().unsubscribe('CustomAssignmentFinished');

      PCore?.getPubSubUtils().unsubscribe('closeContainer');
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
        'assignmentFinished'
      );
    };
  }, []);

  function handleSignout(e?) {
    e?.preventDefault();
    triggerLogout(setIsLogout);
  }
  const handleCaseContinue = () => {
    setShowUserPortal(false);
  };

  const renderContent = () => {
    if (serviceNotAvailable) {
      return <ApiServiceNotAvailable />;
    } else if (shutterServicePage) {
      return <ShutterServicePage />;
    } else if (showAgeRestrictionInfo) {
      return <RegistrationAgeRestrictionInfo />;
    } else if (showAlreadyRegisteredUserMessage) {
      return <AlreadyRegisteredUserMessage />;
    } else if (bShowResolutionScreen) {
      return (
        <SummaryPage
          summaryContent={summaryPageContent?.Content}
          summaryTitle={summaryPageContent?.Title}
          summaryBanner={summaryPageContent?.Banner}
        />
      );
    } else {
      return (
        <>
          <div id='pega-part-of-page' className={isLogout ? 'visibility-hidden' : ''}>
            <div id='pega-root'></div>
          </div>
          {showUserPortal && (
            <UserPortal showPortalBanner={showPortalBanner} isLogout={isLogout}>
              {inprogressRegistration.length > 0 && (
                <>
                  <CaseDetails
                    thePConn={pConn}
                    data={inprogressRegistration}
                    rowClickAction='OpenAssignment'
                    buttonContent={t('CONTINUE_YOUR_REGISTRATION')}
                    title={t('YOUR_REGISTRATION')}
                    handleCaseContinue={handleCaseContinue}
                  />
                  <AskHMRC />
                </>
              )}
            </UserPortal>
          )}
        </>
      );
    }
  };

  return (
    <>
      <TimeoutPopup
        show={showTimeoutModal}
        millisecondsTillSignout={millisecondsTillSignout}
        staySignedinHandler={() =>
          staySignedIn(
            setShowTimeoutModal,
            'D_RegistrantWorkAssignmentSACases',
            null,
            false,
            true,
            bShowResolutionScreen,
            {
              CaseType: 'HMRC-SA-Work-Registration'
            }
          )
        }
        signoutHandler={(e?) => {
          e?.preventDefault();
          triggerLogout(setIsLogout);
        }}
      />

      {pConn && (
        <AppHeader
          handleSignout={handleSignout}
          appname={t('REGISTER_FOR_SELF_ASSESSMENT')}
          hasLanguageToggle
          isPegaApp={bShowPega}
        />
      )}
      <div className='govuk-width-container'>{renderContent()}</div>

      {pConn && <AppFooter />}
    </>
  );
};

export default Registration;
