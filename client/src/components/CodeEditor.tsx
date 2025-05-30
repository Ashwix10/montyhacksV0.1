import React, { useRef, useEffect, useState } from 'react';
import { SupportedLanguage } from '@/types/sandbox';
import { Card, CardContent } from '@/components/ui/card';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (code: string) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  readOnly?: boolean;
  height?: number;
}

export function CodeEditor({
  code,
  language,
  onChange,
  onLanguageChange,
  readOnly = false,
  height = 400
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [monaco, setMonaco] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);

  // Load Monaco Editor
  useEffect(() => {
    const loadMonaco = async () => {
      if (typeof window !== 'undefined' && !monaco) {
        // Load Monaco from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
        
        script.onload = () => {
          const { require } = window as any;
          require.config({ 
            paths: { 
              vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
            } 
          });
          
          require(['vs/editor/editor.main'], (monacoInstance: any) => {
            setMonaco(monacoInstance);
          });
        };
        
        document.head.appendChild(script);
      }
    };

    loadMonaco();
  }, [monaco]);

  // Initialize editor
  useEffect(() => {
    if (monaco && editorRef.current && !editor) {
      const editorInstance = monaco.editor.create(editorRef.current, {
        value: code,
        language: language === 'typescript' ? 'typescript' : language,
        theme: 'vs-dark',
        readOnly,
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: { enabled: false },
        contextmenu: true,
        wordWrap: 'on',
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        glyphMargin: true,
        folding: true,
        renderLineHighlight: 'line',
        selectOnLineNumbers: true,
        matchBrackets: 'always',
        occurrencesHighlight: true,
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordBasedSuggestions: true,
      });

      // Handle content changes
      editorInstance.onDidChangeModelContent(() => {
        onChange(editorInstance.getValue());
      });

      setEditor(editorInstance);
    }
  }, [monaco, code, language, onChange, readOnly, editor]);

  // Update editor when code changes externally
  useEffect(() => {
    if (editor && code !== undefined && editor.getValue() !== code) {
      editor.setValue(code || '');
    }
  }, [editor, code]);

  // Update language when changed
  useEffect(() => {
    if (editor && monaco) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language === 'typescript' ? 'typescript' : language);
      }
    }
  }, [editor, monaco, language]);

  // Add vulnerability highlights
  const highlightVulnerabilities = (vulnerabilities: Array<{ line: number; severity: string }>) => {
    if (!editor || !monaco) return;

    const decorations: any[] = [];
    vulnerabilities.forEach(vuln => {
      const severity = vuln.severity;
      let className = '';
      
      switch (severity) {
        case 'critical':
          className = 'vulnerability-critical';
          break;
        case 'high':
          className = 'vulnerability-high';
          break;
        case 'medium':
          className = 'vulnerability-medium';
          break;
        case 'low':
          className = 'vulnerability-low';
          break;
      }

      decorations.push({
        range: new monaco.Range(vuln.line, 1, vuln.line, 1),
        options: {
          isWholeLine: true,
          className,
          glyphMarginClassName: `vulnerability-glyph-${severity}`,
          minimap: {
            color: severity === 'critical' ? '#ff0000' : 
                   severity === 'high' ? '#ff8800' :
                   severity === 'medium' ? '#ffaa00' : '#0088ff',
            position: monaco.editor.MinimapPosition.Inline
          }
        }
      });
    });

    editor.deltaDecorations([], decorations);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, [editor]);

  const getLanguageIcon = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'python':
        return '🐍';
      case 'javascript':
        return '📜';
      case 'typescript':
        return '🔷';
      default:
        return '📄';
    }
  };

  const getLanguageDisplayName = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'python':
        return 'Python';
      case 'javascript':
        return 'JavaScript';
      case 'typescript':
        return 'TypeScript';
      default:
        return lang;
    }
  };

  return (
    <Card className="glass-morphism border-0">
      <CardContent className="p-0">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              main.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="text-sm bg-background border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="python">{getLanguageIcon('python')} Python</option>
              <option value="javascript">{getLanguageIcon('javascript')} JavaScript</option>
              <option value="typescript">{getLanguageIcon('typescript')} TypeScript</option>
            </select>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div 
          ref={editorRef} 
          style={{ height: `${height}px` }}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}

// Add CSS for vulnerability highlights
const vulnerabilityStyles = `
  .vulnerability-critical {
    background-color: rgba(255, 0, 0, 0.1);
    border-left: 3px solid #ff0000;
  }
  .vulnerability-high {
    background-color: rgba(255, 136, 0, 0.1);
    border-left: 3px solid #ff8800;
  }
  .vulnerability-medium {
    background-color: rgba(255, 170, 0, 0.1);
    border-left: 3px solid #ffaa00;
  }
  .vulnerability-low {
    background-color: rgba(0, 136, 255, 0.1);
    border-left: 3px solid #0088ff;
  }
  .vulnerability-glyph-critical::before {
    content: "🔴";
    font-size: 12px;
  }
  .vulnerability-glyph-high::before {
    content: "🟠";
    font-size: 12px;
  }
  .vulnerability-glyph-medium::before {
    content: "🟡";
    font-size: 12px;
  }
  .vulnerability-glyph-low::before {
    content: "🔵";
    font-size: 12px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = vulnerabilityStyles;
  document.head.appendChild(styleSheet);
}
