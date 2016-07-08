/* Atom autocomplete+ provider */
var fs = require('fs');
var path = require('path');
var trailingWhitespace = /\s$/;
var attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
var tagPattern = /<([a-zA-Z][-a-zA-Z]*)(?:\s|$)/;

function currentFilePath() {
  const editor = atom.workspace.getActiveTextEditor();
  if(editor) {
    return atom.project.relativizePath(editor.buffer.file.path);
  } else {
    return false
  }
}

module.exports = {
  selector: '.source.js.jsx',
  disableForSelector: '.text.html .comment',
  filterSuggestions: true,
  getSuggestions: function(request) {
    var prefix;
    prefix = request.prefix;
    if (this.isAttributeValueStartWithNoPrefix(request)) {
      console.log('this.isAttributeValueStartWithNoPrefix')
      return this.getAttributeValueCompletions(request);
    } else if (this.isAttributeValueStartWithPrefix(request)) {
      console.log('this.isAttributeValueStartWithPrefix')
      return this.getAttributeValueCompletions(request, prefix);
    } else if (this.isAttributeStartWithNoPrefix(request)) {
      console.log('isAttributeStartWithNoPrefix')
      // matching for tags currently
      return this.getAttributeNameCompletions(request);
    } else if (this.isAttributeStartWithPrefix(request)) {
      return this.getAttributeNameCompletions(request, prefix);
    } else if (this.isStringAttribute(request)) {
      // punctuation.definition.string.end.jsx
      console.log('isStringAttribute')
      console.log('has string attr')
      this.doStringCompletion(request)
      return ['lolo', 'troloolo', 'dope']
    } else if (this.isTagStartWithNoPrefix(request)) {
      console.log('isTagStartWithNoPrefix')
      return this.getTagNameCompletions();
    } else if (this.isTagStartTagWithPrefix(request)) {
      console.log('isTagStartTagWithPrefix')
      return this.getTagNameCompletions(prefix);
    } else {
      console.log('no match')
      return [];
    }
  },
  isStringAttribute: function(arg) {
    var scopeDescriptor = arg.scopeDescriptor;
    console.log('scope', scopeDescriptor)
    return this.hasStringAttributeScope(scopeDescriptor.getScopesArray())
  },
  doStringCompletion: function (arg) {
    var editor = arg.editor
    var bufferPosition = arg.bufferPosition;
    var tag = this.getPreviousTag(editor, bufferPosition);
    var property =  this.getPreviousAttribute(editor, bufferPosition);
    console.log('the tag is ', tag)
    console.log('the prop is ', property)
    // Return the possible prop values
  },
  onDidInsertSuggestion: function(arg) {
    var editor, suggestion;
    editor = arg.editor, suggestion = arg.suggestion;
    if (suggestion.type === 'attribute') {
      return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
    }
  },
  triggerAutocomplete: function(editor) {
    return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
      activatedManually: false
    });
  },
  isTagStartWithNoPrefix: function(arg) {
    var prefix, scopeDescriptor, scopes;
    prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
    scopes = scopeDescriptor.getScopesArray();
    console.log(scopes)
    if (prefix === '<' && scopes.length === 1) {
      return true;
    } else if (prefix === '<' && scopes.length === 2) {
      return scopes[0] === 'text.html.basic' && scopes[1] === 'meta.scope.outside-tag.html';
    } else {
      return false;
    }
  },
  isTagStartTagWithPrefix: function(arg) {
    var prefix, scopeDescriptor;
    prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
    if (!prefix) {
      return false;
    }
    if (trailingWhitespace.test(prefix)) {
      return false;
    }
    return this.hasTagScope(scopeDescriptor.getScopesArray());
  },
  isAttributeStartWithNoPrefix: function(arg) {
    var prefix, scopeDescriptor;
    prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
    var scopes = scopeDescriptor.scopes
    console.log('waht', arg)
    // if (!trailingWhitespace.test(prefix)) {
    //   return false;
    // }
    var buffer = arg.editor.buffer
    var bufferPosition = arg.bufferPosition
    var lastChar = buffer.getTextInRange([
      [bufferPosition.row, bufferPosition.column - (arg.prefix.length + 1)],
      [bufferPosition.row, bufferPosition.column]
    ])

    if (lastChar.indexOf('<') !== -1
      || lastChar.indexOf('>') !== -1
      || scopes.indexOf('string.quoted.double.js') !== -1
      || scopes.indexOf('meta.embedded.expression.js') !== -1) {
      // if is react tag exit
      return false;
    }
    return this.hasTagScope(scopeDescriptor.getScopesArray());
  },
  isAttributeStartWithPrefix: function(arg) {
    var prefix, scopeDescriptor, scopes;
    prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
    if (!prefix) {
      return false;
    }
    if (trailingWhitespace.test(prefix)) {
      return false;
    }
    scopes = scopeDescriptor.getScopesArray();
    if (scopes.indexOf('entity.other.attribute-name.html') !== -1) {
      return true;
    }
    if (!this.hasTagScope(scopes)) {
      return false;
    }
    return scopes.indexOf('punctuation.definition.tag.html') !== -1 || scopes.indexOf('punctuation.definition.tag.end.html') !== -1;
  },
  isAttributeValueStartWithNoPrefix: function(arg) {
    var lastPrefixCharacter, prefix, scopeDescriptor, scopes;
    scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
    lastPrefixCharacter = prefix[prefix.length - 1];
    if (lastPrefixCharacter !== '"' && lastPrefixCharacter !== "'") {
      return false;
    }
    scopes = scopeDescriptor.getScopesArray();
    return this.hasStringScope(scopes) && this.hasTagScope(scopes);
  },
  isAttributeValueStartWithPrefix: function(arg) {
    var lastPrefixCharacter, prefix, scopeDescriptor, scopes;
    scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
    lastPrefixCharacter = prefix[prefix.length - 1];
    if (lastPrefixCharacter === '"' || lastPrefixCharacter === "'") {
      return false;
    }
    scopes = scopeDescriptor.getScopesArray();
    return this.hasStringScope(scopes) && this.hasTagScope(scopes);
  },
  hasTagScope: function(scopes) {
    return scopes.indexOf('meta.tag.any.html') !== -1
    || scopes.indexOf('meta.tag.other.html') !== -1
    || scopes.indexOf('meta.tag.block.any.html') !== -1
    || scopes.indexOf('meta.tag.inline.any.html') !== -1
    || scopes.indexOf('meta.tag.jsx') !== -1
    || scopes.indexOf('meta.tag.structure.any.html') !== -1;
  },
  hasStringAttributeScope: function(scopes) {
    return scopes.indexOf('string.quoted.double.js') !== -1
  },
  hasStringScope: function(scopes) {
    return scopes.indexOf('string.quoted.double.html') !== -1 || scopes.indexOf('string.quoted.single.html') !== -1;
  },
  getTagNameCompletions: function(prefix) {
    var attributes, completions, ref, tag;
    completions = [];
    ref = this.completions.components;
    for (tag in ref) {
      attributes = ref[tag];
      if (!prefix || firstCharsEqual(tag, prefix)) {
        completions.push(this.buildTagCompletion(tag));
      }
    }
    return completions;
  },
  buildTagCompletion: function(tag) {
    return {
      text: tag,
      type: 'tag',
      description: "HTML <" + tag + "> tag",
      descriptionMoreURL: this.getTagDocsURL(tag)
    };
  },
  getAttributeNameCompletions: function(arg, prefix) {
    var attribute, bufferPosition, completions, editor, i, len, options, ref, tag, tagAttributes;
    editor = arg.editor, bufferPosition = arg.bufferPosition;
    completions = [];
    tag = this.getPreviousTag(editor, bufferPosition);
    tagAttributes = this.getTagAttributes(tag);
    for (i = 0, len = tagAttributes.length; i < len; i++) {
      attribute = tagAttributes[i];
      if (!prefix || firstCharsEqual(attribute, prefix)) {
        completions.push(this.buildAttributeCompletion(attribute, tag));
      }
    }
    ref = this.completions.attributes;
    for (attribute in ref) {
      options = ref[attribute];
      if (!prefix || firstCharsEqual(attribute, prefix)) {
        if (options.global) {
          completions.push(this.buildAttributeCompletion(attribute));
        }
      }
    }
    return completions;
  },
  buildAttributeCompletion: function(attribute, tag) {
    var snippet = '' // default snippet
    // do check for prop type bool
    if (tag != null) {
      console.log('component data', this.completions.components[tag])
      var componentPropType = this.completions.components[tag].props[attribute].type.name
      var description = this.completions.components[tag].props[attribute].description
      var required = this.completions.components[tag].props[attribute].required
      var hasDefaultValue = this.completions.components[tag].props[attribute].defaultValue
      var requiredText = (required) ? "(required)" : ""
      if(componentPropType === "string" || componentPropType === "enum") {
        snippet = attribute + "=\"$1\"$0";
      } else {
        snippet = attribute + "={$1}$0";
      }
      var defaultValueText = ''
      if(hasDefaultValue) {
        defaultValueText = " defaul value: " + hasDefaultValue.value
      }
      /* ATOM provider display API docs
      text: 'someText' # OR
       snippet: 'someText(${1:myArg})'
       displayText: 'someText' # (optional)
       replacementPrefix: 'so' # (optional)
       type: 'function' # (optional)
       leftLabel: '' # (optional)
       leftLabelHTML: '' # (optional)
       rightLabel: '' # (optional)
       rightLabelHTML: '' # (optional)
       className: '' # (optional)
       iconHTML: '' # (optional)
       description: '' # (optional)
       descriptionMoreURL: '' # (optional)
       */
      var react = `<span style="display:inline-block; width: 25px; height: 25px; margin-top:10px;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0, 0, 570, 510"><path fill="none" d="M0 0h570v510H0z"/><path d="M334.696 254.628c0 27.706-22.46 50.167-50.167 50.167s-50.168-22.46-50.168-50.167c0-27.706 22.46-50.167 50.167-50.167 27.705 0 50.166 22.462 50.166 50.168z" fill="#00D8FF"/><path d="M284.53 152.628c67.355 0 129.927 9.665 177.106 25.907 56.844 19.57 91.794 49.233 91.794 76.093 0 27.99-37.04 59.503-98.083 79.728-46.15 15.29-106.88 23.272-170.818 23.272-65.555 0-127.63-7.492-174.29-23.44-59.047-20.183-94.612-52.104-94.612-79.56 0-26.642 33.37-56.076 89.415-75.616 47.355-16.51 111.472-26.384 179.486-26.384z" stroke="#00D8FF" stroke-width="24" stroke-miterlimit="10" fill="none"/><path d="M195.736 203.922c33.65-58.348 73.28-107.724 110.92-140.48 45.35-39.466 88.507-54.923 111.775-41.505C442.68 35.92 451.474 83.75 438.5 146.733c-9.81 47.618-33.234 104.212-65.176 159.6-32.75 56.79-70.25 106.82-107.377 139.273-46.98 41.068-92.4 55.93-116.185 42.213-23.08-13.31-31.906-56.922-20.834-115.234 9.355-49.27 32.832-109.745 66.81-168.664z" stroke="#00D8FF" stroke-width="24" stroke-miterlimit="10" fill="none"/><path d="M195.82 306.482c-33.745-58.292-56.73-117.287-66.31-166.255-11.545-59-3.383-104.11 19.863-117.566 24.224-14.023 70.055 2.245 118.14 44.94C303.87 99.88 341.2 148.44 373.236 203.775c32.844 56.733 57.46 114.21 67.036 162.582 12.117 61.213 2.31 107.984-21.453 121.74-23.058 13.348-65.25-.784-110.24-39.5-38.013-32.71-78.682-83.252-112.76-142.114z" stroke="#00D8FF" stroke-width="24" stroke-miterlimit="10" fill="none"/></svg></span>`

var leftLabelHTML = `<span>
  ${attribute} ${requiredText} other stuff
</span>`
      return {
        snippet: snippet,
        displayText: attribute + requiredText,
        //leftLabelHTML: leftLabelHTML,
        //rightLabel: "<" + tag + ">",
        rightLabel: componentPropType,
        iconHTML: react,
        //rightLabelHTML: react,
        description: "<" + tag + " "+attribute+"> prop " + description,
        descriptionMoreURL: this.getLocalAttributeDocsURL(attribute, tag)
      };
    } else {
      return {
        snippet: attribute + "=\"$1\"$0",
        displayText: attribute,
        type: 'attribute',
        description: "Global " + attribute + " attribute",
        descriptionMoreURL: this.getGlobalAttributeDocsURL(attribute)
      };
    }
  },
  getAttributeValueCompletions: function(arg, prefix) {
    var attribute, bufferPosition, editor, i, len, results, tag, value, values;
    editor = arg.editor, bufferPosition = arg.bufferPosition;
    tag = this.getPreviousTag(editor, bufferPosition);
    attribute = this.getPreviousAttribute(editor, bufferPosition);
    values = this.getAttributeValues(attribute);
    results = [];
    for (i = 0, len = values.length; i < len; i++) {
      value = values[i];
      if (!prefix || firstCharsEqual(value, prefix)) {
        results.push(this.buildAttributeValueCompletion(tag, attribute, value));
      }
    }
    return results;
  },
  buildAttributeValueCompletion: function(tag, attribute, value) {
    if (this.completions.attributes[attribute].global) {
      return {
        text: value,
        type: 'value',
        description: value + " value for global " + attribute + " attribute",
        descriptionMoreURL: this.getGlobalAttributeDocsURL(attribute)
      };
    } else {
      return {
        text: value,
        type: 'value',
        description: value + " value for " + attribute + " attribute local to <" + tag + ">",
        descriptionMoreURL: this.getLocalAttributeDocsURL(attribute, tag)
      };
    }
  },
  loadCompletions: function() {
    this.completions = {};
    var cwd = currentFilePath()
    if(!cwd) {
      return false
    }
    var completionsPath = path.resolve(cwd[0], 'completions.json')
    console.log('testing', cwd[0])
    /** File to load for autocompletions */
    // default path.resolve(__dirname, '..', 'completions.json')
    if (fs.existsSync(completionsPath)) {
        console.log('Found file');
        return fs.readFile(completionsPath, (function(_this) {
          return function(error, content) {
            if (error == null) {
              _this.completions = JSON.parse(content);
            }
          };
        })(this));
    } else {
       console.log('completions file not found');
       return this.completions
    }

  },
  getPreviousTag: function(editor, bufferPosition) {
    var ref, row, tag;
    row = bufferPosition.row;
    while (row >= 0) {
      tag = (ref = tagPattern.exec(editor.lineTextForBufferRow(row))) != null ? ref[1] : void 0;
      if (tag) {
        return tag;
      }
      row--;
    }
  },
  getPreviousAttribute: function(editor, bufferPosition) {
    var line, quoteIndex, ref, ref1;
    line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]).trim();
    quoteIndex = line.length - 1;
    while (line[quoteIndex] && !((ref = line[quoteIndex]) === '"' || ref === "'")) {
      quoteIndex--;
    }
    line = line.substring(0, quoteIndex);
    return (ref1 = attributePattern.exec(line)) != null ? ref1[1] : void 0;
  },
  getAttributeValues: function(attribute) {
    var ref;
    attribute = this.completions.attributes[attribute];
    return (ref = attribute != null ? attribute.attribOption : void 0) != null ? ref : [];
  },
  getTagAttributes: function(tag) {
    var ref, ref1;
    return (ref = (ref1 = this.completions.components[tag]) != null ? ref1.attributes : void 0) != null ? ref : [];
  },
  getTagDocsURL: function(tag) {
    /* TODO: Make this pluggable for custom doc links */
    return "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/" + tag;
  },
  getLocalAttributeDocsURL: function(attribute, tag) {
    return (this.getTagDocsURL(tag)) + "#attr-" + attribute;
  },
  getGlobalAttributeDocsURL: function(attribute) {
    /* TODO: Make this pluggable for custom doc links */
    return "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/" + attribute;
  }
};

var firstCharsEqual = function(str1, str2) {
  return str1[0].toLowerCase() === str2[0].toLowerCase();
};
