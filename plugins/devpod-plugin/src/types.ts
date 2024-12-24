export enum DevpodIDE {
    VSCODE = 'vscode',
    CLION = 'clion',
    CURSOR = 'cursor',
    FLEET = 'fleet',
    GOLAND = 'goland',
    INTELLIJ = 'intellij',
    JUPYTERNOTEBOOK = 'jupyternotebook',
    OPENVSCODE = 'openvscode',
    PHPSTORM = 'phpstorm',
    PYCHARM = 'pycharm',
    RIDER = 'rider',
    RUBYMINE = 'rubymine',
    RUSTROVER = 'rustrover',
    VSCODE_INSIDERS = 'vscode-insiders',
    WEBSTORM = 'webstorm',
  }
  
  export interface DevpodConfig {
    defaultIde?: DevpodIDE;
  }