// Pyodide Web Worker with Comlink
importScripts('https://unpkg.com/comlink@4.4.1/dist/umd/comlink.js');

const VIZ_SHIM = `
class _Viz:
    def setup(self, data):
        if isinstance(data, str):
            d = list(data)
        else:
            d = list(data)
        _viz_emit({'kind': 'setup', 'data': d})

    def window(self, left, right):
        _viz_emit({'kind': 'window', 'left': int(left), 'right': int(right), 't': 0})

    def note(self, label, value):
        if isinstance(value, dict):
            _viz_emit({'kind': 'note', 'label': label, 'value': value, 't': 0})
        else:
            _viz_emit({'kind': 'note', 'label': label, 'value': value, 't': 0})

    def frame(self):
        _viz_emit({'kind': 'frame', 't': 0})

    def mark(self, index, color='lime'):
        _viz_emit({'kind': 'mark', 'index': int(index), 'color': color, 't': 0})

viz = _Viz()
`;

let pyodide = null;
let vizEvents = [];

const worker = {
  async init() {
    if (pyodide) return { ok: true };
    try {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      });

      // Register the viz_emit callback
      pyodide.globals.set('_viz_emit', (eventProxy) => {
        try {
          const event = eventProxy.toJs({ dict_converter: Object.fromEntries });
          vizEvents.push(event);
        } catch (e) {
          // Fallback for simple objects
          vizEvents.push(eventProxy);
        }
      });

      // Load the viz shim
      await pyodide.runPythonAsync(VIZ_SHIM);

      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },

  async run(userCode, testInputStr) {
    if (!pyodide) {
      const initResult = await worker.init();
      if (!initResult.ok) return { ok: false, error: 'Pyodide not initialized: ' + initResult.error, events: [], output: '' };
    }

    vizEvents = [];
    let output = '';
    let stdout = '';

    try {
      // Capture stdout
      pyodide.runPython(`
import sys
import io
_stdout_buffer = io.StringIO()
sys.stdout = _stdout_buffer
`);

      // Run the user's code + call with test input
      const wrappedCode = `
${VIZ_SHIM}

${userCode}

# Run with test input
_test_input = ${testInputStr}
if isinstance(_test_input, list) and len(_test_input) > 0:
    _result = None
    # Try to call the main function
    import types
    _funcs = [v for k, v in list(globals().items()) if isinstance(v, types.FunctionType) and not k.startswith('_')]
    if _funcs:
        _fn = _funcs[0]
        if isinstance(_test_input[0], list) or isinstance(_test_input[0], str) or isinstance(_test_input[0], int):
            try:
                _result = _fn(*_test_input)
            except Exception as _e:
                _result = str(_e)
    print(_result)
`;

      await pyodide.runPythonAsync(wrappedCode);

      // Get stdout
      stdout = pyodide.runPython('_stdout_buffer.getvalue()');
      pyodide.runPython('sys.stdout = sys.__stdout__');

      const events = [...vizEvents];
      const resultStr = stdout.trim();

      return {
        ok: true,
        events,
        output: resultStr,
        result: parseResult(resultStr),
      };
    } catch (err) {
      try {
        stdout = pyodide.runPython('_stdout_buffer.getvalue()');
        pyodide.runPython('sys.stdout = sys.__stdout__');
      } catch {}

      return {
        ok: false,
        error: String(err),
        events: [...vizEvents],
        output: stdout,
      };
    }
  },

  async runSingle(userCode, funcName, argsJson) {
    if (!pyodide) {
      const initResult = await worker.init();
      if (!initResult.ok) return { ok: false, error: 'Pyodide not initialized: ' + initResult.error };
    }

    vizEvents = [];

    try {
      pyodide.runPython(`
import sys
import io
_stdout_buffer = io.StringIO()
sys.stdout = _stdout_buffer
`);

      const wrappedCode = `
${VIZ_SHIM}

${userCode}

import json as _json
_args = _json.loads(${JSON.stringify(argsJson)})
_result = ${funcName}(*_args)
print(_json.dumps(_result))
`;

      await pyodide.runPythonAsync(wrappedCode);

      const stdout = pyodide.runPython('_stdout_buffer.getvalue()');
      pyodide.runPython('sys.stdout = sys.__stdout__');

      let result;
      try {
        result = JSON.parse(stdout.trim());
      } catch {
        result = stdout.trim();
      }

      return {
        ok: true,
        result,
        events: [...vizEvents],
        output: stdout.trim(),
      };
    } catch (err) {
      try {
        pyodide.runPython('sys.stdout = sys.__stdout__');
      } catch {}

      return {
        ok: false,
        error: String(err),
        events: [...vizEvents],
      };
    }
  },
};

function parseResult(str) {
  try {
    return JSON.parse(str);
  } catch {
    if (str === 'True') return true;
    if (str === 'False') return false;
    if (str === 'None') return null;
    return str;
  }
}

Comlink.expose(worker);
