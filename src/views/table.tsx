import { TextFileView, type WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Table } from '@/components/table/Table';
import { Icon } from '@/components/ui/Icon';

import { AppContext } from '@/contexts/app-context';
import { safeParseJsonObject } from '@/helpers/text';
import { FDB_FILE_EXTENSION } from '@/lib/constants';
import { buildTableData } from '@/lib/data';

export const TABLE_VIEW_ID = 'folderbase';

export class TableView extends TextFileView {
	root?: Root;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		this.icon = 'table';
		// https://docs.obsidian.md/Reference/TypeScript+API/View/navigation
		this.navigation = false;
		this.allowNoFile = false;
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
	}

	async onClose() {
		this.root?.unmount();

		// TODO: https://docs.obsidian.md/Reference/TypeScript+API/Component/register ?
	}

	getViewType() {
		return TABLE_VIEW_ID;
	}

	getDisplayText() {
		return this.file?.basename ?? 'Folderbase Table';
	}

	getViewData(): string {
		return JSON.stringify({}); // TODO: Save the file settings here?
	}

	clear() {
		// TODO ?
	}

	setViewData(textContents: string, clear: boolean): void {
		if (clear) {
			this.clear();
		}

		const fileSettings = safeParseJsonObject(textContents);
		const folderPath =
			// TODO: Use zod (or similar lib) to runtime typecheck the settings object
			fileSettings instanceof Error || !('folder' in fileSettings) || typeof fileSettings.folder !== 'string'
				? this.getDefaultFolderPath()
				: fileSettings.folder;

		this.root?.render(
			<div className="fdb-center-content">
				<p>Loading data…</p>
			</div>,
		);

		void this.loadAndDisplayFolderData(folderPath);
	}

	private async loadAndDisplayFolderData(folderPath: string): Promise<void> {
		const tableData = await buildTableData(this.app, folderPath);

		if (tableData instanceof Error) {
			this.root?.render(
				<div className="fdb-center-content">
					<div className="fdb-flex">
						<Icon
							id="triangle-alert"
							color="var(--text-error)"
							ariaLabel="error"
						/>
						<p className="fdb-error-message">{tableData.message}</p>
					</div>
				</div>,
			);

			return;
		}

		this.root?.render(
			<StrictMode>
				<AppContext.Provider value={this.app}>
					<Table
						{...tableData}
						folderPath={folderPath}
					/>
				</AppContext.Provider>
			</StrictMode>,
		);
	}

	private getDefaultFolderPath(): string {
		// biome-ignore lint/style/noNonNullAssertion: `this.allowNoFile` is set to `false`
		const filePath = this.file!.path;

		// Remove the file extension
		return filePath.slice(0, filePath.length - (FDB_FILE_EXTENSION.length + 1));
	}
}
