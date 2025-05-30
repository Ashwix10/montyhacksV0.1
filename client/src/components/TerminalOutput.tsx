import React, { useRef, useEffect } from 'react';
import { TerminalLine } from '@/types/sandbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, X, Copy } from 'lucide-react';

interface TerminalOutputProps {
  lines: TerminalLine[];
  isExecuting?: boolean;
  onClear?: () => void;
}

export function TerminalOutput({ lines, isExecuting, onClear }: TerminalOutputProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [lines]);

  const getLineIcon = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'output':
        return '📤';
      default:
        return '→';
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
        return 'text-blue-400';
      case 'output':
        return 'text-gray-300';
      default:
        return 'text-gray-300';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const copyToClipboard = () => {
    const content = lines.map(line => 
      `[${formatTimestamp(line.timestamp)}] ${line.content}`
    ).join('\n');
    
    navigator.clipboard.writeText(content).then(() => {
      // Could show a toast here
    });
  };

  return (
    <Card className="glass-morphism border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="w-5 h-5 text-green-500" />
            <span className="text-lg font-semibold">Terminal Output</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isExecuting && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Executing...</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 h-64 font-mono text-sm">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            {lines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Terminal ready</p>
                  <p className="text-xs opacity-70">Execute code to see output</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {lines.map((line) => (
                  <div key={line.id} className="flex items-start space-x-2 group">
                    <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 w-16 flex-shrink-0">
                      {formatTimestamp(line.timestamp)}
                    </span>
                    <span className="text-gray-400 flex-shrink-0 mt-0.5">
                      {getLineIcon(line.type)}
                    </span>
                    <span className={`flex-1 whitespace-pre-wrap ${getLineColor(line.type)}`}>
                      {line.content}
                    </span>
                  </div>
                ))}
                {isExecuting && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <span className="text-gray-400">→</span>
                    <span className="animate-pulse">|</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
