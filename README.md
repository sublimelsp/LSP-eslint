# LSP-eslint

Eslint support for Sublime's LSP plugin provided through [vscode-eslint](https://github.com/microsoft/vscode-eslint).

### Installation

* Install [LSP](https://packagecontrol.io/packages/LSP) and `LSP-eslint` from Package Control.
* Restart Sublime.

The server requires the Node runtime to be at version 14 or later.

### Configuration

Open configuration file using command palette with `Preferences: LSP-eslint Settings` command or opening it from the Sublime menu.

Configuration file contains multiple configuration keys:

#### languages

Defines on which types of files the ESLint server will run.

#### settings

ESLint configuration options. Refer to the comments for documentation and install [LSP-json](https://packagecontrol.io/packages/LSP-json) to automatically validate settings.

### FAQ

Q: How to enable linting of Typescript code?

A: Make sure that eslint configuration in your project has `typescript-eslint` plugin configured. See https://github.com/typescript-eslint/typescript-eslint for more information.

Q: How to enable eslint to fix all issues automatically on saving the file?

A: Open `Preferences: LSP Settings` from the command palette and add or modify the following setting:

```js
"lsp_code_actions_on_save": {
  "source.fixAll.eslint": true,
},
```

Q: How to use this in a Yarn 2 project?

A: Install ESLint in the project, run `yarn dlx @yarnpkg/pnpify --sdk base` ([docs](https://yarnpkg.com/advanced/editor-sdks)) and set `settings.nodePath` to `.yarn/sdks` either in `LSP-eslint`'s settings or, if you have other non-Yarn-2 projects, in your `.sublime-project`:

```json
{
  "settings": {
    "LSP": {
      "LSP-eslint": {
        "settings": {
          "nodePath": ".yarn/sdks"
        }
      }
    }
  }
}
```
