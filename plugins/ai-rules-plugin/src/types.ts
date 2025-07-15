export enum AIRuleType {
  CURSOR = 'cursor',
  COPILOT = 'copilot', 
  CLINE = 'cline',
}

export interface CursorRule {
  type: AIRuleType.CURSOR;
  id: string;
  filePath: string;
  fileName: string;
  gitUrl?: string;
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
  frontmatter?: Record<string, any>;
  content: string;
}

export interface CopilotRule {
  type: AIRuleType.COPILOT;
  id: string;
  filePath: string;
  fileName: string;
  gitUrl?: string;
  content: string;
  order: number; // Position in the file
}

export interface ClineRule {
  type: AIRuleType.CLINE;
  id: string;
  filePath: string;
  fileName: string;
  gitUrl?: string;
  content: string;
  title?: string;
  sections?: Array<{
    title: string;
    content: string;
  }>;
}

export type AIRule = CursorRule | CopilotRule | ClineRule;

export interface AIRulesResponse {
  rules: AIRule[];
  totalCount: number;
  ruleTypes: AIRuleType[];
}

export interface AIRulesConfig {
  allowedRuleTypes?: AIRuleType[];
}