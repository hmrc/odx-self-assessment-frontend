import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';
import apiConfig from './constants';
import { getJourneyName } from './journeyRegistry';

export interface ServiceStatusType {
  loading: boolean;
  isServiceHealthy: boolean;
  shuttered: boolean;
  outage: boolean;
  time: string | undefined;
  date: string | undefined;
  time_cy: string | undefined;
  date_cy: string | undefined;
}

export const defaultServiceStatus = {
  loading: true,
  isServiceHealthy: false,
  shuttered: false,
  outage: false,
  time: undefined,
  date: undefined,
  time_cy: undefined,
  date_cy: undefined
};

export const getServiceStatus = async (): Promise<ServiceStatusType> => {
  type ServiceStatusResponseType = {
    Shuttered: boolean;
    Outage: boolean;
    Time: string | undefined;
    Date: string | undefined;
    Time_CY: string | undefined;
    Date_CY: string | undefined;
  };
  interface ResponseType {
    data: ServiceStatusResponseType;
  }

  try {
    const sdkConfig = await getSdkConfig();
    const urlConfig = new URL(
      `${sdkConfig.serverConfig.infinityRestServerUrl}/app/${sdkConfig.serverConfig.appAlias}/api/application/v2/data_views/D_ShutterLookup`
    ).href;

    const featureID = apiConfig[getJourneyName()].shuttering.featureID;
    const featureType = 'Service';

    const parameters = new URLSearchParams(
      `{FeatureID: ${featureID}, FeatureType: ${featureType}}`
    );

    const url = `${urlConfig}?dataViewParameters=${parameters}`;
    const { invokeCustomRestApi } = PCore.getRestClient();
    return invokeCustomRestApi(
      url,
      {
        method: 'GET',
        body: '',
        headers: '',
        withoutDefaultHeaders: false
      },
      ''
    )
      .then((response: ResponseType) => {
        const { Shuttered, Outage, Time, Date, Time_CY, Date_CY } = response.data;
        return {
          loading: false,
          isServiceHealthy: !(Shuttered || Outage),
          shuttered: Shuttered || false,
          outage: Outage || false,
          time: Time,
          date: Date,
          time_cy: Time_CY,
          date_cy: Date_CY
        };
      })
      .catch((error: Error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        return { loading: false, ...defaultServiceStatus };
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return { loading: false, ...defaultServiceStatus };
  }
};
