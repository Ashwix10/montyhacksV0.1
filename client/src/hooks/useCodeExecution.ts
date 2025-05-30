import { useState, useCallback } from 'react';
import { ExecutionResult, SupportedLanguage } from '@/types/sandbox';
import { codeExecutor } from '@/lib/codeExecutor';

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  const executeCode = useCallback(async (
    code: string, 
    language: SupportedLanguage,
    timeout = 5000
  ): Promise<ExecutionResult> => {
    setIsExecuting(true);
    
    try {
      const result = await codeExecutor.executeCode(code, language, timeout);
      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: ExecutionResult = {
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLastResult(null);
    setIsExecuting(false);
  }, []);

  return {
    executeCode,
    isExecuting,
    lastResult,
    reset
  };
}
