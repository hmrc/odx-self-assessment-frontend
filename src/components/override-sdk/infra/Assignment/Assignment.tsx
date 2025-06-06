import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  getServiceShutteredStatus,
  scrollToTop,
  shouldRemoveFormTagForReadOnly,
  removeRedundantString,
  getCurrentLanguage
} from '../../../helpers/utils';
import ErrorSummary from '../../../BaseComponents/ErrorSummary/ErrorSummary';
import { DateErrorFormatter, DateErrorTargetFields } from '../../../helpers/formatters/DateErrorFormatter';
import Button from '../../../BaseComponents/Button/Button';
import setPageTitle from '../../../helpers/setPageTitleHelpers';
import { SdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import MainWrapper from '../../../BaseComponents/MainWrapper';
import ShutterServicePage from '../../../../components/AppComponents/ShutterServicePage';
import { ErrorMsgContext } from '../../../helpers/HMRCAppContext';
import useServiceShuttered from '../../../helpers/hooks/useServiceShuttered';
import dayjs from 'dayjs';
import AskHMRC from '../../../../components/AppComponents/AskHMRC';
import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks';

export interface ErrorMessageDetails {
  message: string;
  fieldId: string;
  pageRef: string;
  clearMessageProperty: string;
}

interface OrderedErrorMessage {
  message: ErrorMessageDetails;
  displayOrder: string;
}

declare const PCore: any;
export default function Assignment(props) {
  const { getPConnect, children, itemKey, isCreateStage } = props;
  const thePConn = getPConnect();
  const [arSecondaryButtons, setArSecondaryButtons] = useState([]);
  const [actionButtons, setActionButtons] = useState<any>({});
  const serviceShuttered = useServiceShuttered();

  const AssignmentCard = SdkComponentMap.getLocalComponentMap().AssignmentCard
    ? SdkComponentMap.getLocalComponentMap().AssignmentCard
    : SdkComponentMap.getPegaProvidedComponentMap().AssignmentCard;

  const actionsAPI = thePConn.getActionsApi();
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Assignment';
  const localeReference = `${getPConnect().getCaseInfo().getClassName()}!CASE!${getPConnect().getCaseInfo().getName()}`.toUpperCase();

  // store off bound functions to above pointers
  const finishAssignment = actionsAPI.finishAssignment.bind(actionsAPI);
  const navigateToStep = actionsAPI.navigateToStep.bind(actionsAPI);
  const cancelAssignment = actionsAPI.cancelAssignment.bind(actionsAPI);
  const saveAssignment = actionsAPI.saveAssignment?.bind(actionsAPI);
  const cancelCreateStageAssignment = actionsAPI.cancelCreateStageAssignment.bind(actionsAPI);
  const [errorMessages, setErrorMessages] = useState<OrderedErrorMessage[]>([]);
  const [serviceShutteredStatus, setServiceShutteredStatus] = useState(serviceShuttered);
  const [hasAutoCompleteError, setHasAutoCompleteError] = useState('');
  const [header, setHeader] = useState('');
  const isOnlyFieldDetails = useIsOnlyField(null, children); // .isOnlyField;
  let lang = getCurrentLanguage();
  const [selectedLang, setSelectedLang] = useState(lang);

  const context = getPConnect().getContextName();

  useEffect(() => {
    setServiceShutteredStatus(serviceShuttered);
  }, [serviceShuttered]);

  const callLocalActionSilently = async () => {
    const { invokeRestApi, invokeCustomRestApi, getCancelTokenSource, isRequestCanceled } = PCore.getRestClient();
    const cancelTokenSource = getCancelTokenSource();
    lang = getCurrentLanguage();
    const LOCAL_ACTION_NAME = lang === 'en' ? 'SwitchLanguageToEnglish' : 'SwitchLanguageToWelsh';

    const caseID = thePConn.getCaseInfo()?.getKey();
    const actionContext = thePConn.getContextName();

    try {
      const response = await invokeRestApi('caseWideActions', {
        queryPayload: {
          caseID,
          actionID: LOCAL_ACTION_NAME
        },
        // passing cancel token so that we can cancel the request using cancelTokenSource
        cancelTokenSource: cancelTokenSource.token
      });
      // get etag
      let updatedEtag = response.headers.etag;

      const response2 = await invokeCustomRestApi(
        `/api/application/v2/cases/${caseID}/actions/${LOCAL_ACTION_NAME}?excludeAdditionalActions=true&viewType=form`,
        {
          method: 'PATCH',
          headers: {
            'if-match': updatedEtag
          }
        },
        actionContext
      );
      // get etag
      updatedEtag = response2.headers.etag;

      // update the etag in the case context
      PCore.getContainerUtils().updateCaseContextEtag(actionContext, updatedEtag);
    } catch (error) {
      // handle error
      if (isRequestCanceled(error)) {
        cancelTokenSource.cancel();
      }
    }
  };

  async function refreshView() {
    // this will refresh the case view and load all required translations
    try {
      await callLocalActionSilently();
      await thePConn.getActionsApi().refreshCaseView(thePConn.getCaseInfo()?.getKey(), '', thePConn.getPageReference(), {
        autoDetectRefresh: true
      });

      // emit this event to reload the react component forcefully
      PCore.getPubSubUtils().publish('forceRefreshRootComponent');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in refreshView: ', error);
    }
  }

  useEffect(() => {
    const updateErrorTimeOut = setTimeout(() => {
      setPageTitle(errorMessages.length > 0);
    }, 500);
    return () => {
      clearTimeout(updateErrorTimeOut);
    };
  }, [errorMessages]);

  useEffect(() => {
    PCore.getPubSubUtils().subscribe('callLocalActionSilently', callLocalActionSilently, 'callLocalActionSilently');

    PCore.getPubSubUtils().subscribe('languageToggleTriggered', refreshView, 'languageToggleTriggered');

    return () => {
      PCore.getPubSubUtils().unsubscribe('callLocalActionSilently', 'callLocalActionSilently');
      PCore.getPubSubUtils().unsubscribe('languageToggleTriggered', 'languageToggleTriggered');
    };
  }, [getPConnect]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Perform actions before the component unloads
      sessionStorage.setItem('isAutocompleteRendered', 'false');

      const assignmentID = thePConn.getCaseInfo().getAssignmentID();
      sessionStorage.setItem('assignmentID', assignmentID);

      PCore.getContainerUtils().closeContainerItem(PCore.getContainerUtils().getActiveContainerItemContext('app/primary'), { skipDirtyCheck: true });

      PCore.getPubSubUtils().unsubscribe('autoCompleteFieldPresent', errorMessage => {
        setHasAutoCompleteError(errorMessage);
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  let containerName;

  const caseInfo = thePConn.getDataObject().caseInfo;

  if (caseInfo?.assignments?.length > 0) {
    containerName = caseInfo.assignments[0].name;
  }

  const headerLocaleLocation = PCore.getStoreValue('localeReference', '', 'app');

  PCore.getPubSubUtils().subscribe('languageToggleTriggered', langreference => {
    setSelectedLang(langreference?.language);
  });

  // To update the title when we toggle the language
  useEffect(() => {
    setTimeout(() => {
      setHeader(localizedVal(containerName, 'Assignment', '@BASECLASS!GENERIC!PYGENERICFIELDS'));
      setPageTitle(false);
    }, 60);
  }, [headerLocaleLocation, containerName, selectedLang]);

  useEffect(() => {
    if (children && children.length > 0) {
      const oWorkItem = children[0].props.getPConnect();
      const oWorkData = oWorkItem.getDataObject();
      const oData = thePConn.getDataObject();

      if (oWorkData?.caseInfo && oWorkData.caseInfo.assignments !== null) {
        const oCaseInfo = oData.caseInfo;

        if (oCaseInfo && oCaseInfo.actionButtons) {
          setActionButtons(oCaseInfo.actionButtons);
        }
      }
    }
  }, [children]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  function checkErrorMessages(isFromCatchBlock: boolean = true) {
    let errorStateProps = [];
    if (containerName?.toLowerCase().includes('check your answer') && isFromCatchBlock) {
      errorStateProps = [
        {
          message: {
            message: localizedVal('Add answers to all questions'),
            pageRef: '',
            fieldId: '',
            clearMessageProperty: ''
          }
        }
      ];
    } else {
      const formFields = PCore.getContextTreeManager().getFieldsList(context);
      if (formFields) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        for (const [key, value] of formFields) {
          const { propertyName, pageReference, componentName: type, index: displayOrder } = value.props;

          const errorMessagesList = PCore.getMessageManager().getMessages({
            property: propertyName,
            pageReference,
            context,
            type: 'error'
          });

          let validateMessage = '';
          if (errorMessagesList.length > 0) {
            validateMessage = errorMessagesList.map(error => localizedVal(removeRedundantString(error.message), 'Messages')).join('. ');
          }

          // eslint-disable-next-line no-continue
          if (!validateMessage) continue;

          const formattedPropertyName = propertyName.includes('.') ? propertyName.split('.').pop() : null;
          let fieldId = formattedPropertyName;

          if (type === 'Date') {
            const fieldsHavingError = DateErrorTargetFields(validateMessage);

            if (fieldsHavingError?.length > 0) {
              fieldId = `${formattedPropertyName}-${fieldsHavingError[0]}`; // This will always pick the first the first invalid field for focusing
            } else {
              fieldId = `${formattedPropertyName}-day`; // Default focus will be at day field, when all fields are empty
            }

            validateMessage = DateErrorFormatter(validateMessage, formattedPropertyName);
          } else if (type === 'Checkbox') {
            const formattedPageReference = pageReference.split('.').pop();
            fieldId = `${formattedPageReference}-${fieldId}`;
          }

          errorStateProps.push({
            message: {
              message: localizedVal(validateMessage),
              pageReference,
              fieldId,
              propertyName
            },
            displayOrder
          });
        }
      }
    }
    setErrorMessages([...errorStateProps]);
  }

  function clearErrors() {
    errorMessages.forEach(error =>
      PCore.getMessageManager().clearMessages({
        property: error.message.clearMessageProperty,
        pageReference: error.message.pageRef,
        category: 'Property',
        context,
        type: 'error'
      })
    );
  }

  // When screen has autocomplete it is re-rendered to present field errors. This means the error is missed in the error summary.
  // Using the subscription below it checks for an error and if present sets the auto complete error.
  PCore.getPubSubUtils().subscribe('autoCompleteFieldPresent', errorMessage => {
    setHasAutoCompleteError(errorMessage);
  });

  // Fetches and filters any validatemessages on fields on the page, ordering them correctly based on the display order set in DefaultForm.
  // Also adds the relevant fieldID for each field to allow error summary links to move focus when clicked. This process uses the
  // name prop on the input field in most cases, however where there is a deviation (for example, in Date component, where the first field
  // has -day appended), a fieldId stateprop will be defined and this will be used instead.
  useEffect(() => {
    checkErrorMessages(false);
  }, [children, hasAutoCompleteError]);

  useEffect(() => {
    if (errorMessages.length === 0) {
      const bodyfocus: any = document.getElementsByClassName('govuk-template__body')[0];
      bodyfocus.focus();
    }
  }, [children]);

  function showErrorSummary() {
    setErrorMessages([]);
    checkErrorMessages();
  }

  function onSaveActionSuccess(data) {
    actionsAPI.cancelAssignment(itemKey).then(() => {
      PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED, data);
    });
  }

  function handleBackLinkforInvalidDate() {
    const childPconnect = children[0]?.props?.getPConnect();
    const dateField = PCore.getFormUtils()
      .getEditableFields(childPconnect.getContextName())
      .filter(field => field.type.toLowerCase() === 'date');
    if (dateField) {
      dateField?.forEach(field => {
        const childPagRef = childPconnect.getPageReference();
        const pageRef = thePConn.getPageReference() === childPagRef ? thePConn.getPageReference() : childPagRef;
        const storedRefName = field.name?.replace(pageRef, '');
        const storedDateValue = childPconnect.getValue(`.${storedRefName}`);
        if (!dayjs(storedDateValue, 'YYYY-MM-DD', true).isValid()) {
          childPconnect.setValue(`.${storedRefName}`, '');
        }
      });
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  async function buttonPress(sAction: string, sButtonType: string) {
    if (sButtonType === 'secondary') {
      switch (sAction) {
        case 'navigateToStep': {
          handleBackLinkforInvalidDate(); // clears the date value if there is invalid date, allowing back btn click(ref bug-7756)
          const navigatePromise = navigateToStep('previous', itemKey);

          clearErrors();

          navigatePromise
            .then(() => {
              scrollToTop();
            })
            .catch(() => {
              scrollToTop();
              showErrorSummary();
            });

          break;
        }

        case 'saveAssignment': {
          const caseID = thePConn.getCaseInfo().getKey();
          const assignmentID = thePConn.getCaseInfo().getAssignmentID();
          const savePromise = saveAssignment(itemKey);

          savePromise
            .then(() => {
              sessionStorage.removeItem('assignmentID');
              const caseType = thePConn.getCaseInfo().c11nEnv.getValue(PCore.getConstants().CASE_INFO.CASE_TYPE_ID);
              onSaveActionSuccess({ caseType, caseID, assignmentID });
              scrollToTop();
            })
            .catch(() => {
              scrollToTop();
              showErrorSummary();
            });

          break;
        }

        case 'cancelAssignment': {
          // check if create stage (modal)
          const { PUB_SUB_EVENTS } = PCore.getConstants();
          const { publish } = PCore.getPubSubUtils();
          if (isCreateStage) {
            const cancelPromise = cancelCreateStageAssignment(itemKey);

            cancelPromise
              .then(data => {
                publish(PUB_SUB_EVENTS.EVENT_CANCEL, data);
                scrollToTop();
              })
              .catch(() => {
                scrollToTop();
                showErrorSummary();
              });
          } else {
            const cancelPromise = cancelAssignment(itemKey);

            cancelPromise
              .then(data => {
                publish(PUB_SUB_EVENTS.EVENT_CANCEL, data);
                scrollToTop();
              })
              .catch(() => {
                scrollToTop();
                showErrorSummary();
              });
          }
          break;
        }

        default:
          break;
      }
    } else if (sButtonType === 'primary') {
      // eslint-disable-next-line sonarjs/no-small-switch
      switch (sAction) {
        case 'finishAssignment': {
          PCore.getPubSubUtils().publish('CustomAssignmentFinishedInitiated', {
            errorState: errorMessages.length > 0
          });

          // resetting Back button control on click of 'Continue'
          sessionStorage.setItem('overrideControl', 'false');
          const status = await getServiceShutteredStatus();
          if (status) {
            setServiceShutteredStatus(status);
          } else {
            const finishPromise = finishAssignment(itemKey);

            finishPromise
              .then(() => {
                sessionStorage.removeItem('assignmentID');
                scrollToTop();
                PCore.getPubSubUtils().publish('CustomAssignmentFinished');
              })
              .catch(() => {
                scrollToTop();
                showErrorSummary();
              });
          }
          break;
        }

        default:
          break;
      }
      sessionStorage.setItem('isAnsSaved', 'true');
    }
  }
  function _onButtonPress(sAction: string, sButtonType: string) {
    sessionStorage.removeItem('assignmentID');
    buttonPress(sAction, sButtonType);
  }

  useEffect(() => {
    if (actionButtons) {
      setArSecondaryButtons(actionButtons.secondary);
    }
  }, [actionButtons]);

  function renderAssignmentCard() {
    return (
      <ErrorMsgContext.Provider
        value={{
          errorMsgs: errorMessages
        }}
      >
        <AssignmentCard
          getPConnect={getPConnect}
          itemKey={itemKey}
          actionButtons={actionButtons}
          onButtonPress={buttonPress}
          errorMsgs={errorMessages}
        >
          {children}
        </AssignmentCard>
      </ErrorMsgContext.Provider>
    );
  }

  const shouldRemoveFormTag = shouldRemoveFormTagForReadOnly(containerName);
  return (
    <>
      {serviceShutteredStatus ? (
        <ShutterServicePage />
      ) : (
        <div id='Assignment'>
          {arSecondaryButtons?.map(sButton =>
            sButton.name === 'Previous' ? (
              <Button
                variant='backlink'
                onClick={e => {
                  e.target.blur();
                  _onButtonPress(sButton.jsAction, 'secondary');
                }}
                key={sButton.actionID}
                attributes={{ type: 'link' }}
              ></Button>
            ) : null
          )}
          <MainWrapper>
            {errorMessages.length > 0 && (
              <ErrorSummary errors={errorMessages.map(item => localizedVal(item.message, localeCategory, localeReference))} />
            )}
            {(!isOnlyFieldDetails.isOnlyField ||
              containerName?.toLowerCase().includes('check your answer') ||
              containerName?.toLowerCase().includes('declaration')) && <h1 className='govuk-heading-l'>{header}</h1>}
            {shouldRemoveFormTag ? renderAssignmentCard() : <form onSubmit={onSubmit}>{renderAssignmentCard()}</form>}
            <AskHMRC />
          </MainWrapper>
        </div>
      )}
    </>
  );
}

Assignment.propTypes = {
  children: PropTypes.node.isRequired,
  getPConnect: PropTypes.func.isRequired,
  itemKey: PropTypes.string,
  isCreateStage: PropTypes.bool
};

Assignment.defaultProps = {
  itemKey: null,
  isCreateStage: false
};
