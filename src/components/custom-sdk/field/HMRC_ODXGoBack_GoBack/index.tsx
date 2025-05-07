import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import { updateNewInstuctions } from '@pega/react-sdk-components/lib/components/helpers/instructions-utils';
import { PConnFieldProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { useTranslation } from 'react-i18next';
import { registerIgnoredField } from '../../../helpers/hooks/QuestionDisplayHooks';

interface HmrcOdxGoBackGoBackProps extends Omit<PConnFieldProps, 'value'> {
  value?: boolean;
  caption?: string;
  selectionList?: any;
  referenceList: string;
}

export default function HmrcOdxGoBackGoBack(props: HmrcOdxGoBackGoBackProps) {
  const { getPConnect, caption, value, readOnly, testId, disabled, selectionList, referenceList } =
    props;

  const thePConn = getPConnect();
  const actionsApi = thePConn.getActionsApi();
  const propName = (thePConn.getStateProps() as { value: string }).value;
  const { t } = useTranslation();
  const [checked, setChecked] = useState<boolean>(false);
  const [clickable, setClickable] = useState(true);
  const [overrideControl, setOverrideControl] = useState(false);
  const OVERRIDE_CONTROL = 'overrideControl';

  registerIgnoredField();

  function handleBackClick(isValueTrue: boolean) {
    if (isValueTrue) {
      PCore.getPubSubUtils().publish('CUSTOM_EVENT_BACK', {});
    } else {
      setChecked(true);
      handleEvent(actionsApi, 'changeNblur', propName, 'true');

      const continueButton = document.querySelector('.govuk-button') as HTMLElement;
      if (continueButton) {
        continueButton.click();
      }
    }
  }

  function removeBackLink(errorState: boolean = false) {
    if (!errorState) {
      const existingBackLinks = document.querySelectorAll('.govuk-back-link');
      existingBackLinks.forEach(link => link.remove());
    }
  }

  function addBackLink(isValueTrue: boolean) {
    const assignmentDiv = document.getElementById('Assignment');
    const mainContent = document.getElementById('main-content');
    removeBackLink();
    if (assignmentDiv && mainContent) {
      const backLink = document.createElement('a');
      backLink.href = '#';
      backLink.className = 'govuk-back-link';
      backLink.innerText = t('BACK');
      backLink.id = 'dynamic-back-link';

      backLink.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        if (!clickable) return;
        setClickable(false);
        handleBackClick(isValueTrue);
      });

      assignmentDiv.insertAdjacentElement('beforebegin', backLink);
    }
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (overrideControl) return;
    const isChecked = event.target.checked;
    setChecked(isChecked);
    handleEvent(actionsApi, 'changeNblur', propName, isChecked.toString());
  };

  useEffect(() => {
    if (String(value) === 'true') {
      // React control
      setChecked(false);
      setOverrideControl(true);
      sessionStorage.setItem(OVERRIDE_CONTROL, 'true');
      handleEvent(actionsApi, 'changeNblur', propName, 'false');
      addBackLink(true);
    } else {
      // Pega control
      if (sessionStorage.getItem(OVERRIDE_CONTROL) === 'true') return;
      // Setting the states only if OVERRIDE_CONTROL is false.
      // Can not be optimized by combining with true case logic as it's not re-rendering the component.
      // Pega constellation replaces the component.
      setOverrideControl(false);
      sessionStorage.setItem(OVERRIDE_CONTROL, 'false');
      addBackLink(false);
    }
  }, []);

  useEffect(() => {
    if (referenceList?.length > 0) {
      thePConn.setReferenceList(selectionList);
      updateNewInstuctions(thePConn, selectionList);
    }
  }, [thePConn]);

  useEffect(() => {
    PCore.getPubSubUtils().subscribe(
      'CustomAssignmentFinishedInitiated',
      errorState => removeBackLink(errorState),
      'CustomAssignmentFinishedInitiated'
    );
    return () => {
      PCore.getPubSubUtils().unsubscribe(
        'CustomAssignmentFinishedInitiated',
        'CustomAssignmentFinishedInitiated'
      );
    };
  }, []);

  const theCheckbox = (
    <FormControlLabel
      control={
        <Checkbox
          id='GoBackCheckBox'
          color='primary'
          checked={checked}
          onChange={!readOnly ? handleCheckboxChange : undefined}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          aria-hidden='true'
          tabIndex={-1}
        />
      }
      label={caption}
      labelPlacement='end'
      data-test-id={testId}
      aria-hidden='true'
      tabIndex={-1}
    />
  );

  return (
    <div className='govuk-visually-hidden' aria-hidden='true' tabIndex={-1}>
      <FormGroup tabIndex={-1} aria-hidden='true'>
        {!overrideControl && theCheckbox}
      </FormGroup>
    </div>
  );
}
