import { createContext } from 'react';
// Todo: Move the context at top level
export interface AppContextValues {
  appBacklinkProps: {
    appBacklinkAction?: Function | null;
    appBacklinkText?: String | null;
  };
  showLanguageToggle?: boolean;
  serviceParam?: string;
  serviceName?: string;
  appNameHeader?: string;
}
const AppContext = createContext<AppContextValues>({
  appBacklinkProps: {
    appBacklinkAction: null,
    appBacklinkText: null
  },
  showLanguageToggle: false,
  serviceParam: '',
  serviceName: '',
  appNameHeader: ''
});

export { AppContext as default };
