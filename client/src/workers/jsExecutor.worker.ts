// JavaScript executor with sandbox restrictions
interface ExecutionMessage {
  type: 'execute';
  code: string;
  timeout?: number;
}

interface ExecutionResponse {
  type: 'result' | 'error';
  output?: string;
  error?: string;
  executionTime?: number;
}

function createSandbox() {
  // Create a restricted environment
  const sandbox = {
    // Allow safe built-ins
    console: {
      log: (...args: any[]) => {
        self.postMessage({
          type: 'result',
          output: args.map(arg => String(arg)).join(' ')
        });
      },
      error: (...args: any[]) => {
        self.postMessage({
          type: 'error',
          error: args.map(arg => String(arg)).join(' ')
        });
      },
      warn: (...args: any[]) => {
        self.postMessage({
          type: 'result',
          output: '⚠️ ' + args.map(arg => String(arg)).join(' ')
        });
      }
    },
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    TypeError,
    ReferenceError,
    SyntaxError,
    
    // Restricted globals
    setTimeout: undefined,
    setInterval: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
    WebSocket: undefined,
    eval: undefined,
    Function: undefined,
    importScripts: undefined,
    self: undefined,
    window: undefined,
    document: undefined,
    location: undefined,
    navigator: undefined
  };

  return sandbox;
}

async function executeJavaScript(code: string, timeout: number = 5000): Promise<void> {
  const startTime = Date.now();
  let timeoutId: number;

  try {
    // Set up timeout
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = self.setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, timeout);
    });

    const executionPromise = new Promise((resolve, reject) => {
      try {
        const sandbox = createSandbox();
        
        // Create a function with restricted scope
        const wrappedCode = `
          "use strict";
          ${code}
        `;

        // Execute in sandbox context
        const func = new Function(...Object.keys(sandbox), wrappedCode);
        const result = func(...Object.values(sandbox));
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

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

  if (type === 'execute') {
    await executeJavaScript(code, timeout);
  }
};
