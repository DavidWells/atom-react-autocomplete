var provider = require('./provider.js')

module.exports = {
  activate: function() {
    return provider.loadCompletions();
  },
  getProvider: function(){
    return provider
  }
}
