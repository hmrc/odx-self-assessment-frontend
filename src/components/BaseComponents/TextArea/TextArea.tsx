import React from 'react';
import FormGroup, { makeErrorId, makeHintId, FormGroupProps } from '../FormGroup/FormGroup';
import HintTextComponent from '../../helpers/formatters/ParsedHtml';
import { useTranslation } from 'react-i18next';

interface TextAreaProps extends FormGroupProps {
  name: string;
  inputProps;
  disabled: boolean;
  expectedLength: number;
  fieldId: string;
  rows: number;
  useCharacterCount: boolean;
  hintText: string;
  errorText: string;
}

export default function TextArea(props: TextAreaProps) {
  const {
    name,
    inputProps,
    disabled,
    expectedLength,
    fieldId,
    rows,
    useCharacterCount,
    hintText,
    errorText
  } = props;

  const { t } = useTranslation();

  if (disabled) {
    return (
      <>
        {hintText && (
          <div id={makeHintId(name)} className='govuk-hint'>
            <HintTextComponent htmlString={hintText} />
          </div>
        )}
        <span className='govuk-body govuk-!-font-weight-bold read-only'>{inputProps.value}</span>
        <br />
      </>
    );
  }

  const describedByIDs =
    `${hintText ? makeHintId(name) : ''} ${errorText ? makeErrorId(name) : ''}`.trim();
  if (describedByIDs.length !== 0) {
    inputProps['aria-describedby'] = describedByIDs;
  }

  // eslint-disable-next-line no-unsafe-optional-chaining
  const remainingChars = expectedLength && expectedLength - inputProps.value?.length;
  const inputClasses =
    `govuk-textarea ${errorText || remainingChars < 0 ? 'govuk-textarea--error' : ''}`.trim();

  return (
    <FormGroup {...props} useCharacterCount={useCharacterCount}>
      <>
        <textarea
          className={inputClasses}
          {...inputProps}
          id={fieldId}
          name={name}
          rows={rows}
          aria-describedby='with-hint-info'
        >
          {inputProps.value}
        </textarea>
        {expectedLength && (
          <div
            id='with-hint-info'
            className={`govuk-character-count__message govuk-character-count__status ${remainingChars < 0 ? 'govuk-error-message' : 'govuk-hint'}`}
          >
            {`${t('YOU_HAVE')}  ${Math.abs(remainingChars)} ${
              Math.abs(remainingChars) === 1 ? t('CHARACTER') : t('CHARACTERS')
            } ${remainingChars >= 0 ? t('REMAINING') : t('TOO_MANY')}`}
          </div>
        )}
      </>
    </FormGroup>
  );
}
