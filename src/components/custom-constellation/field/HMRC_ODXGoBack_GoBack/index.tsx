import React from 'react';
import {
  Checkbox as CosmosCheckbox,
  CheckboxGroup,
  FieldValueList,
  Text,
  withConfiguration
} from '@pega/cosmos-react-core';

import type { PConnFieldProps } from './PConnProps';

// includes in bundle
import handleEvent from './event-utils';
import StyledHmrcOdxGoBackGoBackWrapper from './styles';

// interface for props
interface HmrcOdxGoBackGoBackProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  displayAsStatus?: boolean;
  isTableFormatter?: boolean;
  hasSuggestions?: boolean;
  variant?: any;
  formatter: string;
  caption: string;
  trueLabel: string;
  falseLabel: string;
}

// interface for StateProps object
interface StateProps {
  value: string;
  hasSuggestions: boolean;
}

interface ActionsProps {
  onClick: any;
}

// Duplicated runtime code from Constellation Design System Component

// props passed in combination of props from property panel (config.json) and run time props from Constellation
// any default values in config.pros should be set in defaultProps at bottom of this file
function HmrcOdxGoBackGoBack(props: HmrcOdxGoBackGoBackProps) {
  const {
    getPConnect,
    value = false,
    label = '',
    helperText = '',
    caption,
    validatemessage,
    hideLabel,
    testId,
    additionalProps = {},
    displayMode,
    variant = 'inline',
    trueLabel,
    falseLabel
  } = props;
  const pConn = getPConnect();
  const actions = pConn.getActionsApi();
  const actionsProps = pConn.getActionsApi() as unknown as ActionsProps;
  const stateProps = pConn.getStateProps() as StateProps;
  const propName: string = stateProps.value;

  let { readOnly = false, required = false, disabled = false } = props;
  [readOnly, required, disabled] = [readOnly, required, disabled].map(
    prop => prop === true || (typeof prop === 'string' && prop === 'true')
  );

  let status: 'error' | 'success' | 'warning' | 'pending' | undefined;
  if (validatemessage !== '') {
    status = 'error';
  }

  const aCosmosCheckbox = (
    <CosmosCheckbox
      {...additionalProps}
      className='standard'
      checked={value}
      label={caption}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      onClick={actionsProps.onClick}
      onChange={event => {
        handleEvent(actions, 'changeNblur', propName, event.target.checked);
      }}
      onBlur={(event: { target: { checked: any } }) => {
        // @ts-ignore
        pConn.getValidationApi().validate(event.target.checked);
      }}
      data-testid={testId}
    />
  );

  const parentTestId = testId === '' ? `${testId}-parent` : testId;

  let displayComponent;
  if (displayMode) {
    // @ts-ignore
    displayComponent = (
      // @ts-ignore
      <HmrcOdxGoBackGoBack value={value} trueLabel={trueLabel} falseLabel={falseLabel} />
    );
  }

  if (displayMode === 'DISPLAY_ONLY') {
    return (
      <StyledHmrcOdxGoBackGoBackWrapper> {displayComponent} </StyledHmrcOdxGoBackGoBackWrapper>
    );
  }

  if (displayMode === 'LABELS_LEFT') {
    return (
      <StyledHmrcOdxGoBackGoBackWrapper>
        <FieldValueList
          variant={hideLabel ? 'stacked' : variant}
          data-testid={testId}
          fields={[{ id: '1', name: hideLabel ? '' : caption, value: displayComponent }]}
        />
      </StyledHmrcOdxGoBackGoBackWrapper>
    );
  }

  if (displayMode === 'STACKED_LARGE_VAL') {
    return (
      <StyledHmrcOdxGoBackGoBackWrapper>
        <FieldValueList
          variant='stacked'
          data-testid={testId}
          fields={[
            {
              id: '2',
              name: hideLabel ? '' : caption,
              value: (
                <Text variant='h1' as='span'>
                  {displayComponent}
                </Text>
              )
            }
          ]}
        />
      </StyledHmrcOdxGoBackGoBackWrapper>
    );
  }

  return (
    <StyledHmrcOdxGoBackGoBackWrapper>
      <CheckboxGroup
        label={label}
        labelHidden={hideLabel}
        data-testid={parentTestId}
        info={validatemessage || helperText}
        status={status}
      >
        {aCosmosCheckbox}
      </CheckboxGroup>
    </StyledHmrcOdxGoBackGoBackWrapper>
  );
}

export default withConfiguration(HmrcOdxGoBackGoBack);
