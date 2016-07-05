#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var argv = require('yargs').argv
var exec = require('child_process').exec
var generateCompletions = require('./parse-docgen')
var cwd = process.cwd()
var componentsPath = argv.src
var docGenPath = path.join(cwd, 'node_modules', 'react-docgen', 'bin', 'react-docgen.js')

if(!componentsPath) {
  console.log('no component src passed in')
  process.exit(-1);
}

// TODO: This path check is super brittle. Need a better way to do this
exec(`${docGenPath} ${componentsPath} -o react-doc-gen-output.json`, {cwd: cwd}, function (error, stdout, stderr) {
  console.log('React Doc Gen Finished. Build Tokens')
  generateCompletions()
});