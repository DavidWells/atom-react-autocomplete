# React propTypes autocomplete

Autocomplete prop types for components

## Install
1. Clone this repo into your atom packages folder: `/Users/davidwells/.atom/packages`
2. Inside your project run `rc-autocomplete --src 'path_to_your_components/**/*.js'` to generate your `completions.json` file

`completions.json` is what the atom plugin uses to auto complete your props

# Todo:
- [] Update autocomplete to support values of props
- [] Make autocomplete output pluggable (custom prompts)
- [] Make custom docs link pluggable
- [] Generate output for sublime text
- [] ... ?

# Inspiration

Thanks to atom https://github.com/atom/autocomplete-html/blob/master/lib/provider.coffee for the inspiration on building this

Also:

- https://twitter.com/davatron5000/status/731249986600456192
- https://github.com/buzzfeed/solid-completions