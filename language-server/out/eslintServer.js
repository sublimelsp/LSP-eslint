/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
const os_1 = require("os");
const diff_1 = require("./diff");
const linkedMap_1 = require("./linkedMap");
var Is;
(function (Is) {
    const toString = Object.prototype.toString;
    function boolean(value) {
        return value === true || value === false;
    }
    Is.boolean = boolean;
    function nullOrUndefined(value) {
        return value === null || value === undefined;
    }
    Is.nullOrUndefined = nullOrUndefined;
    function string(value) {
        return toString.call(value) === '[object String]';
    }
    Is.string = string;
})(Is || (Is = {}));
var CommandIds;
(function (CommandIds) {
    CommandIds.applySingleFix = 'eslint.applySingleFix';
    CommandIds.applySuggestion = 'eslint.applySuggestion';
    CommandIds.applySameFixes = 'eslint.applySameFixes';
    CommandIds.applyAllFixes = 'eslint.applyAllFixes';
    CommandIds.applyDisableLine = 'eslint.applyDisableLine';
    CommandIds.applyDisableFile = 'eslint.applyDisableFile';
    CommandIds.openRuleDoc = 'eslint.openRuleDoc';
})(CommandIds || (CommandIds = {}));
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
    Status[Status["confirmationPending"] = 4] = "confirmationPending";
    Status[Status["confirmationCanceled"] = 5] = "confirmationCanceled";
    Status[Status["executionDenied"] = 6] = "executionDenied";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new node_1.NotificationType('eslint/status');
})(StatusNotification || (StatusNotification = {}));
var NoConfigRequest;
(function (NoConfigRequest) {
    NoConfigRequest.type = new node_1.RequestType('eslint/noConfig');
})(NoConfigRequest || (NoConfigRequest = {}));
var NoESLintLibraryRequest;
(function (NoESLintLibraryRequest) {
    NoESLintLibraryRequest.type = new node_1.RequestType('eslint/noLibrary');
})(NoESLintLibraryRequest || (NoESLintLibraryRequest = {}));
var OpenESLintDocRequest;
(function (OpenESLintDocRequest) {
    OpenESLintDocRequest.type = new node_1.RequestType('eslint/openDoc');
})(OpenESLintDocRequest || (OpenESLintDocRequest = {}));
var ProbeFailedRequest;
(function (ProbeFailedRequest) {
    ProbeFailedRequest.type = new node_1.RequestType('eslint/probeFailed');
})(ProbeFailedRequest || (ProbeFailedRequest = {}));
var ConfirmExecutionResult;
(function (ConfirmExecutionResult) {
    ConfirmExecutionResult[ConfirmExecutionResult["deny"] = 1] = "deny";
    ConfirmExecutionResult[ConfirmExecutionResult["confirmationPending"] = 2] = "confirmationPending";
    ConfirmExecutionResult[ConfirmExecutionResult["confirmationCanceled"] = 3] = "confirmationCanceled";
    ConfirmExecutionResult[ConfirmExecutionResult["approved"] = 4] = "approved";
})(ConfirmExecutionResult || (ConfirmExecutionResult = {}));
(function (ConfirmExecutionResult) {
    function toStatus(value) {
        switch (value) {
            case ConfirmExecutionResult.deny:
                return Status.executionDenied;
            case ConfirmExecutionResult.confirmationPending:
                return Status.confirmationPending;
            case ConfirmExecutionResult.confirmationCanceled:
                return Status.confirmationCanceled;
            case ConfirmExecutionResult.approved:
                return Status.ok;
        }
    }
    ConfirmExecutionResult.toStatus = toStatus;
})(ConfirmExecutionResult || (ConfirmExecutionResult = {}));
var ConfirmExecution;
(function (ConfirmExecution) {
    ConfirmExecution.type = new node_1.RequestType('eslint/confirmESLintExecution');
})(ConfirmExecution || (ConfirmExecution = {}));
var ShowOutputChannel;
(function (ShowOutputChannel) {
    ShowOutputChannel.type = new node_1.NotificationType0('eslint/showOutputChannel');
})(ShowOutputChannel || (ShowOutputChannel = {}));
var ModeEnum;
(function (ModeEnum) {
    ModeEnum["auto"] = "auto";
    ModeEnum["location"] = "location";
})(ModeEnum || (ModeEnum = {}));
(function (ModeEnum) {
    function is(value) {
        return value === ModeEnum.auto || value === ModeEnum.location;
    }
    ModeEnum.is = is;
})(ModeEnum || (ModeEnum = {}));
var ModeItem;
(function (ModeItem) {
    function is(item) {
        const candidate = item;
        return candidate && ModeEnum.is(candidate.mode);
    }
    ModeItem.is = is;
})(ModeItem || (ModeItem = {}));
var DirectoryItem;
(function (DirectoryItem) {
    function is(item) {
        const candidate = item;
        return candidate && Is.string(candidate.directory) && (Is.boolean(candidate['!cwd']) || candidate['!cwd'] === undefined);
    }
    DirectoryItem.is = is;
})(DirectoryItem || (DirectoryItem = {}));
var Validate;
(function (Validate) {
    Validate["on"] = "on";
    Validate["off"] = "off";
    Validate["probe"] = "probe";
})(Validate || (Validate = {}));
var ESLintSeverity;
(function (ESLintSeverity) {
    ESLintSeverity["off"] = "off";
    ESLintSeverity["warn"] = "warn";
    ESLintSeverity["error"] = "error";
})(ESLintSeverity || (ESLintSeverity = {}));
var CodeActionsOnSaveMode;
(function (CodeActionsOnSaveMode) {
    CodeActionsOnSaveMode["all"] = "all";
    CodeActionsOnSaveMode["problems"] = "problems";
})(CodeActionsOnSaveMode || (CodeActionsOnSaveMode = {}));
var RuleSeverity;
(function (RuleSeverity) {
    // Original ESLint values
    RuleSeverity["info"] = "info";
    RuleSeverity["warn"] = "warn";
    RuleSeverity["error"] = "error";
    // Added severity override changes
    RuleSeverity["off"] = "off";
    RuleSeverity["default"] = "default";
    RuleSeverity["downgrade"] = "downgrade";
    RuleSeverity["upgrade"] = "upgrade";
})(RuleSeverity || (RuleSeverity = {}));
var TextDocumentSettings;
(function (TextDocumentSettings) {
    function hasLibrary(settings) {
        return settings.library !== undefined;
    }
    TextDocumentSettings.hasLibrary = hasLibrary;
})(TextDocumentSettings || (TextDocumentSettings = {}));
var RuleData;
(function (RuleData) {
    function hasMetaType(value) {
        return value !== undefined && value.meta !== undefined && value.meta.type !== undefined;
    }
    RuleData.hasMetaType = hasMetaType;
})(RuleData || (RuleData = {}));
var CLIEngine;
(function (CLIEngine) {
    function hasRule(value) {
        return value.getRules !== undefined;
    }
    CLIEngine.hasRule = hasRule;
})(CLIEngine || (CLIEngine = {}));
function loadNodeModule(moduleName) {
    const r = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
    try {
        return r(moduleName);
    }
    catch (err) {
        connection.console.error(err.stack.toString());
    }
    return undefined;
}
const ruleSeverityCache = new linkedMap_1.LRUCache(1024);
let ruleCustomizationsKey;
function asteriskMatches(matcher, ruleId) {
    return matcher.startsWith('!')
        ? !(new RegExp(`^${matcher.slice(1).replace(/\*/g, '.*')}$`, 'g').test(ruleId))
        : new RegExp(`^${matcher.replace(/\*/g, '.*')}$`, 'g').test(ruleId);
}
function getSeverityOverride(ruleId, customizations) {
    if (ruleSeverityCache.has(ruleId)) {
        return ruleSeverityCache.get(ruleId);
    }
    let result;
    for (const customization of customizations) {
        if (asteriskMatches(customization.rule, ruleId)) {
            result = customization.severity;
        }
    }
    ruleSeverityCache.set(ruleId, result);
    return result;
}
function makeDiagnostic(settings, problem) {
    const message = problem.message;
    const startLine = Is.nullOrUndefined(problem.line) ? 0 : Math.max(0, problem.line - 1);
    const startChar = Is.nullOrUndefined(problem.column) ? 0 : Math.max(0, problem.column - 1);
    const endLine = Is.nullOrUndefined(problem.endLine) ? startLine : Math.max(0, problem.endLine - 1);
    const endChar = Is.nullOrUndefined(problem.endColumn) ? startChar : Math.max(0, problem.endColumn - 1);
    const result = {
        message: message,
        severity: convertSeverityToDiagnosticWithOverride(problem.severity, getSeverityOverride(problem.ruleId, settings.rulesCustomizations)),
        source: 'eslint',
        range: {
            start: { line: startLine, character: startChar },
            end: { line: endLine, character: endChar }
        }
    };
    if (problem.ruleId) {
        const url = ruleDocData.urls.get(problem.ruleId);
        result.code = problem.ruleId;
        if (url !== undefined) {
            result.codeDescription = {
                href: url
            };
        }
        if (problem.ruleId === 'no-unused-vars') {
            result.tags = [node_1.DiagnosticTag.Unnecessary];
        }
    }
    return result;
}
var Problem;
(function (Problem) {
    function isFixable(problem) {
        return problem.edit !== undefined;
    }
    Problem.isFixable = isFixable;
    function hasSuggestions(problem) {
        return problem.suggestions !== undefined;
    }
    Problem.hasSuggestions = hasSuggestions;
})(Problem || (Problem = {}));
var FixableProblem;
(function (FixableProblem) {
    function createTextEdit(document, editInfo) {
        return node_1.TextEdit.replace(node_1.Range.create(document.positionAt(editInfo.edit.range[0]), document.positionAt(editInfo.edit.range[1])), editInfo.edit.text || '');
    }
    FixableProblem.createTextEdit = createTextEdit;
})(FixableProblem || (FixableProblem = {}));
var SuggestionsProblem;
(function (SuggestionsProblem) {
    function createTextEdit(document, suggestion) {
        return node_1.TextEdit.replace(node_1.Range.create(document.positionAt(suggestion.fix.range[0]), document.positionAt(suggestion.fix.range[1])), suggestion.fix.text || '');
    }
    SuggestionsProblem.createTextEdit = createTextEdit;
})(SuggestionsProblem || (SuggestionsProblem = {}));
function computeKey(diagnostic) {
    const range = diagnostic.range;
    return `[${range.start.line},${range.start.character},${range.end.line},${range.end.character}]-${diagnostic.code}`;
}
const codeActions = new Map();
function recordCodeAction(document, diagnostic, problem) {
    if (!problem.ruleId) {
        return;
    }
    const uri = document.uri;
    let edits = codeActions.get(uri);
    if (edits === undefined) {
        edits = new Map();
        codeActions.set(uri, edits);
    }
    edits.set(computeKey(diagnostic), {
        label: `Fix this ${problem.ruleId} problem`,
        documentVersion: document.version,
        ruleId: problem.ruleId,
        line: problem.line,
        diagnostic: diagnostic,
        edit: problem.fix,
        suggestions: problem.suggestions
    });
}
function adjustSeverityForOverride(severity, severityOverride) {
    switch (severityOverride) {
        case RuleSeverity.info:
        case RuleSeverity.warn:
        case RuleSeverity.error:
            return severityOverride;
        case RuleSeverity.downgrade:
            switch (convertSeverityToDiagnostic(severity)) {
                case node_1.DiagnosticSeverity.Error:
                    return RuleSeverity.warn;
                case node_1.DiagnosticSeverity.Warning:
                case node_1.DiagnosticSeverity.Information:
                    return RuleSeverity.info;
            }
        case RuleSeverity.upgrade:
            switch (convertSeverityToDiagnostic(severity)) {
                case node_1.DiagnosticSeverity.Information:
                    return RuleSeverity.warn;
                case node_1.DiagnosticSeverity.Warning:
                case node_1.DiagnosticSeverity.Error:
                    return RuleSeverity.error;
            }
        default:
            return severity;
    }
}
function convertSeverityToDiagnostic(severity) {
    // RuleSeverity concerns an overridden rule. A number is direct from ESLint.
    switch (severity) {
        // Eslint 1 is warning
        case 1:
        case RuleSeverity.warn:
            return node_1.DiagnosticSeverity.Warning;
        case 2:
        case RuleSeverity.error:
            return node_1.DiagnosticSeverity.Error;
        case RuleSeverity.info:
            return node_1.DiagnosticSeverity.Information;
        default:
            return node_1.DiagnosticSeverity.Error;
    }
}
function convertSeverityToDiagnosticWithOverride(severity, severityOverride) {
    return convertSeverityToDiagnostic(adjustSeverityForOverride(severity, severityOverride));
}
/**
 * Check if the path follows this pattern: `\\hostname\sharename`.
 *
 * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
 * @return A boolean indication if the path is a UNC path, on none-windows
 * always false.
 */
function isUNC(path) {
    if (process.platform !== 'win32') {
        // UNC is a windows concept
        return false;
    }
    if (!path || path.length < 5) {
        // at least \\a\b
        return false;
    }
    let code = path.charCodeAt(0);
    if (code !== 92 /* Backslash */) {
        return false;
    }
    code = path.charCodeAt(1);
    if (code !== 92 /* Backslash */) {
        return false;
    }
    let pos = 2;
    const start = pos;
    for (; pos < path.length; pos++) {
        code = path.charCodeAt(pos);
        if (code === 92 /* Backslash */) {
            break;
        }
    }
    if (start === pos) {
        return false;
    }
    code = path.charCodeAt(pos + 1);
    if (isNaN(code) || code === 92 /* Backslash */) {
        return false;
    }
    return true;
}
function getFileSystemPath(uri) {
    let result = uri.fsPath;
    if (process.platform === 'win32' && result.length >= 2 && result[1] === ':') {
        // Node by default uses an upper case drive letter and ESLint uses
        // === to compare paths which results in the equal check failing
        // if the drive letter is lower case in th URI. Ensure upper case.
        result = result[0].toUpperCase() + result.substr(1);
    }
    if (process.platform === 'win32' || process.platform === 'darwin') {
        const realpath = fs.realpathSync.native(result);
        // Only use the real path if only the casing has changed.
        if (realpath.toLowerCase() === result.toLowerCase()) {
            result = realpath;
        }
    }
    return result;
}
function getFilePath(documentOrUri) {
    if (!documentOrUri) {
        return undefined;
    }
    const uri = Is.string(documentOrUri)
        ? vscode_uri_1.URI.parse(documentOrUri)
        : documentOrUri instanceof vscode_uri_1.URI
            ? documentOrUri
            : vscode_uri_1.URI.parse(documentOrUri.uri);
    if (uri.scheme !== 'file') {
        return undefined;
    }
    return getFileSystemPath(uri);
}
const exitCalled = new node_1.NotificationType('eslint/exitCalled');
const nodeExit = process.exit;
process.exit = ((code) => {
    const stack = new Error('stack');
    connection.sendNotification(exitCalled, [code ? code : 0, stack.stack]);
    setTimeout(() => {
        nodeExit(code);
    }, 1000);
});
process.on('uncaughtException', (error) => {
    let message;
    if (error) {
        if (typeof error.stack === 'string') {
            message = error.stack;
        }
        else if (typeof error.message === 'string') {
            message = error.message;
        }
        else if (typeof error === 'string') {
            message = error;
        }
        if (message === undefined || message.length === 0) {
            try {
                message = JSON.stringify(error, undefined, 4);
            }
            catch (e) {
                // Should not happen.
            }
        }
    }
    // eslint-disable-next-line no-console
    console.error('Uncaught exception received.');
    if (message) {
        // eslint-disable-next-line no-console
        console.error(message);
    }
});
const connection = node_1.createConnection();
connection.console.info(`ESLint server running in node ${process.version}`);
// Is instantiated in the initialize handle;
let documents;
const _globalPaths = {
    yarn: {
        cache: undefined,
        get() {
            return node_1.Files.resolveGlobalYarnPath(trace);
        }
    },
    npm: {
        cache: undefined,
        get() {
            return node_1.Files.resolveGlobalNodePath(trace);
        }
    },
    pnpm: {
        cache: undefined,
        get() {
            const pnpmPath = child_process_1.execSync('pnpm root -g').toString().trim();
            return pnpmPath;
        }
    }
};
function globalPathGet(packageManager) {
    const pm = _globalPaths[packageManager];
    if (pm) {
        if (pm.cache === undefined) {
            pm.cache = pm.get();
        }
        return pm.cache;
    }
    return undefined;
}
const languageId2DefaultExt = new Map([
    ['javascript', 'js'],
    ['javascriptreact', 'jsx'],
    ['typescript', 'ts'],
    ['typescriptreact', 'tsx'],
    ['html', 'html'],
    ['vue', 'vue']
]);
const languageId2ParserRegExp = function createLanguageId2ParserRegExp() {
    const result = new Map();
    const typescript = /\/@typescript-eslint\/parser\//;
    const babelESLint = /\/babel-eslint\/lib\/index.js$/;
    result.set('typescript', [typescript, babelESLint]);
    result.set('typescriptreact', [typescript, babelESLint]);
    return result;
}();
const languageId2ParserOptions = function createLanguageId2ParserOptionsRegExp() {
    const result = new Map();
    const vue = /vue-eslint-parser\/.*\.js$/;
    const typescriptEslintParser = /@typescript-eslint\/parser\/.*\.js$/;
    result.set('typescript', { regExps: [vue], parsers: new Set(['@typescript-eslint/parser']), parserRegExps: [typescriptEslintParser] });
    return result;
}();
const languageId2PluginName = new Map([
    ['html', 'html'],
    ['vue', 'vue'],
    ['markdown', 'markdown']
]);
const defaultLanguageIds = new Set([
    'javascript', 'javascriptreact'
]);
const path2Library = new Map();
const document2Settings = new Map();
const executionConfirmations = new Map();
const projectFolderIndicators = [
    ['package.json', true],
    ['.eslintignore', true],
    ['.eslintrc', false],
    ['.eslintrc.json', false],
    ['.eslintrc.js', false],
    ['.eslintrc.yaml', false],
    ['.eslintrc.yml', false]
];
function findWorkingDirectory(workspaceFolder, file) {
    if (file === undefined || isUNC(file)) {
        return workspaceFolder;
    }
    // Don't probe for something in node modules folder.
    if (file.indexOf(`${path.sep}node_modules${path.sep}`) !== -1) {
        return workspaceFolder;
    }
    let result = workspaceFolder;
    let directory = path.dirname(file);
    outer: while (directory !== undefined && directory.startsWith(workspaceFolder)) {
        for (const item of projectFolderIndicators) {
            if (fs.existsSync(path.join(directory, item[0]))) {
                result = directory;
                if (item[1]) {
                    break outer;
                }
                else {
                    break;
                }
            }
        }
        const parent = path.dirname(directory);
        directory = parent !== directory ? parent : undefined;
    }
    return result;
}
function resolveSettings(document) {
    const uri = document.uri;
    let resultPromise = document2Settings.get(uri);
    if (resultPromise) {
        return resultPromise;
    }
    resultPromise = connection.workspace.getConfiguration({ scopeUri: uri, section: '' }).then((configuration) => {
        var _a;
        const settings = Object.assign({}, configuration, { silent: false, library: undefined, resolvedGlobalPackageManagerPath: undefined }, { workingDirectory: undefined });
        if (settings.validate === Validate.off) {
            return settings;
        }
        settings.resolvedGlobalPackageManagerPath = globalPathGet(settings.packageManager);
        const filePath = getFilePath(document);
        const workspaceFolderPath = settings.workspaceFolder !== undefined ? getFilePath(settings.workspaceFolder.uri) : undefined;
        const hasUserDefinedWorkingDirectories = configuration.workingDirectory !== undefined;
        const workingDirectoryConfig = (_a = configuration.workingDirectory) !== null && _a !== void 0 ? _a : { mode: ModeEnum.location };
        if (ModeItem.is(workingDirectoryConfig)) {
            let candidate;
            if (workingDirectoryConfig.mode === ModeEnum.location) {
                if (workspaceFolderPath !== undefined) {
                    candidate = workspaceFolderPath;
                }
                else if (filePath !== undefined && !isUNC(filePath)) {
                    candidate = path.dirname(filePath);
                }
            }
            else if (workingDirectoryConfig.mode === ModeEnum.auto) {
                if (workspaceFolderPath !== undefined) {
                    candidate = findWorkingDirectory(workspaceFolderPath, filePath);
                }
                else if (filePath !== undefined && !isUNC(filePath)) {
                    candidate = path.dirname(filePath);
                }
            }
            if (candidate !== undefined && fs.existsSync(candidate)) {
                settings.workingDirectory = { directory: candidate };
            }
        }
        else {
            settings.workingDirectory = workingDirectoryConfig;
        }
        let promise;
        let nodePath;
        if (settings.nodePath !== null) {
            nodePath = settings.nodePath;
            if (!path.isAbsolute(nodePath) && settings.workspaceFolder !== undefined) {
                const workspaceFolderPath = getFilePath(settings.workspaceFolder.uri);
                if (workspaceFolderPath !== undefined) {
                    nodePath = path.join(workspaceFolderPath, nodePath);
                }
            }
        }
        let moduleResolveWorkingDirectory;
        if (!hasUserDefinedWorkingDirectories && filePath !== undefined) {
            moduleResolveWorkingDirectory = path.dirname(filePath);
        }
        if (moduleResolveWorkingDirectory === undefined && settings.workingDirectory !== undefined && !settings.workingDirectory['!cwd']) {
            moduleResolveWorkingDirectory = settings.workingDirectory.directory;
        }
        if (nodePath !== undefined) {
            promise = node_1.Files.resolve('eslint', nodePath, nodePath, trace).then(undefined, () => {
                return node_1.Files.resolve('eslint', settings.resolvedGlobalPackageManagerPath, moduleResolveWorkingDirectory, trace);
            });
        }
        else {
            promise = node_1.Files.resolve('eslint', settings.resolvedGlobalPackageManagerPath, moduleResolveWorkingDirectory, trace);
        }
        settings.silent = settings.validate === Validate.probe;
        return promise.then((libraryPath) => {
            const scope = settings.resolvedGlobalPackageManagerPath !== undefined && libraryPath.startsWith(settings.resolvedGlobalPackageManagerPath)
                ? 'global'
                : 'local';
            const cachedExecutionConfirmation = executionConfirmations.get(libraryPath);
            const confirmationPromise = cachedExecutionConfirmation === undefined
                ? connection.sendRequest(ConfirmExecution.type, { scope: scope, uri: uri, libraryPath })
                : Promise.resolve(cachedExecutionConfirmation);
            return confirmationPromise.then((confirmed) => {
                var _a;
                // Only cache if the execution got confirm to give the UI the change
                // to update on un confirmed execution.
                if (confirmed !== ConfirmExecutionResult.approved) {
                    settings.validate = Validate.off;
                    connection.sendDiagnostics({ uri: uri, diagnostics: [] });
                    connection.sendNotification(StatusNotification.type, { uri: uri, state: ConfirmExecutionResult.toStatus(confirmed) });
                    return settings;
                }
                else {
                    executionConfirmations.set(libraryPath, confirmed);
                }
                let library = path2Library.get(libraryPath);
                if (library === undefined) {
                    library = loadNodeModule(libraryPath);
                    if (library === undefined) {
                        settings.validate = Validate.off;
                        if (!settings.silent) {
                            connection.console.error(`Failed to load eslint library from ${libraryPath}. See output panel for more information.`);
                        }
                    }
                    else if (library.CLIEngine === undefined) {
                        settings.validate = Validate.off;
                        connection.console.error(`The eslint library loaded from ${libraryPath} doesn\'t export a CLIEngine. You need at least eslint@1.0.0`);
                    }
                    else {
                        connection.console.info(`ESLint library loaded from: ${libraryPath}`);
                        settings.library = library;
                        path2Library.set(libraryPath, library);
                    }
                }
                else {
                    settings.library = library;
                }
                if (settings.validate === Validate.probe && TextDocumentSettings.hasLibrary(settings)) {
                    settings.validate = Validate.off;
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    let filePath = getFilePath(document);
                    if (filePath === undefined && uri.scheme === 'untitled' && settings.workspaceFolder !== undefined) {
                        const ext = languageId2DefaultExt.get(document.languageId);
                        const workspacePath = getFilePath(settings.workspaceFolder.uri);
                        if (workspacePath !== undefined && ext !== undefined) {
                            filePath = path.join(workspacePath, `test${ext}`);
                        }
                    }
                    if (filePath !== undefined) {
                        const parserRegExps = languageId2ParserRegExp.get(document.languageId);
                        const pluginName = languageId2PluginName.get(document.languageId);
                        const parserOptions = languageId2ParserOptions.get(document.languageId);
                        if (defaultLanguageIds.has(document.languageId)) {
                            settings.validate = Validate.on;
                        }
                        else if (parserRegExps !== undefined || pluginName !== undefined || parserOptions !== undefined) {
                            const eslintConfig = withCLIEngine((cli) => {
                                try {
                                    if (typeof cli.getConfigForFile === 'function') {
                                        return cli.getConfigForFile(filePath);
                                    }
                                    else {
                                        return undefined;
                                    }
                                }
                                catch (err) {
                                    return undefined;
                                }
                            }, settings);
                            if (eslintConfig !== undefined) {
                                const parser = eslintConfig.parser !== null
                                    ? (process.platform === 'win32' ? eslintConfig.parser.replace(/\\/g, '/') : eslintConfig.parser)
                                    : undefined;
                                if (parser !== undefined) {
                                    if (parserRegExps !== undefined) {
                                        for (const regExp of parserRegExps) {
                                            if (regExp.test(parser)) {
                                                settings.validate = Validate.on;
                                                break;
                                            }
                                        }
                                    }
                                    if (settings.validate !== Validate.on && parserOptions !== undefined && typeof ((_a = eslintConfig.parserOptions) === null || _a === void 0 ? void 0 : _a.parser) === 'string') {
                                        for (const regExp of parserOptions.regExps) {
                                            if (regExp.test(parser) && (parserOptions.parsers.has(eslintConfig.parserOptions.parser) ||
                                                parserOptions.parserRegExps !== undefined && parserOptions.parserRegExps.some(parserRegExp => parserRegExp.test(eslintConfig.parserOptions.parser)))) {
                                                settings.validate = Validate.on;
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (settings.validate !== Validate.on && Array.isArray(eslintConfig.plugins) && eslintConfig.plugins.length > 0 && pluginName !== undefined) {
                                    for (const name of eslintConfig.plugins) {
                                        if (name === pluginName) {
                                            settings.validate = Validate.on;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (settings.validate === Validate.off) {
                        const params = { textDocument: { uri: document.uri } };
                        connection.sendRequest(ProbeFailedRequest.type, params);
                    }
                }
                if (settings.format && settings.validate === Validate.on && TextDocumentSettings.hasLibrary(settings)) {
                    const Uri = vscode_uri_1.URI.parse(uri);
                    const isFile = Uri.scheme === 'file';
                    let pattern = isFile
                        ? Uri.fsPath.replace(/\\/g, '/')
                        : Uri.fsPath;
                    pattern = pattern.replace(/[\[\]\{\}]/g, '?');
                    const filter = { scheme: Uri.scheme, pattern: pattern };
                    const options = { documentSelector: [filter] };
                    if (!isFile) {
                        formatterRegistrations.set(uri, connection.client.register(node_1.DocumentFormattingRequest.type, options));
                    }
                    else {
                        const filePath = getFilePath(uri);
                        withCLIEngine((cli) => {
                            if (!cli.isPathIgnored(filePath)) {
                                formatterRegistrations.set(uri, connection.client.register(node_1.DocumentFormattingRequest.type, options));
                            }
                        }, settings);
                    }
                }
                return settings;
            });
        }, () => {
            settings.validate = Validate.off;
            if (!settings.silent) {
                connection.sendRequest(NoESLintLibraryRequest.type, { source: { uri: document.uri } });
            }
            return settings;
        });
    });
    document2Settings.set(uri, resultPromise);
    return resultPromise;
}
var Request;
(function (Request) {
    function is(value) {
        const candidate = value;
        return candidate && candidate.token !== undefined && candidate.resolve !== undefined && candidate.reject !== undefined;
    }
    Request.is = is;
})(Request || (Request = {}));
var Thenable;
(function (Thenable) {
    function is(value) {
        const candidate = value;
        return candidate && typeof candidate.then === 'function';
    }
    Thenable.is = is;
})(Thenable || (Thenable = {}));
class BufferedMessageQueue {
    constructor(connection) {
        this.connection = connection;
        this.queue = [];
        this.requestHandlers = new Map();
        this.notificationHandlers = new Map();
    }
    registerRequest(type, handler, versionProvider) {
        this.connection.onRequest(type, (params, token) => {
            return new Promise((resolve, reject) => {
                this.queue.push({
                    method: type.method,
                    params: params,
                    documentVersion: versionProvider ? versionProvider(params) : undefined,
                    resolve: resolve,
                    reject: reject,
                    token: token
                });
                this.trigger();
            });
        });
        this.requestHandlers.set(type.method, { handler, versionProvider });
    }
    registerNotification(type, handler, versionProvider) {
        connection.onNotification(type, (params) => {
            this.queue.push({
                method: type.method,
                params: params,
                documentVersion: versionProvider ? versionProvider(params) : undefined,
            });
            this.trigger();
        });
        this.notificationHandlers.set(type.method, { handler, versionProvider });
    }
    addNotificationMessage(type, params, version) {
        this.queue.push({
            method: type.method,
            params,
            documentVersion: version
        });
        this.trigger();
    }
    onNotification(type, handler, versionProvider) {
        this.notificationHandlers.set(type.method, { handler, versionProvider });
    }
    trigger() {
        if (this.timer || this.queue.length === 0) {
            return;
        }
        this.timer = setImmediate(() => {
            this.timer = undefined;
            this.processQueue();
            this.trigger();
        });
    }
    processQueue() {
        const message = this.queue.shift();
        if (!message) {
            return;
        }
        if (Request.is(message)) {
            const requestMessage = message;
            if (requestMessage.token.isCancellationRequested) {
                requestMessage.reject(new node_1.ResponseError(node_1.LSPErrorCodes.RequestCancelled, 'Request got cancelled'));
                return;
            }
            const elem = this.requestHandlers.get(requestMessage.method);
            if (elem === undefined) {
                throw new Error(`No handler registered`);
            }
            if (elem.versionProvider && requestMessage.documentVersion !== undefined && requestMessage.documentVersion !== elem.versionProvider(requestMessage.params)) {
                requestMessage.reject(new node_1.ResponseError(node_1.LSPErrorCodes.RequestCancelled, 'Request got cancelled'));
                return;
            }
            const result = elem.handler(requestMessage.params, requestMessage.token);
            if (Thenable.is(result)) {
                result.then((value) => {
                    requestMessage.resolve(value);
                }, (error) => {
                    requestMessage.reject(error);
                });
            }
            else {
                requestMessage.resolve(result);
            }
        }
        else {
            const notificationMessage = message;
            const elem = this.notificationHandlers.get(notificationMessage.method);
            if (elem === undefined) {
                throw new Error(`No handler registered`);
            }
            if (elem.versionProvider && notificationMessage.documentVersion !== undefined && notificationMessage.documentVersion !== elem.versionProvider(notificationMessage.params)) {
                return;
            }
            elem.handler(notificationMessage.params);
        }
    }
}
const messageQueue = new BufferedMessageQueue(connection);
const formatterRegistrations = new Map();
var ValidateNotification;
(function (ValidateNotification) {
    ValidateNotification.type = new node_1.NotificationType('eslint/validate');
})(ValidateNotification || (ValidateNotification = {}));
messageQueue.onNotification(ValidateNotification.type, (document) => {
    validateSingle(document, true);
}, (document) => {
    return document.version;
});
function setupDocumentsListeners() {
    // The documents manager listen for text document create, change
    // and close on the connection
    documents.listen(connection);
    documents.onDidOpen((event) => {
        resolveSettings(event.document).then((settings) => {
            if (settings.validate !== Validate.on || !TextDocumentSettings.hasLibrary(settings)) {
                return;
            }
            if (settings.run === 'onSave') {
                messageQueue.addNotificationMessage(ValidateNotification.type, event.document, event.document.version);
            }
        });
    });
    // A text document has changed. Validate the document according the run setting.
    documents.onDidChangeContent((event) => {
        const uri = event.document.uri;
        codeActions.delete(uri);
        resolveSettings(event.document).then((settings) => {
            if (settings.validate !== Validate.on || settings.run !== 'onType') {
                return;
            }
            messageQueue.addNotificationMessage(ValidateNotification.type, event.document, event.document.version);
        });
    });
    // A text document has been saved. Validate the document according the run setting.
    documents.onDidSave((event) => {
        resolveSettings(event.document).then((settings) => {
            if (settings.validate !== Validate.on || settings.run !== 'onSave') {
                return;
            }
            messageQueue.addNotificationMessage(ValidateNotification.type, event.document, event.document.version);
        });
    });
    documents.onDidClose((event) => {
        resolveSettings(event.document).then((settings) => {
            const uri = event.document.uri;
            document2Settings.delete(uri);
            codeActions.delete(uri);
            const unregister = formatterRegistrations.get(event.document.uri);
            if (unregister !== undefined) {
                unregister.then(disposable => disposable.dispose());
                formatterRegistrations.delete(event.document.uri);
            }
            if (settings.validate === Validate.on) {
                connection.sendDiagnostics({ uri: uri, diagnostics: [] });
            }
        });
    });
}
function environmentChanged() {
    document2Settings.clear();
    executionConfirmations.clear();
    for (let document of documents.all()) {
        messageQueue.addNotificationMessage(ValidateNotification.type, document, document.version);
    }
    for (const unregistration of formatterRegistrations.values()) {
        unregistration.then(disposable => disposable.dispose());
    }
    formatterRegistrations.clear();
}
function trace(message, verbose) {
    connection.tracer.log(message, verbose);
}
connection.onInitialize((_params, _cancel, progress) => {
    progress.begin('Initializing ESLint Server');
    const syncKind = node_1.TextDocumentSyncKind.Incremental;
    documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    setupDocumentsListeners();
    progress.done();
    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: syncKind,
                willSaveWaitUntil: false,
                save: {
                    includeText: false
                }
            },
            workspace: {
                workspaceFolders: {
                    supported: true
                }
            },
            codeActionProvider: { codeActionKinds: [node_1.CodeActionKind.QuickFix, `${node_1.CodeActionKind.SourceFixAll}.eslint`] },
            executeCommandProvider: {
                commands: [
                    CommandIds.applySingleFix,
                    CommandIds.applySuggestion,
                    CommandIds.applySameFixes,
                    CommandIds.applyAllFixes,
                    CommandIds.applyDisableLine,
                    CommandIds.applyDisableFile,
                    CommandIds.openRuleDoc,
                ]
            }
        }
    };
});
connection.onInitialized(() => {
    connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    connection.client.register(node_1.DidChangeWorkspaceFoldersNotification.type, undefined);
});
messageQueue.registerNotification(node_1.DidChangeConfigurationNotification.type, (_params) => {
    environmentChanged();
});
messageQueue.registerNotification(node_1.DidChangeWorkspaceFoldersNotification.type, (_params) => {
    environmentChanged();
});
const singleErrorHandlers = [
    tryHandleNoConfig,
    tryHandleConfigError,
    tryHandleMissingModule,
    showErrorMessage
];
function validateSingle(document, publishDiagnostics = true) {
    // We validate document in a queue but open / close documents directly. So we need to deal with the
    // fact that a document might be gone from the server.
    if (!documents.get(document.uri)) {
        return Promise.resolve(undefined);
    }
    return resolveSettings(document).then((settings) => {
        if (settings.validate !== Validate.on || !TextDocumentSettings.hasLibrary(settings)) {
            return;
        }
        try {
            validate(document, settings, publishDiagnostics);
            connection.sendNotification(StatusNotification.type, { uri: document.uri, state: Status.ok });
        }
        catch (err) {
            // if an exception has occurred while validating clear all errors to ensure
            // we are not showing any stale once
            connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
            if (!settings.silent) {
                let status = undefined;
                for (let handler of singleErrorHandlers) {
                    status = handler(err, document, settings.library);
                    if (status) {
                        break;
                    }
                }
                status = status || Status.error;
                connection.sendNotification(StatusNotification.type, { uri: document.uri, state: status });
            }
            else {
                connection.console.info(getMessage(err, document));
                connection.sendNotification(StatusNotification.type, { uri: document.uri, state: Status.ok });
            }
        }
    });
}
function validateMany(documents) {
    documents.forEach(document => {
        messageQueue.addNotificationMessage(ValidateNotification.type, document, document.version);
    });
}
function getMessage(err, document) {
    let result = undefined;
    if (typeof err.message === 'string' || err.message instanceof String) {
        result = err.message;
        result = result.replace(/\r?\n/g, ' ');
        if (/^CLI: /.test(result)) {
            result = result.substr(5);
        }
    }
    else {
        result = `An unknown error occurred while validating document: ${document.uri}`;
    }
    return result;
}
const ruleDocData = {
    handled: new Set(),
    urls: new Map()
};
const validFixTypes = new Set(['problem', 'suggestion', 'layout']);
function validate(document, settings, publishDiagnostics = true) {
    const newOptions = Object.assign(Object.create(null), settings.options);
    let fixTypes = undefined;
    if (Array.isArray(newOptions.fixTypes) && newOptions.fixTypes.length > 0) {
        fixTypes = new Set();
        for (let item of newOptions.fixTypes) {
            if (validFixTypes.has(item)) {
                fixTypes.add(item);
            }
        }
        if (fixTypes.size === 0) {
            fixTypes = undefined;
        }
    }
    const newRuleCustomizationsKey = JSON.stringify(settings.rulesCustomizations);
    if (ruleCustomizationsKey !== newRuleCustomizationsKey) {
        ruleCustomizationsKey = newRuleCustomizationsKey;
        ruleSeverityCache.clear();
    }
    const content = document.getText();
    const uri = document.uri;
    const file = getFilePath(document);
    withCLIEngine((cli) => {
        codeActions.delete(uri);
        const report = cli.executeOnText(content, file, settings.onIgnoredFiles !== ESLintSeverity.off);
        if (CLIEngine.hasRule(cli) && !ruleDocData.handled.has(uri)) {
            ruleDocData.handled.add(uri);
            cli.getRules().forEach((rule, key) => {
                if (rule.meta && rule.meta.docs && Is.string(rule.meta.docs.url)) {
                    ruleDocData.urls.set(key, rule.meta.docs.url);
                }
            });
        }
        const diagnostics = [];
        if (report && report.results && Array.isArray(report.results) && report.results.length > 0) {
            const docReport = report.results[0];
            if (docReport.messages && Array.isArray(docReport.messages)) {
                docReport.messages.forEach((problem) => {
                    if (problem) {
                        const isWarning = convertSeverityToDiagnostic(problem.severity) === node_1.DiagnosticSeverity.Warning;
                        if (settings.quiet && isWarning) {
                            // Filter out warnings when quiet mode is enabled
                            return;
                        }
                        const diagnostic = makeDiagnostic(settings, problem);
                        diagnostics.push(diagnostic);
                        if (fixTypes !== undefined && CLIEngine.hasRule(cli) && problem.ruleId !== undefined && problem.fix !== undefined) {
                            const rule = cli.getRules().get(problem.ruleId);
                            if (RuleData.hasMetaType(rule) && fixTypes.has(rule.meta.type)) {
                                recordCodeAction(document, diagnostic, problem);
                            }
                        }
                        else {
                            recordCodeAction(document, diagnostic, problem);
                        }
                    }
                });
            }
        }
        if (publishDiagnostics) {
            connection.sendDiagnostics({ uri, diagnostics });
        }
    }, settings);
}
function withCLIEngine(func, settings, options) {
    const newOptions = options === undefined
        ? Object.assign(Object.create(null), settings.options)
        : Object.assign(Object.create(null), settings.options, options);
    const cwd = process.cwd();
    try {
        if (settings.workingDirectory) {
            newOptions.cwd = settings.workingDirectory.directory;
            if (settings.workingDirectory['!cwd'] !== true && fs.existsSync(settings.workingDirectory.directory)) {
                process.chdir(settings.workingDirectory.directory);
            }
        }
        const cli = new settings.library.CLIEngine(newOptions);
        return func(cli);
    }
    finally {
        if (cwd !== process.cwd()) {
            process.chdir(cwd);
        }
    }
}
const noConfigReported = new Map();
function isNoConfigFoundError(error) {
    const candidate = error;
    return candidate.messageTemplate === 'no-config-found' || candidate.message === 'No ESLint configuration found.';
}
function tryHandleNoConfig(error, document, library) {
    if (!isNoConfigFoundError(error)) {
        return undefined;
    }
    if (!noConfigReported.has(document.uri)) {
        connection.sendRequest(NoConfigRequest.type, {
            message: getMessage(error, document),
            document: {
                uri: document.uri
            }
        }).then(undefined, () => { });
        noConfigReported.set(document.uri, library);
    }
    return Status.warn;
}
const configErrorReported = new Map();
function tryHandleConfigError(error, document, library) {
    if (!error.message) {
        return undefined;
    }
    function handleFileName(filename) {
        if (!configErrorReported.has(filename)) {
            connection.console.error(getMessage(error, document));
            if (!documents.get(vscode_uri_1.URI.file(filename).toString())) {
                connection.window.showInformationMessage(getMessage(error, document));
            }
            configErrorReported.set(filename, library);
        }
        return Status.warn;
    }
    let matches = /Cannot read config file:\s+(.*)\nError:\s+(.*)/.exec(error.message);
    if (matches && matches.length === 3) {
        return handleFileName(matches[1]);
    }
    matches = /(.*):\n\s*Configuration for rule \"(.*)\" is /.exec(error.message);
    if (matches && matches.length === 3) {
        return handleFileName(matches[1]);
    }
    matches = /Cannot find module '([^']*)'\nReferenced from:\s+(.*)/.exec(error.message);
    if (matches && matches.length === 3) {
        return handleFileName(matches[2]);
    }
    return undefined;
}
const missingModuleReported = new Map();
function tryHandleMissingModule(error, document, library) {
    if (!error.message) {
        return undefined;
    }
    function handleMissingModule(plugin, module, error) {
        if (!missingModuleReported.has(plugin)) {
            const fsPath = getFilePath(document);
            missingModuleReported.set(plugin, library);
            if (error.messageTemplate === 'plugin-missing') {
                connection.console.error([
                    '',
                    `${error.message.toString()}`,
                    `Happened while validating ${fsPath ? fsPath : document.uri}`,
                    `This can happen for a couple of reasons:`,
                    `1. The plugin name is spelled incorrectly in an ESLint configuration file (e.g. .eslintrc).`,
                    `2. If ESLint is installed globally, then make sure ${module} is installed globally as well.`,
                    `3. If ESLint is installed locally, then ${module} isn't installed correctly.`,
                    '',
                    `Consider running eslint --debug ${fsPath ? fsPath : document.uri} from a terminal to obtain a trace about the configuration files used.`
                ].join('\n'));
            }
            else {
                connection.console.error([
                    `${error.message.toString()}`,
                    `Happened while validating ${fsPath ? fsPath : document.uri}`
                ].join('\n'));
            }
        }
        return Status.warn;
    }
    const matches = /Failed to load plugin (.*): Cannot find module (.*)/.exec(error.message);
    if (matches && matches.length === 3) {
        return handleMissingModule(matches[1], matches[2], error);
    }
    return undefined;
}
function showErrorMessage(error, document) {
    connection.window.showErrorMessage(`ESLint: ${getMessage(error, document)}. Please see the 'ESLint' output channel for details.`, { title: 'Open Output', id: 1 }).then((value) => {
        if (value !== undefined && value.id === 1) {
            connection.sendNotification(ShowOutputChannel.type);
        }
    });
    if (Is.string(error.stack)) {
        connection.console.error('ESLint stack trace:');
        connection.console.error(error.stack);
    }
    return Status.error;
}
messageQueue.registerNotification(node_1.DidChangeWatchedFilesNotification.type, (params) => {
    // A .eslintrc has change. No smartness here.
    // Simply revalidate all file.
    ruleDocData.handled.clear();
    ruleDocData.urls.clear();
    noConfigReported.clear();
    missingModuleReported.clear();
    document2Settings.clear(); // config files can change plugins and parser.
    params.changes.forEach((change) => {
        const fsPath = getFilePath(change.uri);
        if (fsPath === undefined || fsPath.length === 0 || isUNC(fsPath)) {
            return;
        }
        const dirname = path.dirname(fsPath);
        if (dirname) {
            const library = configErrorReported.get(fsPath);
            if (library !== undefined) {
                const cli = new library.CLIEngine({});
                try {
                    cli.executeOnText('', path.join(dirname, '___test___.js'));
                    configErrorReported.delete(fsPath);
                }
                catch (error) {
                }
            }
        }
    });
    validateMany(documents.all());
});
class Fixes {
    constructor(edits) {
        this.edits = edits;
    }
    static overlaps(a, b) {
        return a !== undefined && a.edit.range[1] > b.edit.range[0];
    }
    static isSame(a, b) {
        return a.edit.range[0] === b.edit.range[0] && a.edit.range[1] === b.edit.range[1] && a.edit.text === b.edit.text;
    }
    isEmpty() {
        return this.edits.size === 0;
    }
    getDocumentVersion() {
        if (this.isEmpty()) {
            throw new Error('No edits recorded.');
        }
        return this.edits.values().next().value.documentVersion;
    }
    getScoped(diagnostics) {
        const result = [];
        for (let diagnostic of diagnostics) {
            const key = computeKey(diagnostic);
            const editInfo = this.edits.get(key);
            if (editInfo) {
                result.push(editInfo);
            }
        }
        return result;
    }
    getAllSorted() {
        const result = [];
        this.edits.forEach((value) => {
            if (Problem.isFixable(value)) {
                result.push(value);
            }
        });
        return result.sort((a, b) => {
            const d = a.edit.range[0] - b.edit.range[0];
            if (d !== 0) {
                return d;
            }
            const al = a.edit.range[1] - a.edit.range[0];
            if (al === 0) {
                return -1;
            }
            const bl = b.edit.range[1] - b.edit.range[0];
            if (bl === 0) {
                return 1;
            }
            return al - bl;
        });
    }
    getApplicable() {
        const sorted = this.getAllSorted();
        if (sorted.length <= 1) {
            return sorted;
        }
        const result = [];
        let last = sorted[0];
        result.push(last);
        for (let i = 1; i < sorted.length; i++) {
            let current = sorted[i];
            if (!Fixes.overlaps(last, current) && !Fixes.isSame(last, current)) {
                result.push(current);
                last = current;
            }
        }
        return result;
    }
}
class CodeActionResult {
    constructor() {
        this._actions = new Map();
    }
    get(ruleId) {
        let result = this._actions.get(ruleId);
        if (result === undefined) {
            result = { fixes: [], suggestions: [] };
            this._actions.set(ruleId, result);
        }
        return result;
    }
    get fixAll() {
        if (this._fixAll === undefined) {
            this._fixAll = [];
        }
        return this._fixAll;
    }
    all() {
        const result = [];
        for (let actions of this._actions.values()) {
            result.push(...actions.fixes);
            result.push(...actions.suggestions);
            if (actions.disable) {
                result.push(actions.disable);
            }
            if (actions.fixAll) {
                result.push(actions.fixAll);
            }
            if (actions.disableFile) {
                result.push(actions.disableFile);
            }
            if (actions.showDocumentation) {
                result.push(actions.showDocumentation);
            }
        }
        if (this._fixAll !== undefined) {
            result.push(...this._fixAll);
        }
        return result;
    }
    get length() {
        let result = 0;
        for (let actions of this._actions.values()) {
            result += actions.fixes.length;
        }
        return result;
    }
}
class Changes {
    constructor() {
        this.values = new Map();
        this.uri = undefined;
        this.version = undefined;
    }
    clear(textDocument) {
        if (textDocument === undefined) {
            this.uri = undefined;
            this.version = undefined;
        }
        else {
            this.uri = textDocument.uri;
            this.version = textDocument.version;
        }
        this.values.clear();
    }
    isUsable(uri, version) {
        return this.uri === uri && this.version === version;
    }
    set(key, change) {
        this.values.set(key, change);
    }
    get(key) {
        return this.values.get(key);
    }
}
var CommandParams;
(function (CommandParams) {
    function create(textDocument, ruleId, sequence) {
        return { uri: textDocument.uri, version: textDocument.version, ruleId, sequence };
    }
    CommandParams.create = create;
    function hasRuleId(value) {
        return value.ruleId !== undefined;
    }
    CommandParams.hasRuleId = hasRuleId;
})(CommandParams || (CommandParams = {}));
const changes = new Changes();
const ESLintSourceFixAll = `${node_1.CodeActionKind.SourceFixAll}.eslint`;
messageQueue.registerRequest(node_1.CodeActionRequest.type, (params) => {
    const result = new CodeActionResult();
    const uri = params.textDocument.uri;
    const textDocument = documents.get(uri);
    if (textDocument === undefined) {
        changes.clear(textDocument);
        return result.all();
    }
    function createCodeAction(title, kind, commandId, arg, diagnostic) {
        const command = node_1.Command.create(title, commandId, arg);
        const action = node_1.CodeAction.create(title, command, kind);
        if (diagnostic !== undefined) {
            action.diagnostics = [diagnostic];
        }
        return action;
    }
    function createDisableLineTextEdit(editInfo, indentationText) {
        return node_1.TextEdit.insert(node_1.Position.create(editInfo.line - 1, 0), `${indentationText}// eslint-disable-next-line ${editInfo.ruleId}${os_1.EOL}`);
    }
    function createDisableSameLineTextEdit(editInfo) {
        // Todo@dbaeumer Use uinteger.MAX_VALUE instead.
        return node_1.TextEdit.insert(node_1.Position.create(editInfo.line - 1, 2147483647), ` // eslint-disable-line ${editInfo.ruleId}`);
    }
    function createDisableFileTextEdit(editInfo) {
        // If firts line contains a shebang, insert on the next line instead.
        const shebang = textDocument === null || textDocument === void 0 ? void 0 : textDocument.getText(node_1.Range.create(node_1.Position.create(0, 0), node_1.Position.create(0, 2)));
        const line = shebang === '#!' ? 1 : 0;
        return node_1.TextEdit.insert(node_1.Position.create(line, 0), `/* eslint-disable ${editInfo.ruleId} */${os_1.EOL}`);
    }
    function getLastEdit(array) {
        const length = array.length;
        if (length === 0) {
            return undefined;
        }
        return array[length - 1];
    }
    return resolveSettings(textDocument).then(async (settings) => {
        // The file is not validated at all or we couldn't load an eslint library for it.
        if (settings.validate !== Validate.on || !TextDocumentSettings.hasLibrary(settings)) {
            return result.all();
        }
        const problems = codeActions.get(uri);
        // We validate on type and have no problems ==> nothing to fix.
        if (problems === undefined && settings.run === 'onType') {
            return result.all();
        }
        const only = params.context.only !== undefined && params.context.only.length > 0 ? params.context.only[0] : undefined;
        const isSource = only === node_1.CodeActionKind.Source;
        const isSourceFixAll = (only === ESLintSourceFixAll || only === node_1.CodeActionKind.SourceFixAll);
        if (isSourceFixAll || isSource) {
            if (isSourceFixAll && settings.codeActionOnSave.enable) {
                const textDocumentIdentifer = { uri: textDocument.uri, version: textDocument.version };
                const edits = await computeAllFixes(textDocumentIdentifer, AllFixesMode.onSave);
                if (edits !== undefined) {
                    result.fixAll.push(node_1.CodeAction.create(`Fix all ESLint auto-fixable problems`, { documentChanges: [node_1.TextDocumentEdit.create(textDocumentIdentifer, edits)] }, ESLintSourceFixAll));
                }
            }
            else if (isSource) {
                result.fixAll.push(createCodeAction(`Fix all ESLint auto-fixable problems`, node_1.CodeActionKind.Source, CommandIds.applyAllFixes, CommandParams.create(textDocument)));
            }
            return result.all();
        }
        if (problems === undefined) {
            return result.all();
        }
        const fixes = new Fixes(problems);
        if (fixes.isEmpty()) {
            return result.all();
        }
        let documentVersion = -1;
        const allFixableRuleIds = [];
        const kind = only !== null && only !== void 0 ? only : node_1.CodeActionKind.QuickFix;
        for (let editInfo of fixes.getScoped(params.context.diagnostics)) {
            documentVersion = editInfo.documentVersion;
            const ruleId = editInfo.ruleId;
            allFixableRuleIds.push(ruleId);
            if (Problem.isFixable(editInfo)) {
                const workspaceChange = new node_1.WorkspaceChange();
                workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(FixableProblem.createTextEdit(textDocument, editInfo));
                changes.set(`${CommandIds.applySingleFix}:${ruleId}`, workspaceChange);
                const action = createCodeAction(editInfo.label, kind, CommandIds.applySingleFix, CommandParams.create(textDocument, ruleId), editInfo.diagnostic);
                action.isPreferred = true;
                result.get(ruleId).fixes.push(action);
            }
            if (Problem.hasSuggestions(editInfo)) {
                editInfo.suggestions.forEach((suggestion, suggestionSequence) => {
                    const workspaceChange = new node_1.WorkspaceChange();
                    workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(SuggestionsProblem.createTextEdit(textDocument, suggestion));
                    changes.set(`${CommandIds.applySuggestion}:${ruleId}:${suggestionSequence}`, workspaceChange);
                    const action = createCodeAction(`${suggestion.desc} (${editInfo.ruleId})`, node_1.CodeActionKind.QuickFix, CommandIds.applySuggestion, CommandParams.create(textDocument, ruleId, suggestionSequence), editInfo.diagnostic);
                    result.get(ruleId).suggestions.push(action);
                });
            }
            if (settings.codeAction.disableRuleComment.enable) {
                let workspaceChange = new node_1.WorkspaceChange();
                if (settings.codeAction.disableRuleComment.location === 'sameLine') {
                    workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createDisableSameLineTextEdit(editInfo));
                }
                else {
                    // Todo@dbaeumer Use uinteger.MAX_VALUE instead.
                    const lineText = textDocument.getText(node_1.Range.create(node_1.Position.create(editInfo.line - 1, 0), node_1.Position.create(editInfo.line - 1, 2147483647)));
                    const matches = /^([ \t]*)/.exec(lineText);
                    const indentationText = matches !== null && matches.length > 0 ? matches[1] : '';
                    workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createDisableLineTextEdit(editInfo, indentationText));
                }
                changes.set(`${CommandIds.applyDisableLine}:${ruleId}`, workspaceChange);
                result.get(ruleId).disable = createCodeAction(`Disable ${ruleId} for this line`, kind, CommandIds.applyDisableLine, CommandParams.create(textDocument, ruleId));
                if (result.get(ruleId).disableFile === undefined) {
                    workspaceChange = new node_1.WorkspaceChange();
                    workspaceChange.getTextEditChange({ uri, version: documentVersion }).add(createDisableFileTextEdit(editInfo));
                    changes.set(`${CommandIds.applyDisableFile}:${ruleId}`, workspaceChange);
                    result.get(ruleId).disableFile = createCodeAction(`Disable ${ruleId} for the entire file`, kind, CommandIds.applyDisableFile, CommandParams.create(textDocument, ruleId));
                }
            }
            if (settings.codeAction.showDocumentation.enable && result.get(ruleId).showDocumentation === undefined) {
                if (ruleDocData.urls.has(ruleId)) {
                    result.get(ruleId).showDocumentation = createCodeAction(`Show documentation for ${ruleId}`, kind, CommandIds.openRuleDoc, CommandParams.create(textDocument, ruleId));
                }
            }
        }
        if (result.length > 0) {
            const sameProblems = new Map(allFixableRuleIds.map(s => [s, []]));
            for (let editInfo of fixes.getAllSorted()) {
                if (documentVersion === -1) {
                    documentVersion = editInfo.documentVersion;
                }
                if (sameProblems.has(editInfo.ruleId)) {
                    const same = sameProblems.get(editInfo.ruleId);
                    if (!Fixes.overlaps(getLastEdit(same), editInfo)) {
                        same.push(editInfo);
                    }
                }
            }
            sameProblems.forEach((same, ruleId) => {
                if (same.length > 1) {
                    const sameFixes = new node_1.WorkspaceChange();
                    const sameTextChange = sameFixes.getTextEditChange({ uri, version: documentVersion });
                    same.map(fix => FixableProblem.createTextEdit(textDocument, fix)).forEach(edit => sameTextChange.add(edit));
                    changes.set(CommandIds.applySameFixes, sameFixes);
                    result.get(ruleId).fixAll = createCodeAction(`Fix all ${ruleId} problems`, kind, CommandIds.applySameFixes, CommandParams.create(textDocument));
                }
            });
            result.fixAll.push(createCodeAction(`Fix all auto-fixable problems`, kind, CommandIds.applyAllFixes, CommandParams.create(textDocument)));
        }
        return result.all();
    });
}, (params) => {
    const document = documents.get(params.textDocument.uri);
    return document !== undefined ? document.version : undefined;
});
var AllFixesMode;
(function (AllFixesMode) {
    AllFixesMode["onSave"] = "onsave";
    AllFixesMode["format"] = "format";
    AllFixesMode["command"] = "command";
})(AllFixesMode || (AllFixesMode = {}));
function computeAllFixes(identifier, mode) {
    const uri = identifier.uri;
    const textDocument = documents.get(uri);
    if (textDocument === undefined || identifier.version !== textDocument.version) {
        return undefined;
    }
    return resolveSettings(textDocument).then((settings) => {
        if (settings.validate !== Validate.on || !TextDocumentSettings.hasLibrary(settings) || (mode === AllFixesMode.format && !settings.format)) {
            return [];
        }
        const filePath = getFilePath(textDocument);
        return withCLIEngine((cli) => {
            const problems = codeActions.get(uri);
            const originalContent = textDocument.getText();
            let problemFixes;
            const result = [];
            let start = Date.now();
            // Only use known fixes when running in onSave mode. See https://github.com/microsoft/vscode-eslint/issues/871
            // for details
            if (mode === AllFixesMode.onSave && problems !== undefined && problems.size > 0) {
                const fixes = (new Fixes(problems)).getApplicable();
                if (fixes.length > 0) {
                    problemFixes = fixes.map(fix => FixableProblem.createTextEdit(textDocument, fix));
                }
            }
            if (mode === AllFixesMode.onSave && settings.codeActionOnSave.mode === CodeActionsOnSaveMode.problems) {
                connection.tracer.log(`Computing all fixes took: ${Date.now() - start} ms.`);
                if (problemFixes !== undefined) {
                    result.push(...problemFixes);
                }
            }
            else {
                let content;
                if (problemFixes !== undefined) {
                    content = vscode_languageserver_textdocument_1.TextDocument.applyEdits(textDocument, problemFixes);
                }
                else {
                    content = originalContent;
                }
                const report = cli.executeOnText(content, filePath);
                connection.tracer.log(`Computing all fixes took: ${Date.now() - start} ms.`);
                if (Array.isArray(report.results) && report.results.length === 1 && report.results[0].output !== undefined) {
                    const fixedContent = report.results[0].output;
                    start = Date.now();
                    const diffs = diff_1.stringDiff(originalContent, fixedContent, false);
                    connection.tracer.log(`Computing minimal edits took: ${Date.now() - start} ms.`);
                    for (let diff of diffs) {
                        result.push({
                            range: {
                                start: textDocument.positionAt(diff.originalStart),
                                end: textDocument.positionAt(diff.originalStart + diff.originalLength)
                            },
                            newText: fixedContent.substr(diff.modifiedStart, diff.modifiedLength)
                        });
                    }
                }
                else if (problemFixes !== undefined) {
                    result.push(...problemFixes);
                }
            }
            return result;
        }, settings, { fix: true });
    });
}
messageQueue.registerRequest(node_1.ExecuteCommandRequest.type, async (params) => {
    let workspaceChange;
    const commandParams = params.arguments[0];
    if (params.command === CommandIds.applyAllFixes) {
        const edits = await computeAllFixes(commandParams, AllFixesMode.command);
        if (edits !== undefined) {
            workspaceChange = new node_1.WorkspaceChange();
            const textChange = workspaceChange.getTextEditChange(commandParams);
            edits.forEach(edit => textChange.add(edit));
        }
    }
    else {
        if ([CommandIds.applySingleFix, CommandIds.applyDisableLine, CommandIds.applyDisableFile].indexOf(params.command) !== -1) {
            workspaceChange = changes.get(`${params.command}:${commandParams.ruleId}`);
        }
        else if ([CommandIds.applySuggestion].indexOf(params.command) !== -1) {
            workspaceChange = changes.get(`${params.command}:${commandParams.ruleId}:${commandParams.sequence}`);
        }
        else if (params.command === CommandIds.openRuleDoc && CommandParams.hasRuleId(commandParams)) {
            const url = ruleDocData.urls.get(commandParams.ruleId);
            if (url) {
                connection.sendRequest(OpenESLintDocRequest.type, { url });
            }
        }
        else {
            workspaceChange = changes.get(params.command);
        }
    }
    if (workspaceChange === undefined) {
        return {};
    }
    return connection.workspace.applyEdit(workspaceChange.edit).then((response) => {
        if (!response.applied) {
            connection.console.error(`Failed to apply command: ${params.command}`);
        }
        return {};
    }, () => {
        connection.console.error(`Failed to apply command: ${params.command}`);
    });
}, (params) => {
    const commandParam = params.arguments[0];
    if (changes.isUsable(commandParam.uri, commandParam.version)) {
        return commandParam.version;
    }
    else {
        return undefined;
    }
});
messageQueue.registerRequest(node_1.DocumentFormattingRequest.type, (params) => {
    const textDocument = documents.get(params.textDocument.uri);
    if (textDocument === undefined) {
        return [];
    }
    return computeAllFixes({ uri: textDocument.uri, version: textDocument.version }, AllFixesMode.format);
}, (params) => {
    const document = documents.get(params.textDocument.uri);
    return document !== undefined ? document.version : undefined;
});
connection.listen();
//# sourceMappingURL=eslintServer.js.map