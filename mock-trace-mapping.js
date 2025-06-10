// Mock implementation of @jridgewell/trace-mapping
exports.originalPositionFor = function() { return null; };
exports.generatedPositionFor = function() { return null; };
exports.presortedOriginalPositionFor = function() { return null; };
exports.TraceMap = function() {
  return {
    originalPositionFor: function() { return null; },
    generatedPositionFor: function() { return null; },
    presortedOriginalPositionFor: function() { return null; }
  };
};

Object.defineProperty(exports, '__esModule', { value: true }); 