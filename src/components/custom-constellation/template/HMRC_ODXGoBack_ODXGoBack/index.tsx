import React from 'react';
import { Grid, FieldGroup, withConfiguration } from '@pega/cosmos-react-core';
import type { PConnFieldProps } from './PConnProps';
import StyledHmrcOdxGoBackOdxGoBackWrapper from './styles';

// interface for props
interface HmrcOdxGoBackOdxGoBackProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  showLabel: boolean;
  NumCols: string;
  children: any;
}

// Duplicated runtime code from Constellation Design System Component

// props passed in combination of props from property panel (config.json) and run time props from Constellation
// any default values in config.pros should be set in defaultProps at bottom of this file
function HmrcOdxGoBackOdxGoBack(props: HmrcOdxGoBackOdxGoBackProps) {

  const { children = [], NumCols = '1', label, showLabel, getPConnect } = props;
  const propsToUse = { label, showLabel, ...getPConnect().getInheritedProps() };

  const nCols = parseInt(NumCols, 10);

  return (
    <StyledHmrcOdxGoBackOdxGoBackWrapper>
    <FieldGroup name={propsToUse.showLabel ? propsToUse.label : ''}>
      <Grid container={{
            cols: `repeat(${nCols}, minmax(0, 1fr))`,
            gap: 2
          }}>
            {children}
      </Grid>
    </FieldGroup>
    </StyledHmrcOdxGoBackOdxGoBackWrapper>
  );


}

export default withConfiguration(HmrcOdxGoBackOdxGoBack);
