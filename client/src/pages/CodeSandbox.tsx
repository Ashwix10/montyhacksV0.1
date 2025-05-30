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

const defaultCode: Record<SupportedLanguage, string> = {
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

print("Welcome to CodeVault!")`,
  
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

console.log("Welcome to CodeVault!");`,

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

console.log("Welcome to CodeVault!");`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string password = "hunter2"; // Hardcoded password
    string userInput;
    
    cout << "Enter password: ";
    cin >> userInput;
    
    if (userInput == password) {
        cout << "Welcome to CodeVault!" << endl;
    }
    
    return 0;
}`,

  c: `#include <stdio.h>
#include <string.h>

int main() {
    char password[] = "hunter2"; // Hardcoded password
    char userInput[100];
    
    printf("Enter password: ");
    scanf("%s", userInput);
    
    if (strcmp(userInput, password) == 0) {
        printf("Welcome to CodeVault!\\n");
    }
    
    return 0;
}`,

  java: `public class Main {
    private static final String PASSWORD = "hunter2"; // Hardcoded password
    
    public static void main(String[] args) {
        System.out.println("Welcome to CodeVault!");
        
        // Hardcoded credentials
        String apiKey = "sk-1234567890";
        
        authenticate("user");
    }
    
    public static boolean authenticate(String userInput) {
        return PASSWORD.equals(userInput);
    }
}`,

  go: `package main

import "fmt"

func main() {
    password := "hunter2" // Hardcoded password
    apiKey := "sk-1234567890" // Hardcoded API key
    
    fmt.Println("Welcome to CodeVault!")
    
    authenticate(password)
}

func authenticate(userInput string) bool {
    return userInput == "hunter2"
}`,

  rust: `fn main() {
    let password = "hunter2"; // Hardcoded password
    let api_key = "sk-1234567890"; // Hardcoded API key
    
    println!("Welcome to CodeVault!");
    
    authenticate(password);
}

fn authenticate(user_input: &str) -> bool {
    user_input == "hunter2"
}`,

  php: `<?php
$password = "hunter2"; // Hardcoded password
$apiKey = "sk-1234567890"; // Hardcoded API key

function authenticate($userInput) {
    global $password;
    return $userInput === $password;
}

echo "Welcome to CodeVault!";
?>`,

  ruby: `# User authentication
password = "hunter2"  # Hardcoded password
api_key = "sk-1234567890"  # Hardcoded API key

def authenticate(user_input)
  user_input == "hunter2"
end

puts "Welcome to CodeVault!"`
};

export default function CodeSandbox() {
  const { theme, setTheme, themes } = useTheme();
  const defaultFileId = nanoid();
  const [editorState, setEditorState] = useState<EditorState>({
    files: [
      {
        id: defaultFileId,
        name: 'main.py',
        content: defaultCode.python,
        language: 'python',
        lastModified: new Date(),
        isOpen: true
      }
    ],
    activeFileId: defaultFileId,
    isExecuting: false
  });
  
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'info',
      content: 'CodeVault initialized',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'success',
      content: 'Ready for code execution and security scanning',
      timestamp: new Date()
    }
  ]);

  const [showFileUpload, setShowFileUpload] = useState(false);

  const { executeCode, isExecuting, lastResult } = useCodeExecution();
  const { 
    vulnerabilities, 
    securityScore, 
    isScanning, 
    scanCodeForVulnerabilities,
    reset: resetScanner
  } = useVulnerabilityScanner();

  // Get current active file
  const activeFile = editorState.files.find(f => f.id === editorState.activeFileId);

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
    if (editorState.activeFileId) {
      setEditorState(prev => ({
        ...prev,
        files: prev.files.map(file => 
          file.id === prev.activeFileId 
            ? { ...file, content: code, lastModified: new Date() }
            : file
        )
      }));
    }
  }, [editorState.activeFileId]);

  const handleLanguageChange = useCallback((language: SupportedLanguage) => {
    if (editorState.activeFileId) {
      const extension = getFileExtension(language);
      const newName = `main.${extension}`;
      
      setEditorState(prev => ({
        ...prev,
        files: prev.files.map(file => 
          file.id === prev.activeFileId 
            ? { ...file, language, name: newName, content: defaultCode[language], lastModified: new Date() }
            : file
        )
      }));
      resetScanner();
      setTerminalLines([]);
    }
  }, [editorState.activeFileId, resetScanner]);

  const getFileExtension = (language: SupportedLanguage): string => {
    const extensions = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb'
    };
    return extensions[language];
  };

  const handleScanCode = useCallback(async () => {
    if (!activeFile) {
      addTerminalLine('error', 'No active file to scan');
      return;
    }

    addTerminalLine('info', 'Starting security scan...');
    
    try {
      const foundVulnerabilities = await scanCodeForVulnerabilities(
        activeFile.content, 
        activeFile.language
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
  }, [activeFile, scanCodeForVulnerabilities, addTerminalLine]);

  const handleRunCode = useCallback(async () => {
    if (isExecuting || !activeFile) return;
    
    if (!activeFile) {
      addTerminalLine('error', 'No active file to execute');
      return;
    }
    
    addTerminalLine('info', `Executing ${activeFile.language} code...`);
    setEditorState(prev => ({ ...prev, isExecuting: true }));
    
    try {
      const result = await executeCode(activeFile.content, activeFile.language);
      
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
  }, [activeFile, executeCode, isExecuting, addTerminalLine]);

  const handleReset = useCallback(() => {
    if (!activeFile) return;
    
    setEditorState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.id === prev.activeFileId 
          ? { ...file, content: defaultCode[file.language], lastModified: new Date() }
          : file
      ),
      isExecuting: false
    }));
    setTerminalLines([]);
    resetScanner();
    addTerminalLine('info', 'File reset to default template');
  }, [activeFile, resetScanner, addTerminalLine]);

  const handleExport = useCallback(() => {
    if (!activeFile) {
      addTerminalLine('error', 'No active file to export');
      return;
    }

    const report = [
      'CodeVault Security Report',
      '========================',
      '',
      `File: ${activeFile.name}`,
      `Language: ${activeFile.language}`,
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
      activeFile.content,
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
  }, [activeFile, securityScore, vulnerabilities, terminalLines, addTerminalLine]);

  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
    addTerminalLine('info', 'Terminal cleared');
  }, [addTerminalLine]);

  const handleVulnerabilityClick = useCallback((vulnerability: any) => {
    addTerminalLine('info', `Jumping to line ${vulnerability.line}: ${vulnerability.message}`);
  }, [addTerminalLine]);

  // File management functions
  const handleFileSelect = useCallback((fileId: string) => {
    setEditorState(prev => ({ ...prev, activeFileId: fileId }));
    addTerminalLine('info', `Switched to file: ${editorState.files.find(f => f.id === fileId)?.name}`);
  }, [editorState.files, addTerminalLine]);

  const handleFileCreate = useCallback((file: CodeFile) => {
    setEditorState(prev => ({
      ...prev,
      files: [...prev.files, file],
      activeFileId: file.id
    }));
    addTerminalLine('success', `Created new file: ${file.name}`);
  }, [addTerminalLine]);

  const handleFileDelete = useCallback((fileId: string) => {
    const file = editorState.files.find(f => f.id === fileId);
    if (!file) return;

    setEditorState(prev => {
      const newFiles = prev.files.filter(f => f.id !== fileId);
      return {
        ...prev,
        files: newFiles,
        activeFileId: prev.activeFileId === fileId 
          ? (newFiles.length > 0 ? newFiles[0].id : null)
          : prev.activeFileId
      };
    });
    addTerminalLine('info', `Deleted file: ${file.name}`);
  }, [editorState.files, addTerminalLine]);

  const handleFileRename = useCallback((fileId: string, newName: string) => {
    setEditorState(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.id === fileId 
          ? { ...file, name: newName, lastModified: new Date() }
          : file
      )
    }));
    addTerminalLine('info', `Renamed file to: ${newName}`);
  }, [addTerminalLine]);

  const handleFilesUploaded = useCallback((newFiles: CodeFile[]) => {
    setEditorState(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
      activeFileId: newFiles.length > 0 ? newFiles[0].id : prev.activeFileId
    }));
    addTerminalLine('success', `Uploaded ${newFiles.length} file(s)`);
    setShowFileUpload(false);
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
                <h1 className="text-xl font-bold">CodeVault</h1>
                <p className="text-sm text-muted-foreground">Secure Code Environment</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>

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
            {activeFile ? (
              <ExpandableCard
                title={`Code Editor - ${activeFile.name}`}
                icon={<Code className="w-5 h-5" />}
              >
                <CodeEditor
                  code={activeFile.content}
                  language={activeFile.language}
                  onChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  height={400}
                />
              </ExpandableCard>
            ) : (
              <Card className="glass-morphism border-0">
                <CardContent className="p-8 text-center">
                  <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No file selected</p>
                  <p className="text-muted-foreground">Create or select a file to start coding</p>
                </CardContent>
              </Card>
            )}

            {/* Terminal Output */}
            <ExpandableCard
              title="Terminal Output"
              icon={<Terminal className="w-5 h-5" />}
            >
              <TerminalOutput
                lines={terminalLines}
                isExecuting={isExecuting || editorState.isExecuting}
                onClear={clearTerminal}
              />
            </ExpandableCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Manager */}
            <FileManager
              files={editorState.files}
              activeFileId={editorState.activeFileId}
              onFileSelect={handleFileSelect}
              onFileCreate={handleFileCreate}
              onFileDelete={handleFileDelete}
              onFileRename={handleFileRename}
              onFileUpload={() => setShowFileUpload(true)}
            />

            {/* Security Score */}
            <ExpandableCard
              title="Security Score"
              icon={<Gauge className="w-5 h-5" />}
            >
              <SecurityScore score={securityScore} />
            </ExpandableCard>

            {/* Vulnerabilities */}
            <ExpandableCard
              title="Vulnerabilities"
              icon={<AlertTriangle className="w-5 h-5" />}
            >
              <VulnerabilityPanel
                vulnerabilities={vulnerabilities}
                onVulnerabilityClick={handleVulnerabilityClick}
              />
            </ExpandableCard>
          </div>
        </div>
      </main>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Upload Code Files</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <FileUpload onFilesUploaded={handleFilesUploaded} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
