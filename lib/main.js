var provider = require('./provider.js')
var fs = require('fs');
var path = require('path');

function currentFilePath() {
  const editor = atom.workspace.getActiveTextEditor();
  return atom.project.relativizePath(editor.buffer.file.path);
}

module.exports = {
  activate: function() {
    return provider.loadCompletions();
  },
  getProvider: function(){
    var cwd = currentFilePath()
    var completionsPath = path.resolve(cwd[0], 'completions.json')
    console.log('testing', cwd[0])
    /** File to load for autocompletions */
    // default path.resolve(__dirname, '..', 'completions.json')
    if (fs.existsSync(completionsPath)) {
      return provider
    } else {
      return null
    }
  }
}
