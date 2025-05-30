// Python executor using Pyodide
declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

let pyodide: any = null;
let isInitialized = false;

interface ExecutionMessage {
  type: 'execute' | 'init';
  code?: string;
  timeout?: number;
}

interface ExecutionResponse {
  type: 'result' | 'error' | 'ready';
  output?: string;
  error?: string;
  executionTime?: number;
}

async function initializePyodide() {
  if (isInitialized) return;

  try {
    // Load Pyodide from CDN
    self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    
    pyodide = await (self as any).loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      stdout: (text: string) => {
        self.postMessage({
          type: 'result',
          output: text
        });
      },
      stderr: (text: string) => {
        self.postMessage({
          type: 'error',
          error: text
        });
      }
    });

    // Install common packages
    await pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);
    
    isInitialized = true;
    self.postMessage({ type: 'ready' });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: `Failed to initialize Pyodide: ${error}`
    });
  }
}

async function executePython(code: string, timeout: number = 5000): Promise<void> {
  if (!isInitialized) {
    await initializePyodide();
  }

  const startTime = Date.now();
  let timeoutId: number;

  try {
    // Set up timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = self.setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, timeout);
    });

    // Restrict dangerous imports
    const restrictedCode = `
import sys
import builtins

# Restrict dangerous modules
restricted_modules = ['os', 'subprocess', 'socket', 'urllib', 'http']
for module in restricted_modules:
    if module in sys.modules:
        del sys.modules[module]

# Override dangerous builtins
original_import = builtins.__import__
def safe_import(name, *args, **kwargs):
    if name in restricted_modules:
        raise ImportError(f"Module '{name}' is not allowed in sandbox")
    return original_import(name, *args, **kwargs)
builtins.__import__ = safe_import

# Execute user code
${code}
`;

    const executionPromise = pyodide.runPython(restrictedCode);
    
    await Promise.race([executionPromise, timeoutPromise]);
    
    const executionTime = Date.now() - startTime;
    
    self.postMessage({
      type: 'result',
      output: '',
      executionTime
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    self.postMessage({
      type: 'error',
      error: String(error),
      executionTime
    });
  } finally {
    if (timeoutId!) {
      clearTimeout(timeoutId);
    }
  }
}

self.onmessage = async (event: MessageEvent<ExecutionMessage>) => {
  const { type, code, timeout } = event.data;

  switch (type) {
    case 'init':
      await initializePyodide();
      break;
    case 'execute':
      if (code) {
        await executePython(code, timeout);
      }
      break;
  }
};

// Initialize on load
initializePyodide();
