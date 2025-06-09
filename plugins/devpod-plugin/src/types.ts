export enum DevpodIDE {
    VSCODE = 'vscode',
    CLION = 'clion',
    CODIUM = 'codium',
    CURSOR = 'cursor',
    DATASPELL = 'dataspell',
    FLEET = 'fleet',
    GOLAND = 'goland',
    INTELLIJ = 'intellij',
    JUPYTERNOTEBOOK = 'jupyternotebook',
    OPENVSCODE = 'openvscode',
    PHPSTORM = 'phpstorm',
    POSITRON = 'positron',
    PYCHARM = 'pycharm',
    RIDER = 'rider',
    RSTUDIO = 'rstudio',
    RUBYMINE = 'rubymine',
    RUSTROVER = 'rustrover',
    VSCODE_INSIDERS = 'vscode-insiders',
    WEBSTORM = 'webstorm',
    ZED = 'zed',
  }
  
  export interface DevpodConfig {
    defaultIde?: DevpodIDE;
  }