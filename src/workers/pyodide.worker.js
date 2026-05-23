// AeroPython v2 — Pyodide Web Worker
// Loads Pyodide from CDN, executes Python code, returns stdout/stderr

importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js');

let pyodide = null;
let ready = false;

async function init() {
  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/',
    });
    ready = true;
    self.postMessage({ type: 'ready' });
  } catch (err) {
    self.postMessage({ type: 'init_error', error: err.message });
  }
}

init();

self.onmessage = async (e) => {
  const { type, code } = e.data;

  if (type === 'ping') {
    self.postMessage({ type: ready ? 'ready' : 'loading' });
    return;
  }

  if (type !== 'run') return;

  if (!ready) {
    self.postMessage({ type: 'error', output: '', error: 'Python runtime not ready yet. Please wait.' });
    return;
  }

  let output = '';

  // Capture both stdout and stderr
  pyodide.setStdout({
    batched: (s) => {
      output += s + '\n';
    },
  });
  pyodide.setStderr({
    batched: (s) => {
      output += s + '\n';
    },
  });

  try {
    await pyodide.runPythonAsync(code);
    self.postMessage({ type: 'result', output: output.trim() });
  } catch (err) {
    // Clean up Pyodide traceback noise for common errors
    let errorMsg = err.message || String(err);
    // Strip the long File "<exec>" traceback lines for cleaner display
    const lines = errorMsg.split('\n');
    const relevantLines = lines.filter(
      (l) =>
        !l.trim().startsWith('File "<exec>"') &&
        !l.trim().startsWith('at ')
    );
    errorMsg = relevantLines.join('\n').trim();
    self.postMessage({ type: 'error', output: output.trim(), error: errorMsg });
  }
};
