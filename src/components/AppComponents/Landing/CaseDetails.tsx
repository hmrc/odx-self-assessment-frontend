import React, { useEffect, useState } from 'react';
import Button from '../../BaseComponents/Button/Button';
import PropTypes from 'prop-types';
import { scrollToTop } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

declare const PCore: any;

export default function CaseDetails(props) {
  const { thePConn, data, rowClickAction, buttonContent, title, handleCaseStart } = props;
  const { t } = useTranslation();
  const [caseDetail, setCaseDetail] = useState([]);

  const statusMapping = status => {
    switch (status) {
      case 'Open-InProgress':
        return { text: t('SAVED'), tagColour: 'blue' };
      case 'Resolved-Completed':
      case 'Resolved-Rejected':
        return { text: t('REGISTRATION_RECEIVED'), tagColour: 'purple' };
      default:
        return { text: status, tagColour: 'grey' };
    }
  };

  const containerManger = thePConn.getContainerManager();
  const resetContainer = () => {
    const context = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    containerManger.resetContainers({
      context: 'app',
      name: 'primary',
      containerItems: [context]
    });
  };

  async function _rowClick(row: any) {
    const { pyAssignmentID } = row;

    // const container = thePConn.getContainerName();
    const container = 'primary';
    // Todo: Pega constellation is expecting primary case only.
    // Research is in progress to keep it dynamic
    const target = `${PCore.getConstants().APP.APP}/${container}`;

    if (rowClickAction === 'OpenAssignment') {
      resetContainer();
      const openAssignmentOptions = { containerName: container };
      PCore.getMashupApi()
        .openAssignment(pyAssignmentID, target, openAssignmentOptions)
        .then(() => {
          scrollToTop();
          handleCaseStart(data.length);
        })
        .catch((err: Error) => console.log('Error : ', err)); // eslint-disable-line no-console
    }
  }

  function getCaseDetail() {
    const caseDetailData = [];
    data.forEach(item => {
      const dataItem = {
        SARegRef: item.pyID,
        dateCreated: dayjs(item.pxCreateDateTime).format('DD MMMM YYYY'),
        actionButton: (
          <Button
            attributes={{ className: '' }}
            variant='primary'
            onClick={() => {
              _rowClick(item);
            }}
          >
            {buttonContent}
          </Button>
        ),
        status: statusMapping(item.pyStatusWork)
      };
      caseDetailData.push(dataItem);
    });
    return caseDetailData;
  }

  useEffect(() => {
    setCaseDetail([...getCaseDetail()]);
  }, [data, buttonContent]);

  return (
    <>
      <div className='govuk-grid-row'>
        <div className='govuk-grid-column-two-thirds'>
          <h1 className='govuk-heading-l'>{title}</h1>
        </div>
      </div>
      {caseDetail.map(dataItem => (
        <React.Fragment key={dataItem.SARegRef}>
          <dl className='govuk-summary-list'>
            <div className='govuk-summary-list__row govuk-summary-list__row'>
              <dt className='govuk-summary-list__key govuk-!-width-one-third'>
                {t('DATE_CREATED')}
              </dt>
              <dd className='govuk-summary-list__value govuk-!-width-one-third'>
                {dataItem.dateCreated}
              </dd>
              <dd className='govuk-summary-list__value govuk-!-width-one-third'>
                <strong className={`govuk-tag govuk-tag--${dataItem.status.tagColour}`}>
                  {dataItem.status.text}
                </strong>
              </dd>
            </div>
          </dl>

          {dataItem.actionButton}
        </React.Fragment>
      ))}
    </>
  );
}

CaseDetails.propTypes = {
  thePConn: PropTypes.object,
  data: PropTypes.array,
  rowClickAction: PropTypes.oneOf(['OpenAssignment']),
  buttonContent: PropTypes.string,
  title: PropTypes.string,
  handleCaseStart: PropTypes.func
};
