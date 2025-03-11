import React, { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import HmrcOdxGoBackGoBack from './index';
import { configProps, stateProps } from './mock';

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
    caption: configProps.caption,
    trueLabel: configProps.trueLabel,
    falseLabel: configProps.falseLabel,

    getPConnect: () => {
      return {
        getStateProps: () => {
          return stateProps;
        },
        getConfigProps: () => {
          return configProps;
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

  return <HmrcOdxGoBackGoBack {...props} {...args} value={value} />;
};

BaseHmrcOdxGoBackGoBack.args = {
  label: configProps.label,
  helperText: configProps.helperText,
  testId: configProps.testId,
  readOnly: configProps.readOnly,
  disabled: configProps.disabled,
  required: configProps.required,
  status: configProps.status,
  hideLabel: configProps.hideLabel,
  displayMode: configProps.displayMode,
  validatemessage: configProps.validatemessage
};
