import os
import webbrowser

from lsp_utils import NpmClientHandler
from LSP.plugin import Response
from LSP.plugin import register_plugin
from LSP.plugin import unregister_plugin
from LSP.plugin import LanguageConfig
from LSP.plugin.core.typing import Optional, Dict, Any, List


def plugin_loaded():
    LspEslintPlugin.setup()
    register_plugin(LspEslintPlugin)


def plugin_unloaded():
    unregister_plugin(LspEslintPlugin)
    LspEslintPlugin.cleanup()


class LspEslintPlugin(NpmClientHandler):
    package_name = __package__
    server_directory = 'vscode-eslint'
    server_binary_path = os.path.join(server_directory, 'out', 'eslintServer.js')

    @classmethod
    def languages(cls) -> List[LanguageConfig]:
        return [LanguageConfig("javascript", "source.js"), LanguageConfig("vue", "text.html.vue")]

    @classmethod
    def initialization_options(cls) -> Optional[Dict[str, Any]]:
        return {}

    @classmethod
    def default_settings(cls) -> Optional[Dict[str, Any]]:
        return {
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
                },
            },
        }

    def on_ready(self, api) -> None:
        api.on_notification('eslint/status', self.handle_status)
        api.on_request('eslint/openDoc', self.handle_open_doc)

    def handle_status(self, params) -> None:
        pass

    def handle_open_doc(self, params, respond) -> None:
        webbrowser.open(params['url'])
        respond({})
