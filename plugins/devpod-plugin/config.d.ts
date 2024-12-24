export interface Config {
    /**
    * Frontend root URL
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    devpod?: {
      /**
      * Default IDE to open in DevPod
      * NOTE: Visibility applies to only this field
      * @visibility frontend
      */
      defaultIDE: string;
    }
  }  