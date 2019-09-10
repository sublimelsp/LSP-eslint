import shutil
import os
import sublime

from LSP.plugin.core.handlers import LanguageHandler
from LSP.plugin.core.settings import ClientConfig, LanguageConfig


package_path = os.path.dirname(__file__)
server_path = os.path.join(package_path, 'server', 'out', 'eslintServer.js')


def plugin_loaded():
    print('LSP-eslint: Server {} installed.'.format('is' if os.path.isfile(server_path) else 'is not' ))


def is_node_installed():
    return shutil.which('node') is not None


class LspVuePlugin(LanguageHandler):
    @property
    def name(self) -> str:
        return 'lsp-eslint'

    @property
    def config(self) -> ClientConfig:
        settings = sublime.load_settings("LSP-eslint.sublime-settings")
        return ClientConfig(
            name='lsp-eslint',
            binary_args=[
                'node',
                server_path,
                '--stdio',
            ],
            tcp_port=None,
            enabled=True,
            init_options={},
            settings=dict(),
            env=dict(),
            languages=[
                LanguageConfig(
                    'eslint',
                    [
                        'source.js',
                        'text.html.vue',
                    ],
                    [
                        'Packages/JavaScript/JavaScript.sublime-syntax',
                        "Packages/Vue Syntax Highlight/Vue Component.sublime-syntax",
                    ]
                )
            ]
        )

    def on_start(self, window) -> bool:
        if not is_node_installed():
            sublime.status_message('Please install Node.js for the Vue Language Server to work.')
            return False
        return True

    def on_initialized(self, client) -> None:
        pass   # extra initialization here.
