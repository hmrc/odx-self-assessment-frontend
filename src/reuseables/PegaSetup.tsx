import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import AppContext, { AppContextValues } from './AppContext';
import localSdkComponentMap from '../../sdk-local-component-map';
import { checkCookie, setCookie } from '../components/helpers/cookie';
import { checkStatus, getServiceShutteredStatus } from '../components/helpers/utils';
import checkAuthAndRedirectIfTens from '../components/helpers/checkAuthAndRedirectIfTens';

declare const myLoadMashup: any;
declare const PCore: any;

/*
 * This fucntion is to invoke shuttering service
 */
async function checkShutterService({ setShutterServicePage, setIsPegaLoading }) {
  try {
    const status = await getServiceShutteredStatus();
    setShutterServicePage(status);
  } catch (error) {
    setShutterServicePage(false);
    // Handle error appropriately, e.g., log it or show a notification
    console.error('Error setting shutter status:', error); // eslint-disable-line
  } finally {
    setIsPegaLoading(false);
  }
}

export function establishPCoreSubscriptions({
  setShowPega,
  setShowResolutionPage,
  setCaseId,
  setCaseStatus,
  setServiceNotAvailable,
  setAssignmentCancelled,
  setContainerClosed
}) {
  /* ********************************************
   * Registers close active container on end of assignment processing
   ********************************************* */
  function showResolutionScreen() {
    // PM!! getClaimsCaseID();
    const context = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    const status = PCore.getStoreValue('.status', 'caseInfo', context);
    const id = PCore.getStoreValue('.ID', 'caseInfo', context);
    setCaseStatus(status);
    setCaseId(id);
    PCore.getContainerUtils().closeContainerItem(
      PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
      { skipDirtyCheck: true }
    );
    setShowResolutionPage(true);
  }
  /* *********************************************
   * closes container item if case is resolved-discarded, on assignmentFinished
   ******************************************** */
  function handleServiceNotAvailable() {
    const assignmentFinishedFlag = sessionStorage.getItem('assignmentFinishedFlag');
    const containername = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    const context = PCore.getContainerUtils().getActiveContainerItemName(
      `${containername}/workarea`
    );
    const status = PCore.getStoreValue('.pyStatusWork', 'caseInfo.content', context);
    setContainerClosed(false);
    if (assignmentFinishedFlag !== 'true') {
      if (status === 'Resolved-Discarded') {
        setServiceNotAvailable(true);
        PCore.getContainerUtils().closeContainerItem(context);
        //  Temporary workaround to restrict infinite update calls
        sessionStorage.setItem('assignmentFinishedFlag', 'true');
        PCore?.getPubSubUtils().unsubscribe(
          PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
          'assignmentFinished'
        );
      } else {
        showResolutionScreen();
        setShowPega(false);
      }
    }
  }

  PCore.getPubSubUtils().subscribe(
    'assignmentFinished',
    handleServiceNotAvailable,
    'handleServiceNotAvailableOnAssignmentFinished'
  );

  async function customAssignmentFinished() {
    const sdkConfig = await getSdkConfig();
    setContainerClosed(false);
    if (sdkConfig.showResolutionStatuses?.includes(checkStatus())) {
      showResolutionScreen();
    }
  }

  PCore.getPubSubUtils().subscribe('CustomAssignmentFinished', customAssignmentFinished);

  /* ********************************
   * On Cancel event, ?
   ******************************** */
  PCore.getPubSubUtils().subscribe(
    PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
    () => {
      setAssignmentCancelled(true);
    },
    'cancelAssignment'
  );

  /* ********************************
   * On close container event, ?
   ******************************** */
  PCore.getPubSubUtils().subscribe(
    PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
    () => {
      setShowResolutionPage(false);
      setContainerClosed(true);
    },
    'closeContainer'
  );

  /* ********************************
   * On assignment opened, toggle show pega
   ******************************** */
  PCore.getPubSubUtils().subscribe(
    PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_OPENED,
    () => {
      setShowPega(true);
    },
    'showPegaWhenAssignmentOpened'
  );

  /* ********************************
   * On case created, toggle show pega
   ******************************** */
  PCore.getPubSubUtils().subscribe(
    PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_CREATED,
    () => {
      setShowPega(true);
    },
    'showPegaWhenCaseCreated'
  );

  PCore.getPubSubUtils().subscribe(
    PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED,
    () => {
      setAssignmentCancelled(true);
    },
    'savedCase'
  );

  PCore.getPubSubUtils().subscribe(
    PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_OPENED,
    () => {
      setShowPega(true);
    },
    'continueCase'
  );
}

/* ****
 * Defines the Root Component used in pega mashup
 *
 * DXAPI Note, has been extended to accept further context values
 *
 *  */

export function RootComponent(props) {
  const PegaConnectObj = createPConnectComponent();
  const thePConnObj = <PegaConnectObj {...props} />;

  // NOTE: For Embedded mode, we add in displayOnlyFA and isMashup to our React context
  // so the values are available to any component that may need it.
  const theComp = (
    <StoreContext.Provider
      value={{
        store: PCore.getStore(),
        displayOnlyFA: true,
        isMashup: true,
        ...props.contextExtensionValues
      }}
    >
      {thePConnObj}
    </StoreContext.Provider>
  );

  return theComp;
}

/* *
 * Callback from onPCoreReady that's called once the top-level render object
 * is ready to be rendered
 * @param inRenderObj the initial, top-level PConnect object to render
 */
function initialRender(inRenderObj, setAssignmentPConnect, _AppContextValues: AppContextValues) {
  // loadMashup does its own thing so we don't need to do much/anything here
  // modified from react_root.js render
  const {
    props,
    domContainerID = null,
    componentName,
    portalTarget,
    styleSheetTarget
  } = inRenderObj;

  const thePConn = props.getPConnect();
  setAssignmentPConnect(thePConn);
  // PM!! setPConn(thePConn);

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
    <Component
      {...props}
      portalTarget={portalTarget}
      styleSheetTarget={styleSheetTarget}
      contextExtensionValues={{ setAssignmentPConnect }}
    />
  );

  // Initial render of component passed in (which should be a RootContainer)
  try {
    render(
      <AppContext.Provider value={_AppContextValues}>
        <React.Fragment>{theComponent}</React.Fragment>
      </AppContext.Provider>,
      target
    );
  } catch {
    // eslint-disable-next-line no-console
    console.log('Error - Pega root element not found');
  }
}

/*
 * kick off the application's portal that we're trying to serve up
 */
export function startMashup(
  {
    setShowPega,
    setShowResolutionPage,
    setCaseId,
    setCaseStatus,
    setAssignmentPConnect,
    setShutterServicePage,
    setServiceNotAvailable,
    setAssignmentCancelled,
    setContainerClosed,
    setIsPegaLoading,
    setRootProps
  },
  _AppContextValues: AppContextValues,
  checkDefaultShutteringEnabled: boolean
) {
  // NOTE: When loadMashup is complete, this will be called.
  PCore.onPCoreReady(async renderObj => {
    if (await checkAuthAndRedirectIfTens()) {
      return;
    }
    // Check that we're seeing the PCore version we expect
    compareSdkPCoreVersions();
    establishPCoreSubscriptions({
      setShowPega,
      setShowResolutionPage,
      setCaseId,
      setCaseStatus,
      setServiceNotAvailable,
      setAssignmentCancelled,
      setContainerClosed
    });

    // TODO : Consider refactoring 'en_GB' reference as this may need to be set elsewhere
    PCore.getEnvironmentInfo().setLocale(sessionStorage.getItem('rsdk_locale') || 'en_GB');

    setRootProps(renderObj);
    initialRender(renderObj, setAssignmentPConnect, _AppContextValues);

    /* Functionality to set the device id in the header for use in CIP.
      Device id is unique and will be stored on the user device / browser cookie */
    const COOKIE_PEGAODXDI = 'pegaodxdi';
    let deviceID = checkCookie(COOKIE_PEGAODXDI);
    if (deviceID) {
      setCookie(COOKIE_PEGAODXDI, deviceID, 3650);
      PCore.getRestClient().getHeaderProcessor().registerHeader('deviceid', deviceID);
    } else {
      // @ts-ignore
      const dpagepromise = PCore.getDataPageUtils().getPageDataAsync(
        'D_UserSession',
        'root'
      ) as Promise<any>;
      dpagepromise.then(res => {
        deviceID = res.DeviceId;
        setCookie(COOKIE_PEGAODXDI, deviceID, 3650);
        PCore.getRestClient().getHeaderProcessor().registerHeader('deviceid', deviceID);
      });
    }
  });

  // Initialize the SdkComponentMap (local and pega-provided)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
    // eslint-disable-next-line no-console
    console.log(`SdkComponentMap initialized`);
  });

  if (checkDefaultShutteringEnabled)
    checkShutterService({ setShutterServicePage, setIsPegaLoading });

  // load the Mashup and handle the onPCoreEntry response that establishes the
  //  top level Pega root element (likely a RootContainer)
  myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
}

// One time (initialization) subscriptions and related unsubscribe
export const useStartMashup = (
  _AppContextValues: AppContextValues,
  checkDefaultShutteringEnabled = true
) => {
  const [showPega, setShowPega] = useState(false);
  const [showResolutionPage, setShowResolutionPage] = useState(false);
  const [shutterServicePage, setShutterServicePage] = useState(false);
  const [serviceNotAvailable, setServiceNotAvailable] = useState(false);
  const [assignmentCancelled, setAssignmentCancelled] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [assignmentPConnect, setAssignmentPConnect] = useState(null);
  const [containerClosed, setContainerClosed] = useState(false);
  const [isPegaLoading, setIsPegaLoading] = useState(true);
  const [rootProps, setRootProps] = useState({});

  useEffect(() => {
    document.addEventListener('SdkConstellationReady', () => {
      // start the portal
      if (!assignmentPConnect) {
        startMashup(
          {
            setShowPega,
            setShowResolutionPage,
            setCaseId,
            setCaseStatus,
            setAssignmentPConnect,
            setShutterServicePage,
            setServiceNotAvailable,
            setAssignmentCancelled,
            setContainerClosed,
            setIsPegaLoading,
            setRootProps
          },
          _AppContextValues,
          checkDefaultShutteringEnabled
        );
      }
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      if (typeof PCore !== 'undefined')
        PCore?.getPubSubUtils().unsubscribe(
          PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
          'cancelAssignment'
        );
      PCore?.getPubSubUtils().unsubscribe('CustomAssignmentFinished');
      PCore?.getPubSubUtils().unsubscribe('closeContainer');
    };
  }, []);

  const renderRootComponent = () => {
    initialRender(rootProps, setAssignmentPConnect, _AppContextValues)
  }

  return {
    showPega,
    setShowPega,
    showResolutionPage,
    setShowResolutionPage,
    caseId,
    shutterServicePage,
    setShutterServicePage,
    caseStatus,
    serviceNotAvailable,
    setServiceNotAvailable,
    assignmentPConnect,
    assignmentCancelled,
    setAssignmentCancelled,
    containerClosed,
    isPegaLoading,
    renderRootComponent,
    rootProps
  };
};
