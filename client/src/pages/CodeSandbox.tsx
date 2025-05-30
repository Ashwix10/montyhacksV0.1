import React, { useState, useCallback } from 'react';
import { SupportedLanguage, TerminalLine, EditorState, CodeFile } from '@/types/sandbox';
import { CodeEditor } from '@/components/CodeEditor';
import { VulnerabilityPanel } from '@/components/VulnerabilityPanel';
import { TerminalOutput } from '@/components/TerminalOutput';
import { SecurityScore } from '@/components/SecurityScore';
import { FileManager } from '@/components/FileManager';
import { FileUpload } from '@/components/FileUpload';
import { ExpandableCard } from '@/components/ExpandableModal';
import { useTheme } from '@/components/ThemeProvider';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useVulnerabilityScanner } from '@/hooks/useVulnerabilityScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  Search, 
  RotateCcw, 
  Download, 
  Shield,
  Sun,
  Moon,
  Palette,
  Home,
  Upload,
  Code,
  Terminal,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { Link } from 'wouter';
import { nanoid } from 'nanoid';

const defaultCode = {
  python: `import hashlib
import os

# User authentication system
password = "hunter2"  # Hardcoded password

def authenticate(user_input):
    if user_input == password:
        return True
    return False

# Dangerous eval usage
command = input("Enter command: ")
eval(command)  # Security vulnerability

print("Welcome to SecureCode Sandbox!")`,
  
  javascript: `// User authentication
const password = "hunter2"; // Hardcoded password
const apiKey = "sk-1234567890"; // Hardcoded API key

function authenticate(userInput) {
    if (userInput === password) {
        return true;
    }
    return false;
}

// Dangerous eval usage
const userCommand = prompt("Enter JavaScript:");
eval(userCommand); // Security vulnerability

console.log("Welcome to SecureCode Sandbox!");`,

  typescript: `// User authentication
const password: string = "hunter2"; // Hardcoded password
const apiKey: string = "sk-1234567890"; // Hardcoded API key

function authenticate(userInput: string): boolean {
    if (userInput === password) {
        return true;
    }
    return false;
}

// Dangerous eval usage
const userCommand: string = prompt("Enter TypeScript:") || "";
eval(userCommand); // Security vulnerability

console.log("Welcome to SecureCode Sandbox!");`
};

export default function CodeSandbox() {
  const { theme, setTheme, themes } = useTheme();
  const [editorState, setEditorState] = useState<EditorState>({
    code: defaultCode.python,
    language: 'python',
    filename: 'main.py',
    isExecuting: false
  });
  
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: 'SecureCode Sandbox initialized',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'success',
      content: 'Ready for code execution and security scanning',
      timestamp: new Date()
    }
  ]);

  const { executeCode, isExecuting, lastResult } = useCodeExecution();
  const { 
    vulnerabilities, 
    securityScore, 
    isScanning, 
    scanCodeForVulnerabilities,
    reset: resetScanner
  } = useVulnerabilityScanner();

  const addTerminalLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setTerminalLines(prev => [...prev, newLine]);
  }, []);

  const handleCodeChange = useCallback((code: string) => {
    setEditorState(prev => ({ ...prev, code }));
  }, []);

  const handleLanguageChange = useCallback((language: SupportedLanguage) => {
    const filename = `main.${language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}`;
    setEditorState(prev => ({
      ...prev,
      language,
      filename,
      code: defaultCode[language]
    }));
    resetScanner();
    setTerminalLines([]);
  }, [resetScanner]);

  const handleScanCode = useCallback(async () => {
    addTerminalLine('info', 'Starting security scan...');
    
    try {
      const foundVulnerabilities = await scanCodeForVulnerabilities(
        editorState.code, 
        editorState.language
      );
      
      if (foundVulnerabilities.length === 0) {
        addTerminalLine('success', 'No vulnerabilities detected');
      } else {
        addTerminalLine('warning', `Found ${foundVulnerabilities.length} vulnerabilities`);
        foundVulnerabilities.forEach(vuln => {
          addTerminalLine('error', `Line ${vuln.line}: ${vuln.message}`);
        });
      }
      
      addTerminalLine('info', 'Security scan completed');
    } catch (error) {
      addTerminalLine('error', `Scan failed: ${error}`);
    }
  }, [editorState.code, editorState.language, scanCodeForVulnerabilities, addTerminalLine]);

  const handleRunCode = useCallback(async () => {
    if (isExecuting) return;
    
    addTerminalLine('info', `Executing ${editorState.language} code...`);
    setEditorState(prev => ({ ...prev, isExecuting: true }));
    
    try {
      const result = await executeCode(editorState.code, editorState.language);
      
      if (result.output) {
        addTerminalLine('output', result.output);
      }
      
      if (result.error) {
        addTerminalLine('error', result.error);
      }
      
      addTerminalLine('success', `Execution completed in ${result.executionTime}ms`);
    } catch (error) {
      addTerminalLine('error', `Execution failed: ${error}`);
    } finally {
      setEditorState(prev => ({ ...prev, isExecuting: false }));
    }
  }, [editorState.code, editorState.language, executeCode, isExecuting, addTerminalLine]);

  const handleReset = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      code: defaultCode[prev.language],
      isExecuting: false
    }));
    setTerminalLines([]);
    resetScanner();
    addTerminalLine('info', 'Editor reset');
  }, [resetScanner, addTerminalLine]);

  const handleExport = useCallback(() => {
    const report = [
      'SecureCode Sandbox Report',
      '========================',
      '',
      `Language: ${editorState.language}`,
      `Generated: ${new Date().toISOString()}`,
      `Security Score: ${securityScore.overall}/100 (${securityScore.grade})`,
      '',
      'Vulnerabilities:',
      ...vulnerabilities.map(v => 
        `- Line ${v.line}: ${v.type} (${v.severity}) - ${v.message}`
      ),
      '',
      'Code:',
      '-----',
      editorState.code,
      '',
      'Terminal Output:',
      '---------------',
      ...terminalLines.map(line => 
        `[${line.timestamp.toISOString()}] ${line.type.toUpperCase()}: ${line.content}`
      )
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addTerminalLine('success', 'Report exported successfully');
  }, [editorState, securityScore, vulnerabilities, terminalLines, addTerminalLine]);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  const handleVulnerabilityClick = useCallback((vulnerability: any) => {
    addTerminalLine('info', `Jumping to line ${vulnerability.line}: ${vulnerability.message}`);
  }, [addTerminalLine]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="glass-morphism border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SecureCode Sandbox</h1>
                <p className="text-sm text-muted-foreground">In-Browser Code Environment</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="flex items-center space-x-2 glass-morphism rounded-xl p-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="h-8"
                >
                  <Sun className="w-4 h-4 mr-1" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="h-8"
                >
                  <Moon className="w-4 h-4 mr-1" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'vibe' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('vibe')}
                  className="h-8"
                >
                  <Palette className="w-4 h-4 mr-1" />
                  Vibe
                </Button>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg glass-morphism">
                <div className={`w-2 h-2 rounded-full ${
                  isExecuting ? 'bg-yellow-400 animate-pulse' : 
                  isScanning ? 'bg-blue-400 animate-pulse' : 
                  'bg-green-400'
                }`}></div>
                <span className="text-sm font-medium">
                  {isExecuting ? 'Executing' : isScanning ? 'Scanning' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Editor Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <Card className="glass-morphism border-0">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      Security Score: {securityScore.overall}/100
                    </Badge>
                    <Separator orientation="vertical" className="h-6" />
                    <Badge variant="outline" className="px-3 py-1">
                      {vulnerabilities.length} vulnerabilities
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleScanCode}
                      disabled={isScanning}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>{isScanning ? 'Scanning...' : 'Scan Code'}</span>
                    </Button>

                    <Button
                      onClick={handleRunCode}
                      disabled={isExecuting || editorState.isExecuting}
                      className="flex items-center space-x-2"
                      size="sm"
                    >
                      {isExecuting ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </Button>

                    <Button
                      onClick={handleExport}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <CodeEditor
              code={editorState.code}
              language={editorState.language}
              onChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              height={400}
            />

            {/* Terminal Output */}
            <TerminalOutput
              lines={terminalLines}
              isExecuting={isExecuting || editorState.isExecuting}
              onClear={clearTerminal}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Security Score */}
            <SecurityScore score={securityScore} />

            {/* Vulnerabilities */}
            <VulnerabilityPanel
              vulnerabilities={vulnerabilities}
              onVulnerabilityClick={handleVulnerabilityClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
