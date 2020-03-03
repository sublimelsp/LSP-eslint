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


PACKAGE_PATH = os.path.dirname(__file__)
SERVER_PATH = os.path.join(PACKAGE_PATH, 'vscode-eslint', 'out', 'eslintServer.js')
VSCODE_ESLINT_PATH = os.path.join(PACKAGE_PATH, 'vscode-eslint')
NODE_MODULES_PATH = os.path.join(VSCODE_ESLINT_PATH, 'node_modules')
SETTINGS_KEY = 'LSP-eslint.sublime-settings'


def plugin_loaded():
    dependencies_insalled = os.path.isdir(NODE_MODULES_PATH)
    print('LSP-eslint: Server {} installed.'.format('is' if dependencies_insalled else 'is not'))

    if not dependencies_insalled:
        # this will be called only when the plugin gets:
        # - installed for the first time,
        # - or when updated on package control
        logAndShowMessage('LSP-eslint: Installing server.')

        runCommand(
            onCommandDone,
            ["npm", "install", "--verbose", "--prefix", VSCODE_ESLINT_PATH, VSCODE_ESLINT_PATH]
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
    api_version = 2

    @property
    def name(self) -> str:
        return 'lsp-eslint'

    @property
    def config(self) -> ClientConfig:
        configuration = self.migrate_and_read_configuration()

        default_configuration = {
            'enabled': True,
            'command': ['node', SERVER_PATH, '--stdio'],
            'languageId': 'eslint',
            'scopes': ['source.js', 'text.html.vue'],
            'syntaxes': [
                'Packages/JavaScript/JavaScript.sublime-syntax',
                'Packages/Babel/JavaScript (Babel).sublime-syntax'
                'Packages/Vue Syntax Highlight/Vue Component.sublime-syntax',
            ],
            'initializationOptions': {},
            'settings': self.eslint_settings
        }

        default_configuration.update(configuration)
        return read_client_config('lsp-eslint', default_configuration)

    @property
    def eslint_settings(self) -> Dict:
        return {
            'validate': 'on',
            'packageManager': 'npm',
            'options': {},
            'run': 'onType',
            'nodePath': None,
            'format': False,
            'quiet': False,
            'onIgnoredFiles': 'off',
            'codeAction': {
                'disableRuleComment': {
                    'enable': True,
                    'location': 'separateLine'
                },
                'showDocumentation': {
                    'enable': True
                }
            },
            'codeActionOnSave': {
                'enable': True,
                'mode': 'all'
            }
        }

    def migrate_and_read_configuration(self) -> None:
        settings = {}
        loaded_settings = sublime.load_settings(SETTINGS_KEY)

        if loaded_settings:
            if loaded_settings.has('client'):
                client = loaded_settings.get('client')
                loaded_settings.erase('client')
                # Migrate old keys
                for key in ['languages', 'initializationOptions', 'settings']:
                    value = client[key] if key in client else None
                    if value:
                        if key == 'languages':
                            for languageConfiguration in value:
                                if 'scopes' in languageConfiguration:
                                    loaded_settings.set('scopes', languageConfiguration['scopes'])
                                if 'syntaxes' in languageConfiguration:
                                    loaded_settings.set('syntaxes', languageConfiguration['syntaxes'])
                        elif key == 'settings':
                            loaded_settings.set('old_settings', value)
                        else:
                            loaded_settings.set(key, value)
                sublime.save_settings(SETTINGS_KEY)

            # Read configuration keys
            for key in ['scopes', 'syntaxes', 'initializationOptions', 'settings']:
                settings[key] = loaded_settings.get(key)

        return settings

    def on_start(self, window) -> bool:
        if not is_node_installed():
            sublime.status_message('Please install Node.js for the ESLint Language Server to work.')
            return False

        return True

    def on_initialized(self, session, window) -> None:
        client = session.client
        client.on_notification('eslint/status', self.handle_status)
        client.on_request(
            'eslint/openDoc',
            lambda params, request_id: self.handle_open_doc(client, params, request_id))
        client.on_request(
            'workspace/configuration',
            lambda params, request_id: self.handle_request_workspace_configuration(session, params, request_id))

    def handle_request_workspace_configuration(self, session, params, request_id) -> None:
        items = []  # type: List[Optional[Dict[str, str]]]
        requested_items = params.get('items') or []
        for requested_item in requested_items:
            settings = self.eslint_settings
            folder = session.workspace_folder_from_path(uri_to_filename(requested_item.get('scopeUri')))
            if folder:
                settings['workspaceFolder'] = folder.to_lsp()
            items.append(settings)
        session.client.send_response(Response(request_id, items))

    def handle_status(self, params) -> None:
        pass

    def handle_open_doc(self, client, params, request_id) -> None:
        webbrowser.open(params['url'])
        client.send_response(Response(request_id, {}))
