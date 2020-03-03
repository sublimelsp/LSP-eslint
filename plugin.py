import json
import os
import shutil
import sublime
import subprocess
import threading
import webbrowser

from LSP.plugin.core.handlers import LanguageHandler
from LSP.plugin.core.protocol import Response
from LSP.plugin.core.settings import ClientConfig
from LSP.plugin.core.settings import read_client_config
from sublime_lib import ResourcePath


PACKAGE_NAME = 'LSP-eslint'
SETTINGS_FILENAME = 'LSP-eslint.sublime-settings'


class ServerResources(object):
    """Global object providing paths to server resources. Also handles installing/updating server in cache.

    It needs to be initialized during (or after) plugin_loaded() for it to return relevant and valid paths.
    """
    initialized = False
    server_binary_path = None

    @classmethod
    def initialize(cls):
        if cls.initialized:
            return

        cls.initialized = True

        cache_path = sublime.cache_path()
        server_path = os.path.join(cache_path, PACKAGE_NAME, 'server')
        cls.server_binary_path = os.path.join(server_path, 'out', 'eslintServer.js')
        cls.copy_resources(server_path)

    @classmethod
    def copy_resources(cls, server_path):
        local_server_path = 'Packages/{}/vscode-eslint/'.format(PACKAGE_NAME)

        if os.path.isdir(server_path):
            # Server already in cache. Check if version has changed and if so,
            # delete existing copy in cache.
            delete_cached_server = False
            cache_package_json_path = os.path.join(server_path, 'package.json')
            if os.path.isfile(cache_package_json_path):
                # Read package.json in cache
                with open(cache_package_json_path, 'r') as f:
                    cached_version = json.load(f)['version']
                # Read local package.json
                local_package_json_res = ResourcePath(local_server_path, 'package.json')
                local_version = json.loads(local_package_json_res.read_text())['version']
                delete_cached_server = cached_version != local_version
            else:
                # Server directory exists but there is no package.json
                delete_cached_server = True

            if delete_cached_server:
                shutil.rmtree(server_path)

        if not os.path.isdir(server_path):
            ResourcePath(local_server_path).copytree(server_path, exist_ok=True)

        dependencies_installed = os.path.isdir(os.path.join(server_path, 'node_modules'))
        print('{}: Server {} installed.'.format(PACKAGE_NAME, 'is' if dependencies_installed else 'is not'))

        if not dependencies_installed:
            # this will be called only when the plugin gets:
            # - installed for the first time,
            # - or when updated on package control
            logAndShowMessage('{}: Installing server.'.format(PACKAGE_NAME))

            runCommand(
                lambda: logAndShowMessage('{}: Server installed.'.format(PACKAGE_NAME)),
                ["npm", "install", "--verbose", "--production", "--prefix", server_path, server_path]
            )


def plugin_loaded():
    ServerResources.initialize()


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
            logAndShowMessage('{}: Error while installing the server.'.format(PACKAGE_NAME), error)
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
    @property
    def name(self) -> str:
        return 'lsp-eslint'

    @property
    def config(self) -> ClientConfig:
        settings = sublime.load_settings(SETTINGS_FILENAME)
        client_configuration = settings.get('client')
        if client_configuration is None:
            client_configuration = {}

        # Calling initialize() also here as this might run before `plugin_loaded`.
        # Will be a no-op if already ran.
        # See https://github.com/sublimelsp/LSP/issues/899
        ServerResources.initialize()

        default_configuration = {
            'enabled': True,
            'command': ['node', ServerResources.server_binary_path, '--stdio'],
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
