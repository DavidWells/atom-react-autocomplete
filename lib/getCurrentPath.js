/**
 * Get current path in atom
 */
module.exports = function currentFilePath() {
  const editor = atom.workspace.getActiveTextEditor();
  if(editor) {
    return atom.project.relativizePath(editor.buffer.file.path);
  } else {
    return false
  }
}