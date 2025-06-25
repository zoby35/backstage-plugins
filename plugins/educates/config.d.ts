export interface Config {
  educates?: {
    /**
     * Enable permission framework checks
     * NOTE: Visibility applies to only this field
     * @visibility frontend
     */
    enablePermissions: boolean;
    /**
     * List of training portals
     */
    trainingPortals: Array<{
      /**
     * Frontend root URL
     * @visibility frontend
     */
      name: string;
      /**
     * Frontend root URL
     * @visibility frontend
     */
      url: string;
      /**
       * Authentication configuration
       */
      auth: {
        /**
         * Robot account username for API access
         */
        robotUsername: string;
        /**
         * Robot account password for API access
         * @visibility secret
         */
        robotPassword: string;
        /**
         * OAuth client ID for API access
         */
        clientId: string;
        /**
         * OAuth client secret for API access
         * @visibility secret
         */
        clientSecret: string;
      };
    }>;
  };
} 