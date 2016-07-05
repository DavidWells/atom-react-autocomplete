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
    tags: {}
  }
  for (var key in tokenFile) {
    var componentName = path.basename(key, '.js')
    if(tokenFile[key].props) {
      completions.tags[componentName] = {
        attributes: Object.keys(tokenFile[key].props)
      }
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
