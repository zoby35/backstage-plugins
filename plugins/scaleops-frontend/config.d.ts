export interface Config {
  /**
  * Frontend root URL
  * NOTE: Visibility applies to only this field
  * @visibility frontend
  */
  scaleops?: {
    /**
    * Frontend root URL
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    baseUrl: string;
    /**
    * Frontend root URL
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    currencyPrefix?: string;
    /**
    * Frontend root URL
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    linkToDashboard?: boolean;
    /**
    * Frontend root URL
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    authentication?: {
      /**
      * Frontend root URL
      * NOTE: Visibility applies to only this field
      * @visibility frontend
      */
      enabled: boolean;
      /**
      * Frontend root URL
      * NOTE: Visibility applies to only this field
      * @visibility frontend
      */
      type: string;
      /**
      * Frontend root URL
      * NOTE: Visibility applies to only this field
      * @visibility frontend
      */
      user: string;
      /**
      * Frontend root URL
      * NOTE: Visibility applies to only this field
      * @visibility frontend
      */
      password: string;
    };
  }
}  