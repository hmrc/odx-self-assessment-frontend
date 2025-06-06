import React, { useState, useEffect, useContext } from 'react';
import FieldSet from '../../../BaseComponents/FormGroup/FieldSet';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks';
import ReadOnlyDisplay from '../../../BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';
import GDSCheckAnswers from '../../../BaseComponents/CheckAnswer/index';
import { ReadOnlyDefaultFormContext, GroupContext } from '../../../helpers/HMRCAppContext';
import { checkStatus } from '../../../helpers/utils';
import { useTranslation } from 'react-i18next';

declare const PCore: any;

export default function Group(props) {
  const { children, heading, instructions, readOnly, getPConnect, helperText, placeholder } = props;

  const thePConn = getPConnect();
  const actionsApi = thePConn.getActionsApi();
  const [stateChanged, setStateChanged] = useState(false);

  const { isOnlyField } = useIsOnlyField(props.displayOrder);
  const { hasBeenWrapped } = useContext(ReadOnlyDefaultFormContext);
  const formattedContext = thePConn.options.pageReference
    ? thePConn.options.pageReference.split('.').pop()
    : '';
  const { t } = useTranslation();

  // Doesn't seem that state change on children (checkboxes) causes refresh on the containing group,
  // working around with this for now
  useEffect(() => {
    if (stateChanged) {
      children.forEach(child => {
        PCore.getMessageManager().clearMessages({
          property: child.props.getPConnect().getStateProps().value,
          pageReference: child.props.getPConnect().getPageReference(),
          context: child.props.getPConnect().getContextName(),
          type: 'error'
        });
      });
      setStateChanged(false);
    }
  }, [stateChanged]);

  const [errorMessage, setErrorMessage] = useState(null);

  if (children?.length > 0) {
    const errors = [''];
    if (children[0].props?.getPConnect().getMetadata().type === 'Checkbox') {
      const valuesList = children
        .filter(child => {
          const childPConnect = child.props.getPConnect();
          const resolvedProps = childPConnect.resolveConfigProps(childPConnect.getConfigProps());

          return resolvedProps.value;
        })
        .map(child => {
          const childPConnect = child.props.getPConnect();
          const resolvedProps = childPConnect.resolveConfigProps(childPConnect.getConfigProps());
          return resolvedProps.caption;
        });
      const inprogressStatus = checkStatus();

      const getconfigAlternateDesignSystem = children[0].props.getPConnect().getMetadata()
        .config.configAlternateDesignSystem;

      if (getconfigAlternateDesignSystem) {
        let stepId = getconfigAlternateDesignSystem?.stepId;
        stepId = stepId.split('@L ').pop();
        if (
          hasBeenWrapped &&
          getconfigAlternateDesignSystem?.ShowChangeLink &&
          inprogressStatus === 'Open-InProgress'
        ) {
          return (
            <GDSCheckAnswers
              label={heading}
              value={valuesList}
              name={props.name}
              stepId={stepId}
              getPConnect={getPConnect}
              required={false}
              disabled={false}
              validatemessage=''
              onChange={undefined}
              readOnly={false}
              testId=''
              helperText={helperText}
              placeholder={placeholder}
              hideLabel={false}
            />
          );
        }
      }

      if (readOnly) {
        return <ReadOnlyDisplay value={valuesList} label={heading} />;
      }

      // Builds onChange handlers for exclusive options to clear relevant checkboxes
      let exclusiveOptionPropName;
      const nonExclusivePropNames = [];
      const unCheckExclusive = () => {
        if (exclusiveOptionPropName) {
          const defaultValue: any = false;
          handleEvent(actionsApi, 'changeNblur', exclusiveOptionPropName, defaultValue);
          setStateChanged(true);
        }
      };

      const unCheckNonExlcusives = () => {
        if (exclusiveOptionPropName && nonExclusivePropNames) {
          nonExclusivePropNames.forEach(propName => {
            const defaultValue: any = false;
            handleEvent(actionsApi, 'changeNblur', propName, defaultValue);
          });
          setStateChanged(true);
        }
      };

      let firstOptionPropertyName = null;
      children.forEach((child, index) => {
        const childPConnect = child.props.getPConnect();
        const resolvedProps = childPConnect.resolveConfigProps(childPConnect.getConfigProps());
        childPConnect.populateAdditionalProps(childPConnect.getConfigProps());
        errors.push(
          PCore.getMessageManager().getMessages({
            property: child.props.getPConnect().getStateProps().value,
            pageReference: child.props.getPConnect().getPageReference(),
            context: child.props.getPConnect().getContextName(),
            type: 'error'
          })[0]?.message
        );

        const formattedPropertyName =
          childPConnect.getStateProps().value &&
          childPConnect.getStateProps().value.split('.').pop();

        // Points error summary link to first checkbox in group
        if (!firstOptionPropertyName) {
          firstOptionPropertyName = formattedPropertyName;
        }
        const fieldId = `${formattedContext}-${firstOptionPropertyName}`;
        childPConnect.setStateProps({ fieldId });

        // Register additonal props used for exclusive field handling (used in CheckBox overidden component)
        childPConnect.registerAdditionalProps({
          exclusiveOptionChangeHandler: unCheckExclusive,
          index
        });

        const arrayExclusiveOptions = [
          t('I_DO_NOT_WORK_IN_ANY_OF_THESE_POSITIONS'),
          t('I_DO_NOT_HAVE_ANOTHER_REASON_TO_SEND_A_TAX_RETURN')
        ];

        if (arrayExclusiveOptions.includes(resolvedProps.caption.toLowerCase())) {
          exclusiveOptionPropName = childPConnect.getStateProps().value;
          childPConnect.registerAdditionalProps({
            exclusiveOption: true,
            exclusiveOptionChangeHandler: unCheckNonExlcusives
          });
        } else {
          nonExclusivePropNames.push(childPConnect.getStateProps().value);
        }
      });

      const checkboxClasses = `govuk-checkboxes`;
      return (
        <GroupContext.Provider value={{ setErrorMessage }}>
          <FieldSet
            hintText={instructions}
            label={heading}
            legendIsHeading={isOnlyField}
            errorText={errors.join(' ').trim() !== '' ? errors.join(' ').trim() : null}
            {...props}
          >
            <div className={checkboxClasses} data-module='govuk-checkboxes'>
              {children}
            </div>
          </FieldSet>
        </GroupContext.Provider>
      );
    }

    if (readOnly) {
      return <>{children}</>;
    }

    return (
      <GroupContext.Provider value={{ setErrorMessage }}>
        <FieldSet
          hintText={instructions}
          label={heading}
          legendIsHeading={isOnlyField}
          errorText={errorMessage?.message?.message}
          {...props}
        >
          {children}
        </FieldSet>
      </GroupContext.Provider>
    );
  }
}
