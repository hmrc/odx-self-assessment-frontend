import getPageDataAsync from './getPageDataAsync';

interface DataPageResponse {
  IsNormalAuthentication?: boolean;
  PostAuthAction?: string;
}

const TensCheckRequired = async (): Promise<boolean> => {
  try {
    const dataResponse: DataPageResponse = await getPageDataAsync({
      pageName: 'D_PostCitizenAuthAction'
    });
    return (
      dataResponse?.IsNormalAuthentication === false && dataResponse?.PostAuthAction === 'TENS'
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};

async function checkAuthAndRedirectIfTens(): Promise<boolean> {
  const TENS_REDIRECT_URL = 'https://www.tax.service.gov.uk/protect-tax-info';

  const TensRequired: boolean = await TensCheckRequired();

  if (TensRequired) {
    const currentPage = window.location.href;
    window.location.replace(`${TENS_REDIRECT_URL}?redirectUrl=${encodeURIComponent(currentPage)}`); // This will not work in Dev as this is only available in prod
  }
  return TensRequired;
}

export default checkAuthAndRedirectIfTens;
