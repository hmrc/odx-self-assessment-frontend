import React from 'react';
import PageNotWorkingProperly from '../../AppComponents/PageNotWorkingProperly';

export default function MainWrapper({ children, showPageNotWorkingLink = true }) {
  return (
    <main className='govuk-main-wrapper govuk-main-wrapper--l' id='main-content' role='main'>
      <div className='govuk-grid-row'>
        <div className='govuk-grid-column-two-thirds'>
          {children}
          {showPageNotWorkingLink && <PageNotWorkingProperly />}
        </div>
      </div>
    </main>
  );
}
