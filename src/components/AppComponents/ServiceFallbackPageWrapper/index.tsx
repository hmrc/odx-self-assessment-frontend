import { ReactElement } from 'react';
import ServiceFallbackPages from '../ServiceFallbackPages';

interface ServiceStatusType {
  isServiceHealthy: boolean;
  shuttered: boolean;
  outage: boolean;
  time: string | undefined;
  date: string | undefined;
  time_cy: string | undefined;
  date_cy: string | undefined;
}

interface ServiceFallbackPageWrapperProps {
  serviceStatus: ServiceStatusType;
  children: ReactElement;
}

function ServiceFallbackPageWrapper({ serviceStatus, children }: ServiceFallbackPageWrapperProps) {
  return serviceStatus?.outage || serviceStatus?.shuttered ? (
    <ServiceFallbackPages serviceStatus={serviceStatus} />
  ) : (
    children
  );
}
export default ServiceFallbackPageWrapper;
