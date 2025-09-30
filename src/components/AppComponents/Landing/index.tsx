import { useEffect, useState } from 'react';
import setPageTitle from '../../helpers/setPageTitleHelpers';
import NotificationBanner from '../../BaseComponents/NotificationBanner/NotificationBanner';
import CaseDetails from './CaseDetails';
import { getCurrentLanguage } from '../../helpers/utils';
import AskHMRC from '../AskHMRC';
import { getServiceStatus } from '../../helpers/getServiceStatus';
import PageNotWorkingProperly from '../PageNotWorkingProperly';

export default function Landing(props) {
  const {
    showPortalBanner,
    isLogout,
    pConn,
    inProgressCaseCountEndPoint,
    createCaseEndpoint,
    buttonContent,
    title,
    bannerContent,
    handleCaseStart,
    caseListApiParams,
    setServiceStatus
  } = props;
  const [inprogressCaseDetail, setInprogressCaseDetail] = useState([]);
  const [loadingInProgressCaseDetail, setLoadingInProgressCaseDetail] = useState(true);

  function createCase() {
    const startingFields = {
      NotificationLanguage: getCurrentLanguage()
    };

    PCore.getMashupApi().createCase(createCaseEndpoint, PCore.getConstants().APP.APP, {
      // @ts-ignore
      startingFields,
      pageName: '',
      channelName: ''
    });

    handleCaseStart();
  }

  // Calls data page to fetch in progress caseDetail,
  // This then sets inprogress caseDetail state value to the caseDetail details.
  // This function also sets 'isloading' value to true before making d_page calls
  async function fetchInProgressCaseDetailData() {
    setLoadingInProgressCaseDetail(true);
    const serviceStatusResponse = await getServiceStatus();
    if (!serviceStatusResponse.isServiceHealthy) {
      setServiceStatus(serviceStatusResponse);
      return;
    }
    let inProgressRegData: any = [];
    const options = { invalidateCache: true };
    const context = pConn.getContextName();

    PCore.getDataPageUtils()
      // @ts-ignore
      .getDataAsync(inProgressCaseCountEndPoint, context, { ...caseListApiParams }, {}, {}, options)
      .then(resp => {
        if (!resp.resultCount) {
          createCase();
        } else {
          resp = resp.data?.slice(0, 10);
          inProgressRegData = resp;
          setInprogressCaseDetail(inProgressRegData);
        }
        setLoadingInProgressCaseDetail(false);
      });
    sessionStorage.setItem('assignmentFinishedFlag', 'false');
  }

  useEffect(() => {
    setPageTitle();
    fetchInProgressCaseDetailData();
  }, [showPortalBanner]);

  return (
    !loadingInProgressCaseDetail &&
    inprogressCaseDetail.length > 0 && (
      <main
        className={`govuk-main-wrapper ${isLogout ? 'visibility-hidden' : ''}`}
        id='main-content'
        role='main'
      >
        {showPortalBanner && <NotificationBanner content={bannerContent} />}
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-full govuk-prototype-kit-common-templates-mainstream-guide-body govuk-!-padding-right-0 govuk-!-padding-left-0'>
            {/* CaseDetail */}
            <div className='govuk-grid-column-two-thirds'>
              {inprogressCaseDetail.length > 0 && (
                <>
                  <CaseDetails
                    thePConn={pConn}
                    data={inprogressCaseDetail}
                    rowClickAction='OpenAssignment'
                    buttonContent={buttonContent}
                    title={title}
                    handleCaseStart={handleCaseStart}
                    setServiceStatus={setServiceStatus}
                  />
                  <AskHMRC />
                  <PageNotWorkingProperly />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  );
}
