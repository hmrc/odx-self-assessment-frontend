import React, { useRef, useEffect } from 'react';
import { getInstructions } from './utils';
import type { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';

import './DefaultForm.css';

import StyledHmrcOdxGdsCheckAnswersPageWrapper from './styles';

interface HmrcOdxGdsCheckAnswersPageProps extends PConnProps {
  // If any, enter additional props that only exist on this componentName
  NumCols?: string;
  instructions?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  children: Array<any>;
}

// props passed in combination of props from property panel (config.json) and run time props from Constellation
export default function HmrcOdxGdsCheckAnswersPage(props: HmrcOdxGdsCheckAnswersPageProps) {
  // template structure setup
  const { getPConnect, NumCols = '1' } = props;
  const instructions = getInstructions(getPConnect(), props.instructions);

  let divClass: string;

  const numCols = NumCols || '1';
  switch (numCols) {
    case '1':
      divClass = 'psdk-default-form-one-column';
      break;
    case '2':
      divClass = 'psdk-default-form-two-column';
      break;
    case '3':
      divClass = 'psdk-default-form-three-column';
      break;
    default:
      divClass = 'psdk-default-form-one-column';
      break;
  }

  const arChildren = getPConnect().getChildren()[0].getPConnect().getChildren();
  const dfChildren = arChildren.map((kid, idx) => {
    kid.key = idx;
    // @ts-ignore
    return getPConnect().createComponent(kid.getPConnect().getRawMetadata());
  });

  // Create a ref to the mainer rendering container
  const dfChildrenContainerRef = useRef(null);

  const pConn = getPConnect();
  // const actions = pConn.getActionsApi();
  const containerItemID = pConn.getContextName();

  function navigateToStep(event, stepId) {
    event.preventDefault();
    const initialValue = '';
    const isImplicit = false;
    // resetting Back button control on click of 'Change'
    sessionStorage.setItem('overrideControl', 'false');
    getPConnect().setValue('.NextStep', stepId, initialValue, isImplicit);
    getPConnect().getActionsApi().finishAssignment(containerItemID);
  }

  function updateHTML(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const summaryListRows = doc.querySelectorAll('div.govuk-summary-list__row, h2, p');

    const fragment = document.createDocumentFragment();
    let openDL = false;
    let currentDL;

    summaryListRows.forEach(elem => {
      if (
        elem.tagName === 'H1' ||
        elem.tagName === 'H2' ||
        elem.tagName === 'H3' ||
        elem.tagName === 'p'
      ) {
        if (openDL) {
          fragment.appendChild(currentDL);
          fragment.appendChild(elem.cloneNode(true));
          openDL = false;
        } else {
          fragment.appendChild(elem.cloneNode(true));
        }
      } else if (elem.tagName === 'DIV') {
        const isCsV = (elem.children[1] as HTMLElement).dataset.isCsv;
        if (isCsV === 'true') {
          const csvItems = (elem as HTMLElement).children[1].textContent.split(',');
          if (csvItems.length > 1) {
            (elem as HTMLElement).children[1].innerHTML = '';
            csvItems.forEach(item => {
              const textNode = document.createTextNode(item.trim());
              (elem as HTMLElement).children[1].appendChild(textNode);
              (elem as HTMLElement).children[1].appendChild(document.createElement('br'));
            });
          }
        }
        if (!openDL) {
          openDL = true;
          currentDL = document.createElement('dl');
          //  currentDL.className = 'govuk-summary-list govuk-!-margin-bottom-9';
          currentDL.className = 'govuk-summary-list';
          currentDL.appendChild(elem.cloneNode(true));
        } else {
          currentDL.appendChild(elem.cloneNode(true));
        }
      } else if (elem.tagName === 'P') {
        fragment.appendChild(elem.cloneNode(true));
      }
    });

    if (openDL) {
      fragment.appendChild(currentDL);
    }

    // Manually copy onClick handlers from React components to their clones
    // const originalLinks = Array.from(summaryListRows);
    fragment.querySelectorAll('a').forEach(cloneLink => {
      const originalLink = cloneLink;
      if (originalLink) {
        const stepId = originalLink.getAttribute('data-step-id');
        cloneLink.addEventListener('click', event => navigateToStep(event, stepId));
      }
    });

    if (dfChildrenContainerRef.current) {
      // Clear existing content
      dfChildrenContainerRef.current.innerHTML = '';
      // Append the new content
      dfChildrenContainerRef.current.appendChild(fragment);
    }
  }

  useEffect(() => {
    if (dfChildrenContainerRef.current) {
      const checkChildren = () => {
        const container = dfChildrenContainerRef.current;
        const summaryListElement = container?.querySelector('.govuk-summary-list');

        if (summaryListElement) {
          let htmlContent = '';
          Array.from(container.children).forEach(child => {
            if (child instanceof HTMLElement) {
              if (child.tagName === 'H2' || child.tagName === 'H3') {
                htmlContent += child.outerHTML;
              } else {
                htmlContent += child.innerHTML;
              }
            }
          });

          updateHTML(htmlContent);
        } else {
          // Retry until a child with the class "govuk-summary-list" is rendered
          requestAnimationFrame(checkChildren);
        }
      };
      // Added timeout to fix rendering issue, will remove this once enhancement story related to autocomplete value implemented
      setTimeout(() => {
        checkChildren();
      }, 500);
    }
  }, [dfChildren]);

  return (
    <StyledHmrcOdxGdsCheckAnswersPageWrapper>
      <>
        {instructions && (
          <div className='psdk-default-form-instruction-text'>
            {/* server performs sanitization method for instructions html content */}
            {/* eslint-disable react/no-danger */}
            <div key='instructions' dangerouslySetInnerHTML={{ __html: instructions }} />
          </div>
        )}
        <div ref={dfChildrenContainerRef} className={divClass}>
          <div className='govuk-visually-hidden'>{dfChildren}</div>
        </div>
      </>
    </StyledHmrcOdxGdsCheckAnswersPageWrapper>
  );
}
