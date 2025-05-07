import React from 'react';
import PropTypes from 'prop-types';
import { makeItemId } from '../FormGroup/FormGroup';
import HintTextComponent from '../../helpers/formatters/ParsedHtml';

export default function Checkbox({
  item,
  index,
  name,
  inputProps = {},
  onChange,
  onBlur,
  fieldId
}) {
  const itemClasses = 'govuk-checkboxes__item';
  const checkboxItemClasses = 'govuk-checkboxes__input';
  const hintTextClasses = `govuk-hint govuk-checkboxes__hint`;
  const labelClasses = `govuk-label govuk-checkboxes__label`;
  const itemId = makeItemId(index, fieldId).trim();
  const itemHintId = `${itemId}-item-hint`;
  if (item.hintText) {
    inputProps['aria-describedby'] = itemHintId;
  }

  return (
    <div className={itemClasses} key={itemId}>
      <input
        className={checkboxItemClasses}
        {...inputProps}
        id={itemId}
        name={name}
        type='checkbox'
        value={item.checked}
        onChange={!item.readOnly ? onChange : () => {}}
        onBlur={!item.readOnly ? onBlur : () => {}}
        checked={item.checked}
      ></input>
      <label className={labelClasses} htmlFor={itemId}>
        {item.label}
      </label>
      {item.hintText ? (
        <div id={itemHintId} className={hintTextClasses}>
          <HintTextComponent htmlString={item.hintText} />
        </div>
      ) : null}
    </div>
  );
}

Checkbox.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  name: PropTypes.string,
  fieldId: PropTypes.string,
  inputProps: PropTypes.object,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};
