export interface Config {
    /**
    * AI Rules plugin configuration
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    aiRules?: {
      /**
      * Allowed rule types to search for in repositories
      * Defaults to ["cursor", "copilot"] if not specified
      * @visibility frontend
      */
      allowedRuleTypes: string[]; // e.g. ["cursor", "copilot", "cline"]
    }
  }  