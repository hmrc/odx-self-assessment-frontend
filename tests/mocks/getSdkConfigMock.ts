import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

export const mockGetSdkConfig = () => {
  const mockedGetSdkConfig = getSdkConfig as jest.MockedFunction<typeof getSdkConfig>;
  return mockedGetSdkConfig;
};

// Mock with default basepath
export const mockGetSdkConfigWithBasepath = () => {
  const mockedGetSdkConfig = mockGetSdkConfig();
  mockedGetSdkConfig.mockResolvedValue({
    serverConfig: {
      sdkContentServerUrl: 'https://localhost:3502/', // Todo: Can be moved to env specific config.
      sdkHmrcURL: 'https://www.staging.tax.service.gov.uk/',
      sdkHmrcUrlMigrated: 'https://test-www.tax.service.gov.uk/'
    }
  });
  return mockedGetSdkConfig;
};
