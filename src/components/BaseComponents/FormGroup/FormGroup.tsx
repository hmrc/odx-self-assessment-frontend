import React, { useContext, useEffect, useState } from 'react';
import ConditionalWrapper from '../../helpers/formatters/ConditionalWrapper';
import HintTextComponent from '../../helpers/formatters/ParsedHtml';
import { DefaultFormContext, ErrorMsgContext } from '../../helpers/HMRCAppContext';
import { checkErrorMsgs, removeRedundantString } from '../../helpers/utils';
import InstructionTextComponent from '../../override-sdk/template/DefaultForm/InstructionTextComponent';
import { useTranslation } from 'react-i18next';

export interface FormGroupProps {
  labelIsHeading?: boolean;
  label: string;
  errorText?: string;
  hintText?: string;
  name: string;
  fieldId: string;
  extraLabelClasses?: string;
  children?: JSX.Element;
  testProps?: object;
  parentManagedError?: boolean;
  useCharacterCount?: boolean;
}

function makeHintId(identifier) {
  return `${identifier}-hint`;
}
function makeErrorId(identifier) {
  return `${identifier}-error`;
}
function makeItemId(index, identifier) {
  return `${identifier}${index > 0 ? `-${index}` : ''}`;
}

export default function FormGroup(props: FormGroupProps) {
  const {
    labelIsHeading = false,
    label,
    errorText,
    hintText,
    name,
    fieldId,
    extraLabelClasses = '',
    children,
    testProps = {},
    useCharacterCount = false,
    parentManagedError = false
  } = props;
  const { t } = useTranslation();
  const { instructionText } = useContext(DefaultFormContext);
  const { errorMsgs } = useContext(ErrorMsgContext);
  const [errMessage, setErrorMessage] = useState(errorText);
  useEffect(() => {
    if (parentManagedError) return;

    const found = checkErrorMsgs(errorMsgs, fieldId, name);

    setErrorMessage(
      found && errorMsgs.length <= 1 && found.message.fieldId === fieldId
        ? found.message.message
        : errorText
    );
  }, [errorText, errorMsgs]);

  const formGroupDivClasses = `govuk-form-group ${errMessage ? 'govuk-form-group--error' : ''}  ${
    useCharacterCount ? 'govuk-character-count' : ''
  }`.trim();

  const labelClasses =
    `govuk-label ${labelIsHeading ? 'govuk-label--l' : ''} ${extraLabelClasses}`.trim();

  return (
    <div className={formGroupDivClasses} {...testProps}>
      <ConditionalWrapper
        condition={labelIsHeading}
        wrapper={child => {
          return <h1 className='govuk-label-wrapper govuk-heading-l'>{child}</h1>;
        }}
        childrenToWrap={
          <label className={labelClasses} htmlFor={fieldId}>
            {label}
          </label>
        }
      />
      {instructionText && labelIsHeading && (
        <InstructionTextComponent instructionText={instructionText} />
      )}
      {hintText && (
        <div id={makeHintId(fieldId)} className='govuk-hint'>
          <HintTextComponent htmlString={hintText} />
        </div>
      )}
      {errMessage && (
        <p id={makeErrorId(fieldId)} className='govuk-error-message'>
          <span className='govuk-visually-hidden'>{t('ERROR')}:</span>
          {removeRedundantString(errMessage)}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
}

export { makeErrorId, makeHintId, makeItemId };
