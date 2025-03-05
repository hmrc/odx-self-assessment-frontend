import React, { useEffect, forwardRef } from 'react';
import MainWrapper from '../../BaseComponents/MainWrapper';
import ParsedHTML from '../../helpers/formatters/ParsedHtml';
import setPageTitle from '../../helpers/setPageTitleHelpers';
import AskHMRC from '../AskHMRC';

const SummaryPage = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { summaryTitle, summaryContent, summaryBanner } = props;

  useEffect(() => {
    setPageTitle();
  }, [summaryTitle, summaryBanner]);

  return (
    <>
      <MainWrapper>
        <div ref={ref}>
          {summaryBanner && summaryBanner !== '' ? (
            <div className='govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-7'>
              <h1 className='govuk-panel__title'>{summaryBanner}</h1>
            </div>
          ) : (
            <h1 className='govuk-heading-l'>{summaryTitle}</h1>
          )}
          <div>
            <ParsedHTML htmlString={summaryContent} />
          </div>
          <AskHMRC />
        </div>
      </MainWrapper>
    </>
  );
});

export default SummaryPage;
