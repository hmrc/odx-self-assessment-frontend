import { getSdkConfig, logout } from '@pega/auth/lib/sdk-auth-manager';
import apiConfig from './constants';
import { getJourneyName } from './journeyRegistry';

export const scrollToTop = () => {
  const position = document.getElementById('#main-content')?.offsetTop || 0;
  document.body.scrollTop = position;
  document.documentElement.scrollTop = position;
};

export const GBdate = date => {
  const d = String(date).split('-');
  return d.length > 1 ? `${d[2]}/${d[1]}/${d[0]}` : date;
};

export const checkErrorMsgs = (errorMsgs = [], fieldIdentity = '', fieldElement = '') => {
  return errorMsgs.find(
    element =>
      element.message.fieldId === fieldIdentity || element.message.fieldId.startsWith(fieldElement)
  );
};

export const shouldRemoveFormTagForReadOnly = (pageName: string) => {
  const arrContainerNamesFormNotRequired = ['Your date of birth'];
  return arrContainerNamesFormNotRequired.includes(pageName);
};

export const getServiceShutteredStatus = async (): Promise<boolean> => {
  interface ResponseType {
    data: { Shuttered: boolean };
  }
  try {
    const sdkConfig = await getSdkConfig();
    const urlConfig = new URL(
      `${sdkConfig.serverConfig.infinityRestServerUrl}/app/${sdkConfig.serverConfig.appAlias}/api/application/v2/data_views/D_ShutterLookup`
    ).href;

    const featureID = apiConfig[getJourneyName()].shuttering.featureID;

    const featureType = 'Service';

    const parameters = new URLSearchParams(
      `{FeatureID: ${featureID}, FeatureType: ${featureType}}`
    );

    const url = `${urlConfig}?dataViewParameters=${parameters}`;
    const { invokeCustomRestApi } = PCore.getRestClient();
    /* eslint-disable */
    return invokeCustomRestApi(
      url,
      {
        method: 'GET',
        body: '',
        headers: '',
        withoutDefaultHeaders: false
      },
      ''
    )
      .then((response: ResponseType) => {
        return response.data.Shuttered;
      })
      .catch((error: Error) => {
        console.log(error);
        return false;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getAskHmrcSubLink = () => {
  return apiConfig[getJourneyName()]?.askHmrcSubLink;
};

export const isSingleEntity = (propReference: string, getPConnect) => {
  const containerName = getPConnect().getContainerName();
  const context = PCore.getContainerUtils().getActiveContainerItemContext(
    `${PCore.getConstants().APP.APP}/${containerName}`
  );

  const count = PCore.getStoreValue(
    propReference.split('[')[0],
    'caseInfo.content',
    context
  )?.length;

  if (typeof count !== 'undefined' && count === 1) return true;
};

// This method will remove redundant string separated by seperatorexport
export const removeRedundantString = (redundantString: string, separator: string = '.') => {
  const list = redundantString.split(separator);
  const newList = [];
  let uniqueString = '';
  const emailPattern = new RegExp(/\S+@\S+\.\S+/);
  const checkEmail = emailPattern.test(redundantString);
  if (list.length > 0) {
    list.forEach(item => {
      if (!newList.includes(item.trim())) {
        newList.push(item);
      }
    });
    if (newList.length > 0) {
      newList.forEach(element => {
        uniqueString =
          uniqueString + (uniqueString.length <= 0 ? '' : checkEmail ? '.' : '. ') + element.trim();
      });
    }
  }
  return uniqueString;
};

export const checkStatus = () => {
  const containername = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const status = PCore.getStoreValue('.pyStatusWork', 'caseInfo.content', containername);
  return status;
};

export const clearSessionStorageExcept = (excludedKeys: string[]) => {
  for (var item = 0; item < sessionStorage.length; item++) {
    var key = sessionStorage.key(item);

    if (excludedKeys.indexOf(key) === -1) {
      sessionStorage.removeItem(key);
    }
  }
};

export const triggerLogout = (setIsLogout, isAutoSignout: boolean = false) => {
  let authType = 'gg';
  getSdkConfig().then(sdkConfig => {
    const sdkConfigAuth = sdkConfig.authConfig;
    authType = sdkConfigAuth.authService;

    const authServiceList = {
      gg: 'GovGateway',
      'gg-sa': 'GovGateway-SA',
      'gg-sa-dev': 'GovGateway-SA-dev'
    };
    const authService = authServiceList[authType];

    setIsLogout(false);

    // If the container / case is opened then close the container on signout to prevent locking.
    const activeCase = PCore.getContainerUtils().getActiveContainerItemContext('app/primary');
    if (activeCase) {
      PCore.getContainerUtils().closeContainerItem(activeCase, { skipDirtyCheck: true });
    }

    type responseType = { URLResourcePath2: string };
    const application = isAutoSignout
      ? apiConfig[getJourneyName()]?.autoSignoutApplication
      : apiConfig[getJourneyName()]?.application;

    PCore.getDataPageUtils()
      .getPageDataAsync('D_AuthServiceLogout', 'root', {
        AuthService: authService,
        Application: application
      })
      // @ts-ignore
      .then((response: unknown) => {
        const logoutUrl = (response as responseType).URLResourcePath2;

        logout().then(() => {
          if (logoutUrl) {
            // Clear previous sessioStorage values
            clearSessionStorageExcept(['isAnsSaved']);
            window.location.href = logoutUrl;
          }
        });
      });
  });
};

export const getWorkareaContainerName = () => {
  const primaryContainer = PCore.getContainerUtils().getActiveContainerItemContext(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const containerName = PCore.getContainerUtils().getActiveContainerItemName(
    `${primaryContainer}/workarea`
  );
  return containerName;
};

export const getCaseId = () => {
  const context = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  return PCore.getStoreValue('.ID', 'caseInfo', context);
};

export const resumeOnRefresh = (pConnect, pCoreReady, setShowLandingPage) => {
  const pyAssignmentID = sessionStorage.getItem('assignmentID');
  if (pyAssignmentID && pCoreReady) {
    const container = pConnect?.getContainerName();
    const target = `${PCore?.getConstants().APP.APP}/${container}`;
    const openAssignmentOptions = { pageName: '', channelName: '' };
    const assignmentID = sessionStorage.getItem('assignmentID');
    PCore.getMashupApi().openAssignment(assignmentID, target, openAssignmentOptions);
    setShowLandingPage(false);
  }
};

// formatDecimal is so that 1.05 becomes 1.05 and any numbers with zeros such as 1.00 become 1.
export const formatDecimal = (decimalAmount: string) => Number(decimalAmount) * 1;

export const getCurrentLanguage = () =>
  sessionStorage.getItem('rsdk_locale').slice(0, 2).toLowerCase() || 'en';

export const getOrdinalSuffix = (num: number): string => {
  if (num <= 0) return `${num}`;

  const lastTwoDigits = num % 100; // Handle special cases like 11, 12, 13
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  const lastDigit = num % 10;
  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};
