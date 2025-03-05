import getPageDataAsync from './getPageDataAsync';

describe('getPageDataAsync', () => {
  const mockGetPageDataAsync = jest.fn();
  const PCoreMock = {
    getDataPageUtils: () => ({
      getPageDataAsync: mockGetPageDataAsync
    })
  };

  beforeEach(() => {
    // eslint-disable-next-line no-undef
    (global as any).PCore = PCoreMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    // eslint-disable-next-line no-undef
    delete (global as any).PCore;
  });

  it('should call PCore.getDataPageUtils().getPageDataAsync with correct parameters', async () => {
    mockGetPageDataAsync.mockResolvedValue({ someKey: 'someValue' });

    const result = await getPageDataAsync({
      pageName: 'testPage',
      context: 'testContext',
      props: { key: 'value' }
    });

    expect(mockGetPageDataAsync).toHaveBeenCalledWith('testPage', 'testContext', { key: 'value' });
    expect(result).toEqual({ someKey: 'someValue' });
  });

  it('should return null if an error occurs', async () => {
    mockGetPageDataAsync.mockRejectedValue(new Error('Test Error'));

    const result = await getPageDataAsync({
      pageName: 'testPage'
    });

    expect(result).toBeNull();
  });
});
