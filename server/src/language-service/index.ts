/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Equinor ASA
 *  Copyright (c) Microsoft Corporation. All rights reserved. [markdown-language-features]
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as lsp from "vscode-languageserver";
import { FoldingRangeProvider } from "./foldingRangeProvider";
import { ITextDocument } from "./types/textDocument";
import { IWorkspace } from "../workspace";
import { SepticConfigProvider } from "./septicConfigProvider";
import { DiagnosticProvider } from "./diagnosticsProvider";
import { DocumentSymbolProvider } from "./documentSymbolProvider";
import { SettingsManager } from "../settings";
import { CompletionProvider } from "./completionProvider";
import { SepticMetaInfoProvider } from "./septicMetaInfoProvider";

export * from "./types/textDocument";

export interface ILanguageService {
    provideFoldingRanges(
        doc: ITextDocument,
        token: lsp.CancellationToken | undefined
    ): lsp.FoldingRange[];

    provideDiagnostics(
        doc: ITextDocument,
        token: lsp.CancellationToken | undefined
    ): lsp.Diagnostic[];

    provideDocumentSymbols(
        doc: ITextDocument,
        token: lsp.CancellationToken | undefined
    ): lsp.DocumentSymbol[];

    provideCompletion(
        pos: lsp.TextDocumentPositionParams,
        doc: ITextDocument
    ): lsp.CompletionItem[];
}

export function createLanguageService(
    workspace: IWorkspace,
    configurationManager: SettingsManager
) {
    const metaInfoProvider = new SepticMetaInfoProvider();
    const cnfgProvider = new SepticConfigProvider(workspace);
    const foldingRangeProvider = new FoldingRangeProvider(
        cnfgProvider,
        metaInfoProvider
    );
    const diagnosticProvider = new DiagnosticProvider(
        cnfgProvider,
        configurationManager,
        metaInfoProvider
    );
    const documentSymbolProvider = new DocumentSymbolProvider(
        cnfgProvider,
        metaInfoProvider
    );

    const completionProvider = new CompletionProvider(
        cnfgProvider,
        metaInfoProvider
    );

    return Object.freeze<ILanguageService>({
        provideFoldingRanges:
            foldingRangeProvider.provideFoldingRanges.bind(
                foldingRangeProvider
            ),
        provideDiagnostics:
            diagnosticProvider.provideDiagnostics.bind(diagnosticProvider),
        provideDocumentSymbols:
            documentSymbolProvider.provideDocumentSymbols.bind(
                documentSymbolProvider
            ),
        provideCompletion:
            completionProvider.provideCompletion.bind(completionProvider),
    });
}
