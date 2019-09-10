# LSP-vue

Eslint support for Sublime's LSP plugin.

* Install [LSP](https://packagecontrol.io/packages/LSP) and `LSP-eslint` from Package Control.
* Restart Sublime.

### Configuration

Configure the eslint language server by accessing `Preferences > Package Settings > LSP > Servers > LSP-eslint`.

The default configuration is this:

```json
{
    "scopes": [
        "source.js",
        "text.html.vue",
    ],
    "syntaxes": [
        "Packages/JavaScript/JavaScript.sublime-syntax",
        "Packages/Vue Syntax Highlight/Vue Component.sublime-syntax",
    ],
}
```
