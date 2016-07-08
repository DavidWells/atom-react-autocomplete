# [React autocompletion atom plugin](https://atom.io/packages/atom-react-autocomplete)

Autocomplete component names & prop types for any react component used in your project.

DX for the win!

### 🎥[Demo Video](http://www.youtube.com/watch?v=UhR0JuWWhGI)

![Demo](https://cloud.githubusercontent.com/assets/532272/16675986/dffd63ae-447a-11e6-9ca7-2076d514a8e9.gif)

- Component Name autocompletion
- PropType autocompletion and inline documentation
- your feature here!

## Install Instructions

1. Search for the `atom-react-autocomplete` package in Atom and install
2. `npm i react-autocomplete-cli --save-dev` in your project root
3. Create a `.importjs.json` file in your project root directory & specify your component paths. (See example below)
4. in your project add `generate: "rc-autocomplete"` to your npm scripts
5. Run `npm run generate` to generate the projects autocompletions
6. Restart atom for it to source the completions file

`completions.json` file used by the atom plugin, you can .gitignore it or include for others using the atom plugin

**Protip** If you do commit the `completions.json` file to your project other devs on your team will not need to run the setup steps. They can just install the atom plugin and be off to the races.

`.importjs.json` example
```
{
  "lookupPaths": [
    "node_modules/react-toolbox/components/**/*.js",
    "app/src/components"
  ]
}
```

`package.json` example
```
// the `npm run generate` command will look at .importjs.json lookupPaths
"scripts": {
  "singlePath": "rc-autocomplete --src 'node_modules/react-toolbox/components/**/*.js'",
  "generate": "rc-autocomplete"
}
```

The [CLI](https://github.com/DavidWells/react-autocomplete-cli) for this can be found here: https://github.com/DavidWells/react-autocomplete-cli

## Troubleshooting

If you have `completions.json` generated in your projects root directory and autocompletions are not working, restart/refresh Atom and it should pickup the completions file.

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

## About the autocompletion

The atom plugin uses the autocomplete-plus https://github.com/atom/autocomplete-plus/wiki/Provider-API

# Inspiration

Thanks to atom https://github.com/atom/autocomplete-html/blob/master/lib/provider.coffee for the inspiration on building this

Also Props to:

- https://twitter.com/davatron5000/status/731249986600456192
- https://github.com/buzzfeed/solid-completions
- https://github.com/Galooshi/atom-import-js/
