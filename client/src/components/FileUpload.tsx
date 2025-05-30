import React, { useCallback, useState } from 'react';
import { CodeFile, SupportedLanguage } from '@/types/sandbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';

interface FileUploadProps {
  onFilesUploaded: (files: CodeFile[]) => void;
  maxFiles?: number;
}

export function FileUpload({ onFilesUploaded, maxFiles = 10 }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<CodeFile[]>([]);

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

  const processFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList).slice(0, maxFiles);
    const newCodeFiles: CodeFile[] = [];

    for (const file of files) {
      try {
        const content = await file.text();
        const codeFile: CodeFile = {
          id: nanoid(),
          name: file.name,
          content,
          language: getLanguageFromExtension(file.name),
          lastModified: new Date(),
          isOpen: true
        };
        newCodeFiles.push(codeFile);
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    setUploadedFiles(prev => [...prev, ...newCodeFiles]);
  }, [maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    e.target.value = '';
  }, [processFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUploadComplete = () => {
    onFilesUploaded(uploadedFiles);
    setUploadedFiles([]);
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

  return (
    <Card className="glass-morphism border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Code Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .py, .js, .ts, .cpp, .c, .java, .go, .rs, .php, .rb
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} files
            </p>
          </div>
          
          <input
            type="file"
            multiple
            accept=".py,.js,.ts,.cpp,.cc,.cxx,.c,.java,.go,.rs,.php,.rb"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="mt-4" asChild>
              <span className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Choose Files
              </span>
            </Button>
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Ready to Upload ({uploadedFiles.length})</h4>
              <Button onClick={handleUploadComplete} size="sm">
                Add to Workspace
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(file.language)}</span>
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {file.language}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {file.content.length} chars
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}