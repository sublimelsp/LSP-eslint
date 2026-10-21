from __future__ import annotations

from enum import IntEnum
from LSP.plugin import ClientResponse
from LSP.plugin import LspPlugin
from LSP.plugin import notification_handler
from LSP.plugin import OnPreStartContext
from LSP.plugin import parse_uri
from LSP.plugin import Promise
from LSP.plugin import request_handler
from LSP.plugin import ServerNotification
from LSP.plugin import WorkspaceFolder
from LSP.plugin.core.typing import StrEnum
from LSP.protocol import DocumentUri
from LSP.protocol import TextDocumentIdentifier
from lsp_utils import NodeManager
from pathlib import Path
from sublime_lib import ResourcePath
from typing import Any
from typing import final
from typing import Literal
from typing import TypedDict
from typing import Union
from typing_extensions import NotRequired
from typing_extensions import override
from typing_extensions import TypeGuard
import os
import re
import sublime
import webbrowser

TAG = 'release/3.0.24'


class Status(IntEnum):
    ok = 1
    warn = 2
    error = 3

class StatusParams(TypedDict):
    uri: str
    state: Status

class NoConfigParams(TypedDict):
    message: str
    document: TextDocumentIdentifier

class NoESLintLibraryParams(TypedDict):
    source: TextDocumentIdentifier

class LegacyDirectoryItem(TypedDict):
    directory: str
    changeProcessCWD: bool

# Can't use TypedDict due to invalid identifier name.
DirectoryItem = TypedDict('DirectoryItem', {
    'directory': str,
    '!cwd': NotRequired[bool],
})

# Can't use TypedDict due to invalid identifier name.
PatternItem = TypedDict('PatternItem', {
    'pattern': str,
    '!cwd': NotRequired[bool],
})

class ModeEnum(StrEnum):
    auto = 'auto'
    location = 'location'

class ModeItem(TypedDict):
    mode: ModeEnum

WorkingDirectory = Union[str, LegacyDirectoryItem, DirectoryItem, PatternItem, ModeItem]


def status_to_text(status: Status) -> str:
    if status == Status.error:
        return 'error - see console'
    if status == Status.warn:
        return 'warning - see console'
    return ''


def is_directory_item(item: WorkingDirectory) -> TypeGuard[DirectoryItem]:
    if isinstance(item, dict) and 'directory' in item and 'changeProcessCWD' not in item:
        not_cwd = item.get('!cwd')
        return isinstance(not_cwd, bool) or not_cwd is None
    return False


def is_pattern_item(item: WorkingDirectory) -> TypeGuard[PatternItem]:
    if isinstance(item, dict) and 'pattern' in item:
        not_cwd = item.get('!cwd')
        return isinstance(not_cwd, bool) or not_cwd is None
    return False


def is_mode_item(item: Any) -> TypeGuard[ModeItem]:
    if isinstance(item, dict):
        mode = item.get('mode')
        return isinstance(mode, str) and mode in ('auto', 'location')
    return False


def to_os_path(path: str) -> str:
    if sublime.platform == 'windows':
        path = re.sub(r'^\/(\w)\/', r'\1:\\', path)
    return os.path.normpath(path)


def plugin_loaded() -> None:
    LspEslintPlugin.register()


def plugin_unloaded() -> None:
    LspEslintPlugin.unregister()


@final
class LspEslintPlugin(LspPlugin):

    @classmethod
    @override
    def on_pre_start_async(cls, context: OnPreStartContext) -> None:
        package_name = cls.plugin_storage_path.name
        NodeManager.on_pre_start_async(
            context,
            cls.plugin_storage_path,
            ResourcePath('Packages', package_name, 'language-server'),
            Path('out', 'eslintServer.js'),
            node_version_requirement='>=16.20.2',
            skip_npm_install=True
        )

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self._probe_failed: set[str] = set()

    @notification_handler('eslint/status')
    def handle_status(self, params: StatusParams) -> None:
        self._set_view_status(params['uri'], status_to_text(params['state']))

    @notification_handler('eslint/exitCalled')
    def handle_exit_called(self, params: Any) -> None:
        pass

    @notification_handler('eslint/showOutputChannel')
    def handle_show_output_channel(self, params: Any) -> None:
        sublime.active_window().run_command('lsp_toggle_server_panel')

    @request_handler('eslint/openDoc')
    def handle_open_doc(self, params: Any) -> Promise[None]:
        webbrowser.open(params['url'])
        return Promise.resolve(None)

    @request_handler('eslint/probeFailed')
    def handle_probe_failed(self, params: Any) -> Promise[None]:
        self._probe_failed.add(params['textDocument']['uri'])
        return Promise.resolve(None)

    @request_handler('eslint/noConfig')
    def handle_no_config(self, params: NoConfigParams) -> Promise[None]:
        # TODO: Show better notification that no eslint configuration was found.
        uri = params['document']['uri']
        self._set_view_status(uri, 'error - no config')
        self._log_message_to_console(f'Could not find eslint configuration ({params["message"]}) for {uri}')
        return Promise.resolve(None)

    @request_handler('eslint/noLibrary')
    def handle_no_library(self, params: NoESLintLibraryParams) -> Promise[None]:
        # TODO: Show better notification that no eslint library was found.
        uri = params['source']['uri']
        self._set_view_status(uri, 'error - no eslint')
        self._log_message_to_console(f'Failed resolving eslint library for {uri}')
        return Promise.resolve(None)

    def _set_view_status(self, uri: DocumentUri, status: str) -> None:
        if (session := self.weaksession()) and (session_buffer := session.get_session_buffer_for_uri_async(uri)):
            session.config.set_view_status(session_buffer.get_view_in_group(), status)

    def _log_message_to_console(self, message: str) -> None:
        print(f'LSP-eslint: {message}')

    @override
    def on_server_notification_async(self, notification: ServerNotification) -> None:
        if notification['method'] == 'window/logMessage':
            typ = notification['params']['type']
            message = notification['params']['message']
            self._log_message_to_console(f'{typ} {message}')

    @override
    def on_pre_send_response_async(self, response: ClientResponse) -> None:
        if response['method'] == 'workspace/configuration' and (session := self.weaksession()):
            items = response['params']['items']
            results = response['result']
            for index, item in enumerate(items):
                if (scope_uri := item.get('scopeUri')) and (result := results[index]) and isinstance(result, dict):
                    workspace_folder = next((
                        f for f in session.get_workspace_folders() if f.includes_uri(scope_uri)), None)
                    if workspace_folder:
                        result['workspaceFolder'] = workspace_folder.to_lsp()
                    self._resolve_working_directory(result, scope_uri, workspace_folder)
                    if buf := session.get_session_buffer_for_uri_async(scope_uri):
                        result['validate'] = self._compute_validate(buf.get_language_id() or '', scope_uri, result)
                    else:
                        result['validate'] = 'on'
                    del result['probe']

    def _resolve_working_directory(
        self, configuration: dict[str, Any], scope_uri: str, workspace_folder: WorkspaceFolder | None
    ) -> None:
        working_directories: list[WorkingDirectory] | None = configuration.get('workingDirectories')
        if isinstance(working_directories, list):
            _, file_path = parse_uri(scope_uri)
            working_directory: ModeItem | DirectoryItem | None = None
            workspace_folder_path = workspace_folder.path if workspace_folder else None
            for entry in working_directories:
                directory = None
                no_cwd = False
                if isinstance(entry, str):
                    directory = entry
                elif is_directory_item(entry):
                    directory = entry['directory']
                    no_cwd = entry.get('!cwd', False)
                elif is_pattern_item(entry):
                    print('LSP-eslint: workingDirectories configuration that uses "pattern" is not supported')
                    continue
                elif is_mode_item(entry):
                    working_directory = entry
                    continue
                if directory:
                    directory = to_os_path(directory)
                    if not Path(directory).is_absolute() and workspace_folder_path:
                        directory = os.path.join(workspace_folder_path, directory)
                        if directory[-1] != os.path.sep:
                            directory += os.path.sep
                    if file_path.startswith(directory):
                        if working_directory and is_directory_item(working_directory):
                            if len(working_directory['directory']) < len(directory):
                                working_directory['directory'] = directory
                                working_directory['!cwd'] = no_cwd
                        else:
                            working_directory = {'directory': directory, '!cwd': no_cwd}
            del configuration['workingDirectories']
            configuration['workingDirectory'] = working_directory

    def _compute_validate(
        self, language_id: str, scope_uri: str, config: dict[str, Any]
    ) -> Literal['off', 'on', 'probe']:
        validate = config.get('validate')
        if isinstance(validate, list) and language_id in validate:
            return 'on'
        if scope_uri in self._probe_failed:
            return 'off'
        probe = config.get('probe')
        if isinstance(probe, list) and language_id in probe:
            return 'probe'
        return 'off'
