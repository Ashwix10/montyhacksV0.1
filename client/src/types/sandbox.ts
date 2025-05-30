export interface Vulnerability {
  id: string;
  line: number;
  column?: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  description?: string;
}

export interface SecurityScore {
  overall: number;
  codeQuality: number;
  security: number;
  performance: number;
  grade: string;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
}

export interface TerminalLine {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'output';
  content: string;
  timestamp: Date;
}

export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'c' | 'java' | 'go' | 'rust' | 'php' | 'ruby';



export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: SupportedLanguage;
  lastModified: Date;
  isOpen?: boolean;
}

export interface EditorState {
  files: CodeFile[];
  activeFileId: string | null;
  isExecuting: boolean;
  lastScanTime?: Date;
}

export interface WorkspaceData {
  id: string;
  name: string;
  files: CodeFile[];
  createdAt: Date;
  lastModified: Date;
}
