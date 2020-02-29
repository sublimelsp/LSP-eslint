import os
import shutil
import sublime
import subprocess
import threading
import webbrowser

from LSP.plugin.core.handlers import LanguageHandler
from LSP.plugin.core.protocol import Response, WorkspaceFolder
from LSP.plugin.core.registry import windows
from LSP.plugin.core.settings import ClientConfig
from LSP.plugin.core.settings import read_client_config
from LSP.plugin.core.typing import Dict
from LSP.plugin.core.url import uri_to_filename


package_path = os.path.dirname(__file__)
server_path = os.path.join(package_path, 'vscode-eslint', 'out', 'eslintServer.js')
vscode_eslint_path = os.path.join(package_path, 'vscode-eslint')
node_modules_path = os.path.join(vscode_eslint_path, 'node_modules')


def plugin_loaded():
    dependencies_insalled = os.path.isdir(node_modules_path)
    print('LSP-eslint: Server {} installed.'.format('is' if dependencies_insalled else 'is not'))

    if not dependencies_insalled:
        # this will be called only when the plugin gets:
        # - installed for the first time,
        # - or when updated on package control
        logAndShowMessage('LSP-eslint: Installing server.')

        runCommand(
            onCommandDone,
            ["npm", "install", "--verbose", "--prefix", vscode_eslint_path, vscode_eslint_path]
        )


def onCommandDone():
    logAndShowMessage('LSP-eslint: Server installed.')


def runCommand(onExit, popenArgs):
    """
    Runs the given args in a subprocess.Popen, and then calls the function
    onExit when the subprocess completes.
    onExit is a callable object, and popenArgs is a list/tuple of args that
    would give to subprocess.Popen.
    """
    def runInThread(onExit, popenArgs):
        try:
            if sublime.platform() == 'windows':
                subprocess.check_call(popenArgs, shell=True)
            else:
                subprocess.check_call(popenArgs)
            onExit()
        except subprocess.CalledProcessError as error:
            logAndShowMessage('LSP-eslint: Error while installing the server.', error)
        return
    thread = threading.Thread(target=runInThread, args=(onExit, popenArgs))
    thread.start()
    # returns immediately after the thread starts
    return thread


def is_node_installed():
    return shutil.which('node') is not None


def logAndShowMessage(msg, additional_logs=None):
    print(msg, '\n', additional_logs) if additional_logs else print(msg)
    sublime.active_window().status_message(msg)


class LspEslintPlugin(LanguageHandler):
    def __init__(self):
        self.window = None

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
                "validate": "on",
                "packageManager": "npm",
                "options": {},
                "run": "onType",
                "nodePath": None,
                "format": False,
                "quiet": False,
                "onIgnoredFiles": "off",
                "codeAction": {
                    "disableRuleComment": {
                        "enable": True,
                        "location": "separateLine"
                    },
                    "showDocumentation": {
                        "enable": True
                    }
                },
                "codeActionOnSave": {
                    "enable": True,
                    "mode": "all"
                }
            }
        }

        default_configuration.update(client_configuration)
        return read_client_config('lsp-eslint', default_configuration)

    def on_start(self, window) -> bool:
        if not is_node_installed():
            sublime.status_message('Please install Node.js for the ESLint Language Server to work.')
            return False

        self.window = window
        return True

    def on_initialized(self, client) -> None:
        client.on_notification('eslint/status', self.handle_status)
        client.on_request(
            'eslint/openDoc',
            lambda params, request_id: self.handle_open_doc(client, params, request_id))
        client.on_request(
            'workspace/configuration',
            lambda params, request_id: self.handle_request_workspace_configuration(client, params, request_id))

    def handle_request_workspace_configuration(self, client, params, request_id) -> None:
        window_manager = windows.lookup(self.window)
        items = []  # type: List[Optional[Dict[str, str]]]
        requested_items = params.get('items') or []
        for requested_item in requested_items:
            settings = self.config.settings
            project_path = window_manager.get_project_path(uri_to_filename(requested_item.get('scopeUri')))
            if project_path:
                settings['workspaceFolder'] = WorkspaceFolder.from_path(project_path).to_lsp()
            items.append(settings)
        client.send_response(Response(request_id, items))

        pass

    def handle_status(self, params) -> None:
        pass

    def handle_open_doc(self, client, params, request_id) -> None:
        webbrowser.open(params['url'])
        client.send_response(Response(request_id, {}))
