// @ts-nocheck
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { configProps, stateProps } from './mock';

import HmrcOdxGoBackGoBack from './index';

const meta: Meta<typeof HmrcOdxGoBackGoBack> = {
  title: 'HmrcOdxGoBackGoBack',
  component: HmrcOdxGoBackGoBack,
  excludeStories: /.*Data$/
};

export default meta;
type Story = StoryObj<typeof HmrcOdxGoBackGoBack>;

export const BaseHmrcOdxGoBackGoBack: Story = args => {
  const [value, setValue] = useState(configProps.value);

  const props = {
    value,
    additionalProps: configProps.additionalProps,
    getPConnect: () => {
      return {
        getStateProps: () => {
          return stateProps;
        },
        getActionsApi: () => {
          return {
            updateFieldValue: (propName, theValue) => {
              setValue(theValue);
            },
            triggerFieldChange: () => {
              /* nothing */
            }
          };
        },
        getValidationApi: () => {
          return {
            validate: () => {
              /* nothing */
            }
          };
        }
      };
    }
  };

  return <HmrcOdxGoBackGoBack {...props} {...args} />;
};

BaseHmrcOdxGoBackGoBack.args = {
  label: configProps.label,
  helperText: configProps.helperText,
  caption: configProps.caption,
  testId: configProps.testId,
  readOnly: configProps.readOnly,
  disabled: configProps.disabled,
  required: configProps.required,
  status: configProps.status,
  hideLabel: configProps.hideLabel,
  trueLabel: configProps.trueLabel,
  falseLabel: configProps.falseLabel,
  displayMode: configProps.displayMode,
  variant: configProps.variant,
  validatemessage: configProps.validatemessage
};
