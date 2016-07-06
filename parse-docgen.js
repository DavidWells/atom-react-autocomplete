#!/usr/bin/env node
var argv = require('yargs').argv;
var fs = require('fs')
var path = require('path')

/**
 * takes in react-doc-gen json and generates Atom autocomplete json
 * @return {json} data used by provider.js autocomplete+
 */
function generateCompletions() {
  var tokenFile = JSON.parse(fs.readFileSync(__dirname + '/react-doc-gen-output.json', 'utf-8'))
  var completions = {
    components: {}
  }
  for (var key in tokenFile) {
    var componentName = path.basename(key, '.js')
    if(!completions.components[componentName]) {
      completions.components[componentName] = {}
    } else {
      console.log('component name collision')
    }

    if(tokenFile[key].description) {
      // set description of component
      completions.components[componentName].description = 'test'
    }

    if(tokenFile[key].props) {
      // set props of component
      completions.components[componentName].attributes = Object.keys(tokenFile[key].props)
      completions.components[componentName].props = tokenFile[key].props
    }

  }

  var dest = path.join(__dirname, 'completions.json')
  fs.writeFile(dest, JSON.stringify(completions, null, 2), function (err) {
    if (err) {
      return console.log(err)
    }
    console.log('autocomplete tokens generated')
  })
}

module.exports = generateCompletions
