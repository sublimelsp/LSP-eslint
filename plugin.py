from LSP.plugin.core.typing import Any, Callable, Dict, Literal, Optional, Set, Tuple
from LSP.plugin import uri_to_filename
from LSP.plugin import WorkspaceFolder
from lsp_utils import notification_handler
from lsp_utils import NpmClientHandler
from lsp_utils import request_handler
import os
import re
import sublime
import webbrowser


def plugin_loaded() -> None:
    LspEslintPlugin.setup()


def plugin_unloaded() -> None:
    LspEslintPlugin.cleanup()


class LspEslintPlugin(NpmClientHandler):
    package_name = __package__
    server_directory = 'language-server'
    server_binary_path = os.path.join(server_directory, 'out', 'eslintServer.js')

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._probe_failed = set()  # type: Set[str]

    @classmethod
    def minimum_node_version(cls) -> Tuple[int, int, int]:
        return (14, 0, 0)

    @notification_handler('eslint/status')
    def handle_status(self, params: Any) -> None:
        pass

    @notification_handler('eslint/exitCalled')
    def handle_exit_called(self, params: Any) -> None:
        pass

    @notification_handler('eslint/showOutputChannel')
    def handle_show_output_channel(self, params: Any) -> None:
        sublime.active_window().run_command('lsp_toggle_server_panel')

    @request_handler('eslint/openDoc')
    def handle_open_doc(self, params: Any, respond: Callable[[Any], None]) -> None:
        webbrowser.open(params['url'])
        respond({})

    @request_handler('eslint/probeFailed')
    def handle_probe_failed(self, params: Any, respond: Callable[[Any], None]) -> None:
        self._probe_failed.add(params['textDocument']['uri'])
        respond(None)

    @request_handler('eslint/noConfig')
    def handle_no_config(self, params: Any, respond: Callable[[Any], None]) -> None:
        # TODO: Show better notification that no eslint configuration was found.
        print('LSP-eslint: Could not find eslint configuration ({}) for {}'.format(
            params['message'], params['document']['uri']))
        respond(None)

    @request_handler('eslint/noLibrary')
    def handle_no_library(self, params: Any, respond: Callable[[Any], None]) -> None:
        # TODO: Show better notification that no eslint library was found.
        print('LSP-eslint: Failed resolving eslint library for {}'.format(params['source']['uri']))
        respond(None)

    def on_workspace_configuration(self, params: Any, configuration: Dict) -> None:
        session = self.weaksession()
        if session:
            scope_uri = params.get('scopeUri')
            if scope_uri:
                workspace_folder = None  # type: Optional[WorkspaceFolder]
                for folder in session.get_workspace_folders():
                    if folder.includes_uri(scope_uri):
                        workspace_folder = folder
                        break
                if workspace_folder:
                    configuration['workspaceFolder'] = workspace_folder.to_lsp()
                self.resolve_working_directory(configuration, scope_uri, workspace_folder)
                buf = session.get_session_buffer_for_uri_async(scope_uri)
                if buf:
                    configuration['validate'] = self.compute_validate(buf.language_id, scope_uri, configuration)
                else:
                    configuration['validate'] = 'on'
                del configuration['probe']

    def resolve_working_directory(self, configuration: Dict, scope_uri: str,
                                  workspace_folder: Optional[WorkspaceFolder]) -> None:
        working_directories = configuration.get('workingDirectories', None)
        if isinstance(working_directories, list):
            working_directory = None
            workspace_folder_path = workspace_folder.path if workspace_folder else None
            for entry in working_directories:
                directory = None
                no_cwd = False
                if isinstance(entry, str):
                    directory = entry
                elif self.is_working_directory_item(entry, 'directory'):
                    directory = entry.directory
                    if isinstance(entry.get('!cwd', None), bool):
                        no_cwd = entry['!cwd']
                elif self.is_working_directory_item(entry, 'pattern'):
                    print('LSP-eslint: workingDirectories configuration that uses "pattern" is not supported')
                    continue
                elif self.is_mode_item(entry):
                    working_directory = entry
                    continue

                directory_value = None
                if directory:
                    file_path = uri_to_filename(scope_uri)
                    if directory:
                        directory = self.to_os_path(directory)
                        if not os.path.isabs(directory) and workspace_folder_path:
                            # Trailing '' will add trailing slash if missing.
                            directory = os.path.join(workspace_folder_path, directory, '')
                        if file_path.startswith(directory):
                            directory_value = directory

                if directory_value:
                    if not working_directory or self.is_mode_item(working_directory):
                        working_directory = {'directory': directory_value, '!cwd': no_cwd}
                    else:
                        if len(working_directory['directory']) < len(directory_value):
                            working_directory['directory'] = directory_value
                            working_directory['!cwd'] = no_cwd
            configuration['workingDirectory'] = working_directory
            configuration.pop('workingDirectories', None)

    def is_working_directory_item(self, item: Any, configuration_key: str) -> bool:
        if isinstance(item, dict):
            value = item.get(configuration_key, None)
            not_cwd = item.get('!cwd', None)
            return isinstance(value, str) and (isinstance(not_cwd, bool) or not_cwd is None)
        return False

    def is_mode_item(self, item: Any) -> bool:
        if isinstance(item, dict):
            mode = item.get('mode', None)
            return isinstance(mode, str) and mode in ('auto', 'location')
        return False

    def to_os_path(self, path: str) -> str:
        if sublime.platform == 'windows':
            path = re.sub(r'^\/(\w)\/', r'\1:\\', path)
        return os.path.normpath(path)

    def compute_validate(
        self, language_id: str, scope_uri: str, config: Dict[str, Any]
    ) -> Literal['off', 'on', 'probe']:
        validate = config.get('validate')
        if isinstance(validate, list):
            for validate_langugage_id in validate:
                if validate_langugage_id == language_id:
                    return 'on'
        if scope_uri in self._probe_failed:
            return 'off'
        probe = config.get('probe')
        if isinstance(probe, list):
            for probe_language_id in probe:
                if probe_language_id == language_id:
                    return 'probe'
        return 'off'
