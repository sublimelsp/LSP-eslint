# LSP-eslint

Eslint support for Sublime's LSP plugin.

* Install [LSP](https://packagecontrol.io/packages/LSP) and `LSP-eslint` from Package Control.
* Restart Sublime.

## Configuration

Open configuration file using command palette with `Preferences: LSP-eslint Settings` command or opening it from the Sublime menu.

Configuration file contains multiple configuration keys:

### scopes

Defines which scopes eslint can run in.

### syntaxes

Defines which syntax files eslint can run in.

### initializationOptions

Configuration options sent with `initialize` message. I believe these are not used by eslint.

### settings

ESLint configuration options.

## FAQ

Q: How to enable linting of Typescript code?

A: Add `"source.ts"` entry to `scopes` option and `"Packages/TypeScript Syntax/TypeScript.tmLanguage"` entry to `syntaxes` option. It's also necessary to have appropriate ESLint configuration in your project. See https://github.com/typescript-eslint/typescript-eslint for more information. 
