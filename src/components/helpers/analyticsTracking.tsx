export const pushGAConsent = (consent: boolean): void => {
  window.dataLayer = window.dataLayer || [];
  // Push the userConsent to the dataLayer
  window.dataLayer.push({
    event: 'consentTracking',
    trackingConsentMeasurementAccepted: consent
  });
};

export const enableGATracking = (): void => {
  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  // Function to dynamically load the GTM script
  const loadGTM = (id: string, dataLayerName: string = 'dataLayer'): void => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Check if the GTM script is already loaded in the DOM
    if (!document.querySelector(`script[src*="gtm.js?id=${id}"]`)) {
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      const script = document.createElement('script');
      const firstScript = document.getElementsByTagName('script')[0];

      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${id}${dataLayerName !== 'dataLayer' ? `&l=${dataLayerName}` : ''}`;

      // Insert the script before the first existing script tag
      firstScript.parentNode?.insertBefore(script, firstScript);
    }
  };

  // Push the virtualPageview event to the dataLayer
  window.dataLayer.push({
    event: 'virtualPageview'
  });

  loadGTM('GTM-PDZKSK6X');
};
