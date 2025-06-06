import React, { useEffect } from 'react';
import { bool, func, string } from 'prop-types';

import HintTextComponent from '../../helpers/formatters/ParsedHtml';
import FieldSet from '../FormGroup/FieldSet';
import FormGroup from '../FormGroup/FormGroup';

function makeHintId(identifier) {
  return `${identifier}__assistiveHint`;
}

declare global {
  interface Window {
    openregisterLocationPicker: any;
  }
}

export default function AutoComplete(props) {
  const { optionList, instructionText, selectedValue, testId, helperText, errorText, fieldId } =
    props;
  const inputClasses = `govuk-input ${errorText ? 'govuk-input--error' : ''}`.trim();

  useEffect(() => {
    if (
      typeof window.openregisterLocationPicker === 'function' &&
      sessionStorage.getItem('isAutocompleteRendered') !== 'true' &&
      optionList.length
    ) {
      sessionStorage.setItem('isAutocompleteRendered', 'true');
      window.openregisterLocationPicker({
        selectElement: document.getElementById(fieldId),
        defaultValue: ''
      });

      // Publish event so that errorSummary component can be updated with autocomplete field errors after rendering.
      PCore.getPubSubUtils().publish('autoCompleteFieldPresent', { error: errorText });
    }
  }, [optionList]);
  const arrOptions =
    optionList.length &&
    optionList.map(option => {
      let selected = { selected: false };
      if (selectedValue === option.key) selected = { selected: true };
      return (
        <option key={option.key} value={option.value} {...selected}>
          {option.value}
        </option>
      );
    });

  const getDefaultValue = () => {
    return optionList.forEach(item => {
      if (item.key === selectedValue) {
        return item.value;
      }
      return '';
    });
  };

  return (
    <FormGroup {...props}>
      {helperText && (
        <div id={makeHintId(fieldId)} className='govuk-hint'>
          <HintTextComponent htmlString={helperText} />
        </div>
      )}
      {instructionText && (
        <div id={makeHintId(fieldId)} className='govuk-body'>
          <HintTextComponent htmlString={helperText} />
        </div>
      )}
      {arrOptions && arrOptions.length > 0 ? (
        <select
          className={inputClasses}
          id={fieldId}
          name={fieldId}
          value={getDefaultValue()}
          data-test-id={testId}
        >
          <option value='' disabled selected>
            {' '}
          </option>
          {arrOptions}
        </select>
      ) : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <></>
      )}
    </FormGroup>
  );
}

AutoComplete.propTypes = {
  ...FieldSet.propTypes,
  optionList: { key: string, value: string },
  label: string,
  instructionText: string,
  helperText: string,
  onChange: func,
  selectedValue: string,
  testId: string,
  name: string,
  labelIsHeading: bool,
  fieldId: string
};
