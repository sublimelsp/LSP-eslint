import os
import shutil
import sublime
import webbrowser

from LSP.plugin.core.handlers import LanguageHandler
from LSP.plugin.core.protocol import Response
from LSP.plugin.core.settings import ClientConfig
from LSP.plugin.core.settings import read_client_config
from lsp_utils import ServerNpmResource

PACKAGE_NAME = 'LSP-eslint'
SETTINGS_FILENAME = 'LSP-eslint.sublime-settings'
SERVER_DIRECTORY = 'vscode-eslint'
SERVER_BINARY_PATH = os.path.join(SERVER_DIRECTORY, 'out', 'eslintServer.js')

server = ServerNpmResource(PACKAGE_NAME, SERVER_DIRECTORY, SERVER_BINARY_PATH)


def plugin_loaded():
    server.setup()


def plugin_unloaded():
    server.cleanup()


def is_node_installed():
    return shutil.which('node') is not None


class LspEslintPlugin(LanguageHandler):
    @property
    def name(self) -> str:
        return PACKAGE_NAME.lower()

    @property
    def config(self) -> ClientConfig:
        settings = sublime.load_settings(SETTINGS_FILENAME)
        client_configuration = settings.get('client')
        if client_configuration is None:
            client_configuration = {}

        # Calling setup() also here as this might run before `plugin_loaded`.
        # Will be a no-op if already ran.
        # See https://github.com/sublimelsp/LSP/issues/899
        server.setup()

        default_configuration = {
            'enabled': True,
            'command': ['node', server.binary_path, '--stdio'],
            "languages": [{"languageId": "eslint", "scopes": ["source.js", "text.html.vue"]}],
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
        return read_client_config(self.name, default_configuration)

    def on_start(self, window) -> bool:
        if not is_node_installed():
            sublime.status_message("{}: Please install Node.js for the server to work.".format(PACKAGE_NAME))
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
