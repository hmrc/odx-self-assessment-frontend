import React, { useContext, useEffect, useState } from 'react';
import GDSCheckbox from '../../../BaseComponents/Checkboxes/Checkbox';
// import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks'
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import ReadOnlyDisplay from '../../../BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';
import { ErrorMsgContext } from '../../../helpers/HMRCAppContext';
import { checkErrorMsgs, checkStatus, removeRedundantString } from '../../../helpers/utils';
import { t } from 'i18next';
import GDSCheckAnswers from '../../../BaseComponents/CheckAnswer/index';
import { ReadOnlyDefaultFormContext, GroupContext } from '../../../helpers/HMRCAppContext';

export default function CheckboxComponent(props) {
  const { getPConnect, inputProps, validatemessage, readOnly, value, configAlternateDesignSystem, placeholder } = props;

  const { cyLabel, cyHelperText } = configAlternateDesignSystem || {};
  const { setErrorMessage: groupSetError } = useContext(GroupContext);
  const hintText = props.hintText || props.helperText;

  // let label = props.label;

  // These two properties should be passed to individual checkbox components via pconnet registerAdditionalProps
  // exclusiveOption should be boolean indicating if this checkbox is and exclusive option, and will render the 'or'
  // div above it if it is.
  // exclusiveOptionChangeHandler will always be called in the onChange event, and so each checkbox should be passed a
  // relevant handler (mainly - non-exclusive checkboxes should have a handler that clears the exclusive option ,
  // and exclusive option will need a different handler to clear all other items )
  const { exclusiveOption, exclusiveOptionChangeHandler = () => {}, index = 0 } = getPConnect().getConfigProps();
  // const {isOnlyField, overrideLabel} = useIsOnlyField(props.displayOrder);
  /* retaining for future reference, incase changes need to be reverted

  if(isOnlyField && !readOnly) label = overrideLabel.trim() ? overrideLabel : label; */
  const { hasBeenWrapped } = useContext(ReadOnlyDefaultFormContext);
  const thePConn = getPConnect();
  const theConfigProps = thePConn.getConfigProps();
  const { caption } = theConfigProps;
  const actionsApi = thePConn.getActionsApi();
  const propName = thePConn.getStateProps().value;
  const inprogressStatus = checkStatus();

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  // @ts-ignore
  const [errorMessage, setErrorMessage] = useState(localizedVal(validatemessage));
  const [displayLabel, setDisplayLabel] = useState(caption);
  const [displayHelperText, setDisplayHelperText] = useState(hintText);
  const { errorMsgs } = useContext(ErrorMsgContext);
  const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';

  // build name for id, allows for error message navigation to field
  const propertyContext = getPConnect().options.pageReference ? getPConnect().options.pageReference.split('.').pop() : '';
  const formattedPropertyName = propName.split('.').pop();
  /* If its the declaration view then group the checkboxes separately so the error message is assigned correctly */
  const fieldId = `${propertyContext}-${formattedPropertyName}`;

  useEffect(() => {
    const found = checkErrorMsgs(errorMsgs, fieldId);
    if (groupSetError) groupSetError(found);

    if (!found) {
      // @ts-ignore
      setErrorMessage(localizedVal(validatemessage));
    }
  }, [errorMsgs, validatemessage]);

  useEffect(() => {
    if (lang === 'cy') {
      if (cyLabel) setDisplayLabel(cyLabel);
      if (cyHelperText) setDisplayHelperText(cyHelperText);
    } else {
      setDisplayLabel(caption);
      setDisplayHelperText(hintText);
    }
  }, [lang]);

  if (hasBeenWrapped && configAlternateDesignSystem?.ShowChangeLink && inprogressStatus === 'Open-InProgress') {
    return (
      <GDSCheckAnswers
        label={lang === 'cy' && cyLabel ? cyLabel : props.label}
        value={value ? props.trueLabel : props.falseLabel}
        name={fieldId}
        stepId={configAlternateDesignSystem.stepId}
        hiddenText={configAlternateDesignSystem.hiddenText}
        getPConnect={getPConnect}
        required={false}
        disabled={false}
        validatemessage=''
        onChange={undefined}
        readOnly={false}
        testId=''
        helperText={displayHelperText}
        placeholder={placeholder}
        hideLabel={false}
      />
    );
  }

  if (readOnly) {
    return <ReadOnlyDisplay value={value ? props.trueLabel : props.falseLabel} label={displayLabel} />;
  }

  const handleChange = event => {
    handleEvent(actionsApi, 'changeNblur', propName, event.target.checked);
  };

  return (
    <>
      {exclusiveOption && <div className='govuk-checkboxes__divider'>{t('EXCLUSIVEOPTION_OR')}</div>}

      {/* If its the declaration view then group the checkboxes separately so the error message is assigned correctly */}
      {getPConnect().viewName.toLowerCase() === 'declaration' ? (
        <div className={`govuk-form-group ${errorMessage ? 'govuk-form-group--error' : ''}`}>
          {errorMessage && (
            <p id={`${fieldId}-error`} className='govuk-error-message'>
              <span className='govuk-visually-hidden'>{t('ERROR')}:</span> {removeRedundantString(errorMessage)}
            </p>
          )}
          <GDSCheckbox
            item={{
              checked: value,
              label: displayLabel,
              readOnly: false,
              hintText: displayHelperText
            }}
            index={index}
            name={fieldId}
            inputProps={inputProps}
            onChange={evt => {
              handleChange(evt);
              exclusiveOptionChangeHandler();
            }}
            key={fieldId}
            fieldId={fieldId}
          />
        </div>
      ) : (
        <GDSCheckbox
          item={{
            checked: value,
            label: displayLabel,
            readOnly: false,
            hintText: displayHelperText
          }}
          index={index}
          name={fieldId}
          inputProps={inputProps}
          onChange={evt => {
            handleChange(evt);
            exclusiveOptionChangeHandler();
          }}
          key={fieldId}
          fieldId={fieldId}
        />
      )}
    </>
  );
}
