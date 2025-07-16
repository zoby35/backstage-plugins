export interface Config {
    /**
    * AI Rules plugin configuration
    * NOTE: Visibility applies to only this field
    * @visibility frontend
    */
    aiRules?: {
      /**
      * Allowed rule types to search for in repositories
      * Defaults to ["cursor", "copilot", "cline", "claude-code"] if not specified
      * @visibility frontend
      */
      allowedRuleTypes: string[]; // e.g. ["cursor", "copilot", "cline", "claude-code"]
      /**
      * Default rule types to be pre-selected when the component loads
      * If not provided, defaults to empty array (no rules pre-selected)
      * If empty array, no rule types are pre-selected
      * If specific array, those rule types are pre-selected
      * @visibility frontend
      */
      defaultRuleTypes?: string[]; // e.g. ["cursor", "copilot"]
    }
  }  