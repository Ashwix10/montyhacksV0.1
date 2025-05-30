import React, { useState } from 'react';
import { CodeFile, SupportedLanguage } from '@/types/sandbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Folder, 
  File, 
  Plus, 
  X, 
  Edit3, 
  Save, 
  Upload,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';

interface FileManagerProps {
  files: CodeFile[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (file: CodeFile) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileUpload: () => void;
}

export function FileManager({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onFileUpload
}: FileManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const getLanguageFromExtension = (filename: string): SupportedLanguage => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'py': return 'python';
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'cpp':
      case 'cc':
      case 'cxx': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      default: return 'javascript';
    }
  };

  const getFileIcon = (language: SupportedLanguage) => {
    const icons = {
      python: '🐍',
      javascript: '📜',
      typescript: '🔷',
      cpp: '⚡',
      c: '🔧',
      java: '☕',
      go: '🚀',
      rust: '🦀',
      php: '🐘',
      ruby: '💎'
    };
    return icons[language] || '📄';
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const newFile: CodeFile = {
        id: nanoid(),
        name: newFileName.trim(),
        content: getDefaultContent(getLanguageFromExtension(newFileName)),
        language: getLanguageFromExtension(newFileName),
        lastModified: new Date(),
        isOpen: true
      };
      onFileCreate(newFile);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const getDefaultContent = (language: SupportedLanguage): string => {
    const templates = {
      python: `# Python file
print("Hello, World!")
`,
      javascript: `// JavaScript file
console.log("Hello, World!");
`,
      typescript: `// TypeScript file
console.log("Hello, World!");
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
      c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
      go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`,
      rust: `fn main() {
    println!("Hello, World!");
}
`,
      php: `<?php
echo "Hello, World!";
?>
`,
      ruby: `puts "Hello, World!"
`
    };
    return templates[language] || '';
  };

  const handleRename = (fileId: string) => {
    if (editingName.trim() && editingName !== files.find(f => f.id === fileId)?.name) {
      onFileRename(fileId, editingName.trim());
    }
    setEditingFileId(null);
    setEditingName('');
  };

  const startRename = (file: CodeFile) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  return (
    <Card className="glass-morphism border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5" />
            <span>Files</span>
            <Badge variant="secondary" className="text-xs">
              {files.length}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileUpload}
              className="h-8 w-8 p-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {/* New File Creation */}
            {isCreating && (
              <div className="p-2 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="filename.ext"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFile();
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewFileName('');
                      }
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateFile}
                    disabled={!newFileName.trim()}
                    className="h-8 w-8 p-0"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setNewFileName('');
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* File List */}
            {files.length === 0 && !isCreating ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No files in workspace</p>
                <p className="text-xs">Create or upload files to get started</p>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className={`group p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    activeFileId === file.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => onFileSelect(file.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">
                        {getFileIcon(file.language)}
                      </span>
                      
                      {editingFileId === file.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(file.id);
                            if (e.key === 'Escape') {
                              setEditingFileId(null);
                              setEditingName('');
                            }
                          }}
                          onBlur={() => handleRename(file.id)}
                          className="h-6 text-sm"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {file.name}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {file.language}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(file.lastModified).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(file);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDelete(file.id);
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}