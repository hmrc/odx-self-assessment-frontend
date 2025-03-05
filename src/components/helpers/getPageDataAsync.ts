interface getPageDataAsyncProps {
  pageName: string;
  context?: string;
  props?: Record<string, any>;
}
declare const PCore;

async function getPageDataAsync<T = any>({
  pageName,
  context = 'root',
  props
}: getPageDataAsyncProps): Promise<T | null> {
  try {
    const dataPage: Promise<T> = PCore.getDataPageUtils().getPageDataAsync(
      pageName,
      context,
      props
    ) as Promise<T>;
    return await dataPage;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error fetching data page ${pageName}:`, error);
    return null; // This line is for type compatibility, though navigation interrupts execution
  }
}

export default getPageDataAsync;
