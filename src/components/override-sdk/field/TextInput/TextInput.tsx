import React, { useContext, useEffect, useState } from 'react';
import GDSTextInput from '../../../BaseComponents/TextInput/TextInput';
import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks';
import ReadOnlyDisplay from '../../../BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';
import { registerNonEditableField } from '../../../helpers/hooks/QuestionDisplayHooks';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import GDSCheckAnswers from '../../../BaseComponents/CheckAnswer/index';
import { ReadOnlyDefaultFormContext } from '../../../helpers/HMRCAppContext';
import { checkStatus } from '../../../helpers/utils';

export default function TextInput(props) {
  const {
    getPConnect,
    value = '',
    placeholder,
    validatemessage,
    onChange,
    helperText,
    inputProps,
    fieldMetadata,
    readOnly,
    disabled,
    name,
    testId,
    configAlternateDesignSystem
  } = props;

  const { hasBeenWrapped } = useContext(ReadOnlyDefaultFormContext);

  const isComplexQuestionPage = PCore.getStoreValue('isComplexQuestionPage', '', 'app');

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  // @ts-ignore
  const [errorMessage, setErrorMessage] = useState(localizedVal(validatemessage));

  registerNonEditableField(!!disabled);

  useEffect(() => {
    // @ts-ignore
    setErrorMessage(localizedVal(validatemessage));
  }, [validatemessage]);
  const thePConn = getPConnect();
  const actionsApi = thePConn.getActionsApi();

  const propName = thePConn.getStateProps().value;
  const fieldId = propName?.split('.')?.pop();
  const formattedPropertyName = name || fieldId;

  const handleChange = evt => {
    if (name === 'content-pyPostalCode') {
      const selectedValue = evt.target.value === placeholder ? '' : evt.target.value;
      handleEvent(actionsApi, 'changeNblur', propName, selectedValue);
    }
  };

  let label = props.label;
  const { isOnlyField, overrideLabel } = useIsOnlyField(props.displayOrder);
  if (isOnlyField && !readOnly) label = overrideLabel.trim() ? overrideLabel : label;

  const maxLength = fieldMetadata?.maxLength;
  const inprogressStatus = checkStatus();

  if (
    hasBeenWrapped &&
    configAlternateDesignSystem?.ShowChangeLink &&
    inprogressStatus === 'Open-InProgress'
  ) {
    return (
      <GDSCheckAnswers
        label={props.label}
        value={value}
        name={name}
        stepId={configAlternateDesignSystem.stepId}
        hiddenText={configAlternateDesignSystem.hiddenText}
        getPConnect={getPConnect}
        required={false}
        disabled={false}
        validatemessage=''
        onChange={undefined}
        readOnly={false}
        testId=''
        helperText={helperText}
        hideLabel={false}
        placeholder={placeholder}
      />
    );
  }

  if (readOnly) {
    return <ReadOnlyDisplay label={label} value={value} name={name} />;
  }

  const extraProps = { testProps: { 'data-test-id': testId } };

  const extraInputProps = { onChange, value };

  if (configAlternateDesignSystem?.type || inputProps?.type) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    extraInputProps['type'] = configAlternateDesignSystem?.type || inputProps?.type;
  } else {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    extraInputProps['type'] = 'text';
  }

  // TODO Investigate more robust way to check if we should display as password
  if (fieldMetadata?.displayAs === 'pxPassword') {
    // @ts-ignore
    extraInputProps.type = 'password';
  }

  if (configAlternateDesignSystem?.autocomplete) {
    // @ts-ignore
    extraInputProps.autoComplete = configAlternateDesignSystem.autocomplete;
  } else {
    // @ts-ignore
    extraInputProps.autoComplete = 'off';
  }

  return (
    <GDSTextInput
      inputProps={{
        ...inputProps,
        ...extraInputProps
      }}
      hintText={helperText}
      extraLabelClasses={isComplexQuestionPage ? 'govuk-label--m' : ''}
      errorText={errorMessage}
      label={label}
      labelIsHeading={isOnlyField}
      name={formattedPropertyName}
      maxLength={maxLength}
      fieldId={fieldId}
      onBlur={e => handleChange(e)}
      {...extraProps}
      disabled={disabled || false}
    />
  );
}
