// This file exports the Python viz shim as a string constant
export const VIZ_SHIM_PY = `
class _Viz:
    def setup(self, data):
        if isinstance(data, str):
            d = list(data)
        else:
            d = list(data)
        import json
        _viz_emit({'kind': 'setup', 'data': d})

    def window(self, left, right):
        _viz_emit({'kind': 'window', 'left': left, 'right': right, 't': 0})

    def note(self, label, value):
        _viz_emit({'kind': 'note', 'label': label, 'value': value, 't': 0})

    def frame(self):
        _viz_emit({'kind': 'frame', 't': 0})

    def mark(self, index, color='lime'):
        _viz_emit({'kind': 'mark', 'index': index, 'color': color, 't': 0})

viz = _Viz()
`
