# Atom React PropTypes autocomplete Plugin

Autocomplete prop types for any react component. DX for the win!

![Demo](https://cloud.githubusercontent.com/assets/532272/16675986/dffd63ae-447a-11e6-9ca7-2076d514a8e9.gif)

- Component Name autocompletion
- PropType autocompletion and inline documentation
- your feature here!

## Install
1. Search for the `atom-react-autocomplete` package and install
2. `npm i react-autocomplete-cli --save-dev` in your project
3. Create `.importjs.json` file in your project root dir and specify your component paths
```
// .importjs.json example
{
  "lookupPaths": [
    "node_modules/react-toolbox/components/**/*.js",
    "app/src/components"
  ]
}
```
4. Run `node_modules/.bin/rc-autocomplete` to generate your completions for the projects
5. in your project add `generate: "rc-autocomplete"` to your npm scripts

`completions.json` is what the atom plugin uses to auto complete your props

If you have `completions.json` generated in your root directory and autocompletions are not working. Restart Atom and it should pickup the completions file

## How does this work?

[React Docgen](https://github.com/reactjs/react-docgen) generates data that is parsed into readable tokens (`completions.json`) for consumption of the atom autocomplete+ [provider](https://github.com/atom/autocomplete-plus/wiki/Provider-API) (see `lib/provider` for how the provider works)

Configuration is the same as import-js [https://github.com/Galooshi/import-js#configuration](https://github.com/Galooshi/import-js#configuration) to enable future improvements and possible automated imports

# Todo:
- [x] Get this working as standalone CLI
- [x] Separate CLI from Atom plugin
- [] Update autocomplete to support values of props
- [] Make autocomplete output pluggable (custom prompts)
- [] Make custom docs link pluggable
- [] Generate output for sublime text
- [] ... ?

## About atom plugin

The atom plugin uses the autocomplete-plus https://github.com/atom/autocomplete-plus/wiki/Provider-API

# Inspiration

Thanks to atom https://github.com/atom/autocomplete-html/blob/master/lib/provider.coffee for the inspiration on building this

Also:

- https://twitter.com/davatron5000/status/731249986600456192
- https://github.com/buzzfeed/solid-completions
- https://github.com/Galooshi/atom-import-js/blob/a0da349ccd547c9b503da30f60e8ccd26439104d/lib/getImporter.js
