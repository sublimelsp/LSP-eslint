import os
import webbrowser

from lsp_utils import NpmClientHandler


def plugin_loaded():
    LspEslintPlugin.setup()


def plugin_unloaded():
    LspEslintPlugin.cleanup()


class LspEslintPlugin(NpmClientHandler):
    package_name = __package__
    server_directory = 'language-server'
    server_binary_path = os.path.join(server_directory, 'out', 'eslintServer.js')

    def on_ready(self, api) -> None:
        api.on_notification('eslint/status', self.handle_status)
        api.on_request('eslint/openDoc', self.handle_open_doc)

    def handle_status(self, params) -> None:
        pass

    def handle_open_doc(self, params, respond) -> None:
        webbrowser.open(params['url'])
        respond({})

    def on_workspace_configuration(self, params, configuration) -> None:
        session = self.weaksession()
        if session:
            scope_uri = params.get('scopeUri')
            if scope_uri:
                for folder in session.get_workspace_folders():
                    if folder.includes_uri(scope_uri):
                        configuration['workspaceFolder'] = folder.to_lsp()
                        break
