import { LoggerService, DiscoveryService, UrlReaderService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
const matter = require('gray-matter');

export interface AIRule {
  type: 'cursor' | 'copilot' | 'cline';
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  gitUrl?: string;
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
  order?: number;
  title?: string;
  frontmatter?: Record<string, any>;
  sections?: Array<{
    title: string;
    content: string;
  }>;
}

export interface AIRulesResponse {
  rules: AIRule[];
  totalCount: number;
  ruleTypes: string[];
}

export interface AiRulesServiceOptions {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  urlReader: UrlReaderService;
}

export class AiRulesService {
  private readonly logger: LoggerService;
  private readonly urlReader: UrlReaderService;

  constructor(options: AiRulesServiceOptions) {
    this.logger = options.logger;
    this.urlReader = options.urlReader;
  }

  async getAiRules(gitUrl: string, ruleTypes: string[]): Promise<AIRulesResponse> {
    const allRules: AIRule[] = [];

    for (const ruleType of ruleTypes) {
      try {
        switch (ruleType) {
          case 'cursor':
            const cursorRules = await this.fetchCursorRules(gitUrl);
            allRules.push(...cursorRules);
            break;
          case 'copilot':
            const copilotRules = await this.fetchCopilotRules(gitUrl);
            allRules.push(...copilotRules);
            break;
          case 'cline':
            const clineRules = await this.fetchClineRules(gitUrl);
            allRules.push(...clineRules);
            break;
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch ${ruleType} rules: ${error}`);
      }
    }

    return {
      rules: allRules,
      totalCount: allRules.length,
      ruleTypes: [...new Set(allRules.map(r => r.type))],
    };
  }

  private async fetchCursorRules(gitUrl: string): Promise<AIRule[]> {
    const rules: AIRule[] = [];
    const processedFiles = new Set<string>(); // Track processed files to avoid duplicates
    
    // Check for single .cursorrules file first
    try {
      const content = await this.fetchFileContent(gitUrl, '.cursorrules');
      const rule = this.parseCursorRule('.cursorrules', content, gitUrl);
      if (rule) {
        rules.push(rule);
        processedFiles.add('.cursorrules');
      }
    } catch (error) {
      // File not found, continue
    }

    // Check for .cursor/rules directory
    const cursorPaths = [
      '.cursor/rules',
      '.cursor',
      'cursor/rules',
      'cursor',
      '.cursorrules.d',
    ];

    for (const basePath of cursorPaths) {
      try {
        const files = await this.listDirectoryFiles(gitUrl, basePath);
        
        for (const file of files) {
          if (file.endsWith('.mdc') || file.endsWith('.md')) {
            try {
              // Always construct the full path by prepending the base path
              const fullFilePath = `${basePath}/${file}`;
              
              // Skip if we've already processed this file
              if (processedFiles.has(fullFilePath)) {
                continue;
              }
              
              const content = await this.fetchFileContent(gitUrl, fullFilePath);
              const rule = this.parseCursorRule(fullFilePath, content, gitUrl);
              if (rule) {
                rules.push(rule);
                processedFiles.add(fullFilePath);
              }
            } catch (error) {
              this.logger.warn(`Failed to fetch cursor rule ${file}: ${error}`);
            }
          }
        }
      } catch (error) {
        // Directory not found, continue
      }
    }

    // Check in common subdirectories
    const commonSubdirs = ['docs', 'documentation', 'rules', 'ai-rules', 'prompts'];
    for (const subdir of commonSubdirs) {
      try {
        const files = await this.listDirectoryFiles(gitUrl, subdir);
        
        for (const file of files) {
          if (file.endsWith('.mdc') || file.endsWith('.md')) {
            try {
              // Construct the full path by prepending the subdirectory path  
              const fullFilePath = `${subdir}/${file}`;
              
              // Skip if we've already processed this file
              if (processedFiles.has(fullFilePath)) {
                continue;
              }
              
              const content = await this.fetchFileContent(gitUrl, fullFilePath);
              const rule = this.parseCursorRule(fullFilePath, content, gitUrl);
              if (rule) {
                rules.push(rule);
                processedFiles.add(fullFilePath);
              }
            } catch (error) {
              this.logger.warn(`Failed to fetch cursor rule ${file}: ${error}`);
            }
          }
        }
      } catch (error) {
        // Directory not found, continue
      }
    }

    return rules;
  }

  private async fetchCopilotRules(gitUrl: string): Promise<AIRule[]> {
    const rules: AIRule[] = [];
    
    try {
      const content = await this.fetchFileContent(gitUrl, '.github/copilot-instructions.md');
      const parsedRules = this.parseCopilotRules(content, gitUrl);
      rules.push(...parsedRules);
    } catch (error) {
      // File not found, continue silently
    }

    return rules;
  }

  private async fetchClineRules(gitUrl: string): Promise<AIRule[]> {
    const rules: AIRule[] = [];
    const basePath = '.clinerules';
    
    try {
      const files = await this.listDirectoryFiles(gitUrl, basePath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          // Always construct the full path by prepending the base path
          const fullFilePath = `${basePath}/${file}`;
          
          try {
            const content = await this.fetchFileContent(gitUrl, fullFilePath);
            const rule = this.parseClineRule(fullFilePath, content, gitUrl);
            if (rule) {
              rules.push(rule);
            }
          } catch (error) {
            this.logger.warn(`Failed to fetch cline rule ${fullFilePath}: ${error}`);
          }
        }
      }
    } catch (error) {
      // Directory not found, continue
    }

    return rules;
  }

  private parseCursorRule(filePath: string, content: string, gitUrl: string): AIRule | null {
    try {
      const fileName = filePath.split('/').pop() || filePath;
      
      // Parse frontmatter using gray-matter
      const parsed = matter(content);
      
      return {
        type: 'cursor',
        id: `cursor-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`,
        filePath,
        fileName: fileName.replace(/\.(mdc|md)$/, ''),
        content: parsed.content.trim(),
        gitUrl,
        description: parsed.data.description,
        globs: parsed.data.globs,
        alwaysApply: parsed.data.alwaysApply,
        frontmatter: Object.keys(parsed.data).length > 0 ? parsed.data : undefined,
      };
    } catch (error) {
      this.logger.warn(`Failed to parse cursor rule ${filePath}: ${error}`);
      return null;
    }
  }



  private parseCopilotRules(content: string, gitUrl: string): AIRule[] {
    // Split by double newlines to separate rules
    const ruleContents = content.split(/\n\s*\n/).filter(rule => rule.trim().length > 0);
    
    if (ruleContents.length === 0) {
      return [];
    }

    return ruleContents.map((ruleContent, index) => ({
      type: 'copilot',
      id: `copilot-rule-${index + 1}`,
      filePath: '.github/copilot-instructions.md',
      fileName: `Rule ${index + 1}`,
      content: ruleContent.trim(),
      gitUrl,
      order: index + 1,
    }));
  }

  private parseClineRule(filePath: string, content: string, gitUrl: string): AIRule | null {
    try {
      const fileName = filePath.split('/').pop() || filePath;
      
      // Extract title from markdown (first # heading)
      const titleMatch = content.match(/^# (.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName.replace('.md', '');

      // Parse sections (## headings and their content)
      const sections: Array<{ title: string; content: string }> = [];
      const sectionRegex = /^## (.+)$/gm;
      let match;
      let lastIndex = 0;

      while ((match = sectionRegex.exec(content)) !== null) {
        if (lastIndex > 0) {
          // Get content between previous section and current
          const sectionContent = content.slice(lastIndex, match.index).trim();
          const prevMatch = content.slice(0, lastIndex).match(/^## (.+)$/g);
          if (prevMatch) {
            const prevTitle = prevMatch[prevMatch.length - 1].replace(/^## /, '');
            sections.push({ title: prevTitle, content: sectionContent });
          }
        }
        lastIndex = match.index + match[0].length;
      }

      // Handle the last section
      if (lastIndex > 0) {
        const lastSectionContent = content.slice(lastIndex).trim();
        const lastMatch = content.slice(0, lastIndex).match(/^## (.+)$/g);
        if (lastMatch) {
          const lastTitle = lastMatch[lastMatch.length - 1].replace(/^## /, '');
          sections.push({ title: lastTitle, content: lastSectionContent });
        }
      }

      return {
        type: 'cline',
        id: `cline-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`,
        filePath,
        fileName: fileName.replace('.md', ''),
        content,
        gitUrl,
        title,
        sections: sections.length > 0 ? sections : undefined,
      };
    } catch (error) {
      this.logger.warn(`Failed to parse cline rule ${filePath}: ${error}`);
      return null;
    }
  }

  // URL Reader service methods for files and directories
  private async listDirectoryFiles(gitUrl: string, path: string): Promise<string[]> {
    try {
      // Construct directory URL using the correct format
      const directoryUrl = `${gitUrl}/tree/HEAD/${path}`;

      // Use URL Reader to read the directory tree
      const treeResponse = await this.urlReader.readTree(directoryUrl);
      
      const files: string[] = [];
      
      // Extract files from the tree using the correct API
      const filesArray = await treeResponse.files();
      for (const file of filesArray) {
        // Only include actual files, not directories
        if (file.path && !file.path.endsWith('/')) {
          files.push(file.path);
        }
      }

      return files;
    } catch (error) {
      this.logger.error(`Failed to list directory ${path}: ${error}`);
      return [];  // Return empty array instead of throwing
    }
  }

  private async fetchFileContent(gitUrl: string, filePath: string): Promise<string> {
    try {
      // Construct file URL using the correct format 
      const fileUrl = `${gitUrl}/blob/HEAD/${filePath}`;

      // Use URL Reader to read the file using the documented API
      const response = await this.urlReader.readUrl(fileUrl);
      const buffer = await response.buffer();
      const content = buffer.toString('utf-8');
      
      return content;
    } catch (error) {
      throw error;
    }
  }
} 