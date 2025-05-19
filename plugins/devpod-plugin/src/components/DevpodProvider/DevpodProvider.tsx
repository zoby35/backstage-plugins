import { ReactNode, FC, createContext, useContext, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { DevpodConfig, DevpodIDE } from '../../types';

const defaultConfig = {
  defaultIde: DevpodIDE.VSCODE,
};

const ConfigContext = createContext(defaultConfig);

export const useDevpodConfig = () => {
  const configApi = useApi(configApiRef);
  const contextConfig = useContext(ConfigContext);
  const defaultIDE = configApi.getOptionalString('devpod.defaultIDE') as DevpodIDE || DevpodIDE.VSCODE;

  return { ...contextConfig, defaultIde: defaultIDE };
};

export const DevpodProvider: FC<{
  children: ReactNode;
  config?: DevpodConfig;
}> = ({ children, config = {} }) => {
  const configApi = useApi(configApiRef);
  const defaultIDE = configApi.getOptionalString('devpod.defaultIDE') as DevpodIDE | undefined || defaultConfig.defaultIde;

  const value = useMemo(() => ({ ...defaultConfig, ...config, defaultIde: defaultIDE }), [config, defaultIDE]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};