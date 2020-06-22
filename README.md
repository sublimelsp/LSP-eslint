# LSP-eslint

Eslint support for Sublime's LSP plugin provided through [vscode-eslint](https://github.com/microsoft/vscode-eslint).

### Installation

* Install [LSP](https://packagecontrol.io/packages/LSP) and `LSP-eslint` from Package Control.
* Restart Sublime.

### Configuration

Open configuration file using command palette with `Preferences: LSP-eslint Settings` command or opening it from the Sublime menu.

Configuration file contains multiple configuration keys:

#### scopes

Defines which scopes ESLint can run in.

#### syntaxes

Defines which syntax files ESLint can run in.

#### settings

ESLint configuration options. Refer to [documentation for VSCode extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

### FAQ

Q: How to enable linting of Typescript code?

A: Make sure that eslint configuration in your project has `typescript-eslint` plugin configured. See https://github.com/typescript-eslint/typescript-eslint for more information.
