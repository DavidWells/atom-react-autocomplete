var provider = require('./provider.js')
var fs = require('fs');
var path = require('path');
var currentFilePath = require('./getCurrentPath')

module.exports = {
  activate: function() {
    return provider.loadCompletions();
  },
  getProvider: function(){
    var cwd = currentFilePath()
    if(!cwd) {
      // no path exit early
      return null
    }
    // look for `completions.json` in the current projects root directory
    var completionsPath = (cwd[0]) ? path.resolve(cwd[0], 'completions.json') : ''
    if (fs.existsSync(completionsPath)) {
      return provider
    } else {
      return null
    }
  }
}
