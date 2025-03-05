import React from 'react';
import PropTypes from 'prop-types';
import FormGroup, { makeErrorId, makeHintId } from '../FormGroup/FormGroup';
import HintTextComponent from '../../helpers/formatters/ParsedHtml';
import { useTranslation } from 'react-i18next';

export default function TextArea(props) {
  const {
    name,
    errorText,
    hintText,
    inputProps = {},
    expectedLength,
    id,
    onBlur,
    disabled,
    rows = 5,
    useCharacterCount = true // Add this prop
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

  const describedByIDs = `${hintText ? makeHintId(name) : ''} ${
    errorText ? makeErrorId(name) : ''
  }`.trim();
  if (describedByIDs.length !== 0) {
    inputProps['aria-describedby'] = describedByIDs;
  }

  const remainingChars = expectedLength && expectedLength - inputProps.value?.length;
  const inputClasses = `govuk-textarea ${
    errorText || remainingChars < 0 ? 'govuk-textarea--error' : ''
  }`.trim();

  return (
    <FormGroup {...props} useCharacterCount={useCharacterCount}>
      <textarea
        className={inputClasses}
        {...inputProps}
        id={id}
        name={name}
        onBlur={onBlur}
        rows={rows}
        aria-describedby='with-hint-info'
      >
        {inputProps.value}
      </textarea>
      {expectedLength && (
        <div
          id='with-hint-info'
          className={`govuk-character-count__message govuk-character-count__status ${
            remainingChars < 0 ? 'govuk-error-message' : 'govuk-hint'
          }`}
        >
          {`${t('YOU_HAVE')}  ${Math.abs(remainingChars)} ${
            Math.abs(remainingChars) === 1 ? t('CHARACTER') : t('CHARACTERS')
          } ${remainingChars >= 0 ? t('REMAINING') : t('TOO_MANY')}`}
        </div>
      )}
    </FormGroup>
  );
}

TextArea.propTypes = {
  ...FormGroup.propTypes,
  name: PropTypes.string,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  inputProps: PropTypes.object,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  onBlur: PropTypes.func,
  useCharacterCount: PropTypes.bool, // Add this prop type
  expectedLength: PropTypes.number
};
