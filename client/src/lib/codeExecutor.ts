import { ExecutionResult, SupportedLanguage } from '@/types/sandbox';

class CodeExecutor {
  private pythonWorker: Worker | null = null;
  private jsWorker: Worker | null = null;
  private isPythonReady = false;

  private getPythonWorker(): Worker {
    if (!this.pythonWorker) {
      this.pythonWorker = new Worker(
        new URL('../workers/pythonExecutor.worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      this.pythonWorker.onmessage = (event) => {
        if (event.data.type === 'ready') {
          this.isPythonReady = true;
        }
      };
    }
    return this.pythonWorker;
  }

  private getJSWorker(): Worker {
    if (!this.jsWorker) {
      this.jsWorker = new Worker(
        new URL('../workers/jsExecutor.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return this.jsWorker;
  }

  async executeCode(code: string, language: SupportedLanguage, timeout = 5000): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let output = '';
      let error = '';

      const worker = language === 'python' ? this.getPythonWorker() : this.getJSWorker();

      const messageHandler = (event: MessageEvent) => {
        const { type, output: workerOutput, error: workerError, executionTime } = event.data;

        if (type === 'result') {
          if (workerOutput) output += workerOutput + '\n';
        } else if (type === 'error') {
          if (workerError) error += workerError + '\n';
        }

        // Check if execution is complete
        if (executionTime !== undefined) {
          worker.removeEventListener('message', messageHandler);
          resolve({
            output: output.trim(),
            error: error.trim() || undefined,
            executionTime: executionTime || Date.now() - startTime
          });
        }
      };

      const errorHandler = (event: ErrorEvent) => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(new Error(`Worker error: ${event.message}`));
      };

      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);

      // Set up overall timeout
      const timeoutId = setTimeout(() => {
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(new Error('Execution timeout'));
      }, timeout + 1000); // Add buffer to worker timeout

      try {
        if (language === 'python' && !this.isPythonReady) {
          // Initialize Python worker first
          worker.postMessage({ type: 'init' });
          // Wait for ready signal, then execute
          const readyHandler = (event: MessageEvent) => {
            if (event.data.type === 'ready') {
              worker.removeEventListener('message', readyHandler);
              worker.postMessage({ type: 'execute', code, timeout });
            }
          };
          worker.addEventListener('message', readyHandler);
        } else {
          worker.postMessage({ type: 'execute', code, timeout });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        reject(err);
      }

      // Clear timeout when promise resolves
      resolve = ((originalResolve) => {
        return (value: ExecutionResult) => {
          clearTimeout(timeoutId);
          originalResolve(value);
        };
      })(resolve);

      reject = ((originalReject) => {
        return (reason: any) => {
          clearTimeout(timeoutId);
          originalReject(reason);
        };
      })(reject);
    });
  }

  terminate() {
    if (this.pythonWorker) {
      this.pythonWorker.terminate();
      this.pythonWorker = null;
      this.isPythonReady = false;
    }
    if (this.jsWorker) {
      this.jsWorker.terminate();
      this.jsWorker = null;
    }
  }
}

export const codeExecutor = new CodeExecutor();
