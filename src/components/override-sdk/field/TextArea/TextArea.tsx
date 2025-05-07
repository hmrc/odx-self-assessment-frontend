import React, { useContext, useEffect, useState } from 'react';
import GDSTextArea from '../../../BaseComponents/TextArea/TextArea';
import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks';
import ReadOnlyDisplay from '../../../BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';
import { registerNonEditableField } from '../../../helpers/hooks/QuestionDisplayHooks';
import GDSCheckAnswers from '../../../BaseComponents/CheckAnswer/index';
import { ReadOnlyDefaultFormContext } from '../../../helpers/HMRCAppContext';
import { checkStatus } from '../../../helpers/utils';

export default function TextArea(props) {
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

  const propName = thePConn.getStateProps().value;
  const formattedPropertyName = name || propName?.split('.')?.pop();

  let label = props.label;
  const { isOnlyField, overrideLabel } = useIsOnlyField(props.displayOrder);
  if (isOnlyField && !readOnly) label = overrideLabel.trim() ? overrideLabel : label;

  const expectedLength = fieldMetadata?.expectedLength;
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

  if (configAlternateDesignSystem?.autocomplete) {
    // @ts-ignore
    extraInputProps.autoComplete = configAlternateDesignSystem.autocomplete;
  } else {
    // @ts-ignore
    extraInputProps.autoComplete = 'off';
  }

  return (
    <GDSTextArea
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
      expectedLength={expectedLength}
      id={formattedPropertyName}
      {...extraProps}
      disabled={disabled || false}
    />
  );
}
