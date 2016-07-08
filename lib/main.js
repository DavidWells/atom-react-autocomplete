var provider = require('./provider.js')
var fs = require('fs');
var path = require('path');

function currentFilePath() {
  const editor = atom.workspace.getActiveTextEditor();
  if(editor) {
    return atom.project.relativizePath(editor.buffer.file.path);
  } else {
    return false
  }
}

module.exports = {
  activate: function() {
    return provider.loadCompletions();
  },
  getProvider: function(){
    var cwd = currentFilePath()
    if(!cwd) {
      return null
    }
    var completionsPath = path.resolve(cwd[0], 'completions.json')
    /** File to load for autocompletions */
    // default path.resolve(__dirname, '..', 'completions.json')
    if (fs.existsSync(completionsPath)) {
      return provider
    } else {
      return null
    }
  }
}
