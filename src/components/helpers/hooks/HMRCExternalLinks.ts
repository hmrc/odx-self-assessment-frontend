import { useEffect, useState } from 'react';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

export default function useHMRCExternalLinks() {
  const [referrerURL, setReferrerURL] = useState<string>(null);
  const [hmrcURL, setHmrcURL] = useState<string>(null);
  const [hmrcUrlMigrated, setHmrcUrlMigrated] = useState<string>(null);
  useEffect(() => {
    const getReferrerURL = async () => {
      const {
        serverConfig: { sdkContentServerUrl, sdkHmrcURL, sdkHmrcUrlMigrated }
      } = await getSdkConfig();
      setReferrerURL(sdkContentServerUrl);
      setHmrcURL(sdkHmrcURL);
      setHmrcUrlMigrated(sdkHmrcUrlMigrated);
    };
    getReferrerURL();
  }, []);

  return { referrerURL, hmrcURL, hmrcUrlMigrated };
}
