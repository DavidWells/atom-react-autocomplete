/* Atom autocomplete+ provider */
var fs = require('fs');
var path = require('path');
var trailingWhitespace = /\s$/;
var attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
var tagPattern = /<([a-zA-Z][-a-zA-Z]*)(?:\s|$)/;

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
  hasStringScope: function(scopes) {
    return scopes.indexOf('string.quoted.double.html') !== -1 || scopes.indexOf('string.quoted.single.html') !== -1;
  },
  getTagNameCompletions: function(prefix) {
    var attributes, completions, ref, tag;
    completions = [];
    ref = this.completions.tags;
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
    if (tag != null) {
      return {
        snippet: attribute + "=\"$1\"$0",
        displayText: attribute,
        type: 'attribute',
        rightLabel: "<" + tag + ">",
        description: attribute + " attribute local to <" + tag + "> tags",
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
    /** File to load for autocompletions */
    return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
      return function(error, content) {
        if (error == null) {
          _this.completions = JSON.parse(content);
        }
      };
    })(this));
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
    return (ref = (ref1 = this.completions.tags[tag]) != null ? ref1.attributes : void 0) != null ? ref : [];
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