export interface Config {
    /**
    * Frontend root URL
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    kubernetesResources?: {
      /**
      * Enable permission frameowrk checks
      * NOTE: Visibility applies to only this field
      * @visibility frontend
      */
      enablePermissions: boolean;
    }
  }  