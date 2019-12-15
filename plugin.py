import os
import shutil
import sublime
import webbrowser

from LSP.plugin.core.handlers import LanguageHandler
from LSP.plugin.core.protocol import Response
from LSP.plugin.core.settings import ClientConfig
from LSP.plugin.core.settings import read_client_config


package_path = os.path.dirname(__file__)
server_path = os.path.join(package_path, 'vscode-eslint', 'out', 'eslintServer.js')


def plugin_loaded():
    print('LSP-eslint: Server is installed.')


def is_node_installed():
    return shutil.which('node') is not None


class LspEslintPlugin(LanguageHandler):
    @property
    def name(self) -> str:
        return 'lsp-eslint'

    @property
    def config(self) -> ClientConfig:
        settings = sublime.load_settings("LSP-eslint.sublime-settings")
        client_configuration = settings.get('client')
        if client_configuration is None:
            client_configuration = {}

        default_configuration = {
            "command": [
                'node',
                server_path,
                '--stdio'
            ],
            "languages": [
                {
                    "languageId": "eslint",
                    "scopes": ["source.js", "text.html.vue"],
                    "syntaxes": [
                        "Packages/Vue Syntax Highlight/Vue Component.sublime-syntax",
                        "Packages/JavaScript/JavaScript.sublime-syntax",
                        "Packages/User/JS Custom/Syntaxes/React.sublime-syntax",
                        "Packages/JavaScript/JavaScript.sublime-syntax",
                        "Packages/Babel/JavaScript (Babel).sublime-syntax"
                    ]
                }
            ],
            settings: {
                "validate": True,
                "packageManager": "npm",
                "autoFix": True,
                "autoFixOnSave": True,
                "options": {},
                "run": "onType",
                "nodePath": None,
                "quiet": False,
                "workspaceFolder": None,
                "codeAction": {
                    "disableRuleComment": {
                        "enable": True,
                        "location": "separateLine"
                    },
                    "showDocumentation": {
                        "enable": True
                    }
                }
            }
        }

        default_configuration.update(client_configuration)
        return read_client_config('lsp-eslint', default_configuration)

    def on_start(self, window) -> bool:
        if not is_node_installed():
            sublime.status_message('Please install Node.js for the ESLint Language Server to work.')
            return False
        return True

    def on_initialized(self, client) -> None:
        client.on_notification('eslint/status', self.handle_status)
        client.on_request(
            'eslint/openDoc',
            lambda params, request_id: self.handle_open_doc(client, params, request_id))

    def handle_status(self, params) -> None:
        pass

    def handle_open_doc(self, client, params, request_id) -> None:
        webbrowser.open(params['url'])
        client.send_response(Response(request_id, {}))
