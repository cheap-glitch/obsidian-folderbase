import { normalizePath, TextFileView, type WorkspaceLeaf } from 'obsidian';
import { type ReactNode, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Table } from '@/components/table/Table';
import { Icon } from '@/components/ui/Icon';

import { AppContext } from '@/contexts/app-context';
import { getDefaultFolderPath } from '@/helpers/files';
import { safeParseJsonObject } from '@/helpers/json';
import { KANBAN_VIEW_ICON, TABLE_VIEW_ICON } from '@/lib/constants';
import { buildKanbanData } from '@/lib/data/kanban';
import { buildTableData } from '@/lib/data/table';

import type { FolderbaseFileSettings } from '@/lib/settings';

export const FOLDERBASE_VIEW_ID = 'obsidian-folderbase';

export class FolderBaseView extends TextFileView {
	mode: FolderbaseFileSettings['mode'];
	root?: Root;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		// https://docs.obsidian.md/Reference/TypeScript+API/View/navigation
		this.navigation = false;
		this.allowNoFile = false;

		this.mode = 'table';
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
	}

	async onClose() {
		this.root?.unmount();

		// TODO: https://docs.obsidian.md/Reference/TypeScript+API/Component/register ?
	}

	getViewType() {
		return FOLDERBASE_VIEW_ID;
	}

	getDisplayText() {
		return this.file?.basename ?? `Folderbase ${this.mode === 'table' ? 'Table' : 'Kanban'}`;
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

		// biome-ignore lint/style/noNonNullAssertion: `this.allowNoFile` is set to `false`
		const filePath = this.file!.path;
		const fileSettings = safeParseJsonObject(textContents);

		// TODO: Use zod (or similar lib) to runtime typecheck the settings object
		this.mode =
			fileSettings instanceof Error ||
			!('mode' in fileSettings) ||
			typeof fileSettings.mode !== 'string' ||
			(fileSettings.mode !== 'table' && fileSettings.mode !== 'kanban')
				? 'table'
				: (String(fileSettings.mode) as FolderbaseFileSettings['mode']);

		const folderPath =
			fileSettings instanceof Error || !('folder' in fileSettings) || typeof fileSettings.folder !== 'string'
				? getDefaultFolderPath(filePath)
				: fileSettings.folder;

		this.icon = this.mode === 'table' ? TABLE_VIEW_ICON : KANBAN_VIEW_ICON;
		this.root?.render(
			<div className="fdb-center-content">
				<p>Loading data…</p>
			</div>,
		);

		void this.loadAndDisplayFolderData(folderPath);
	}

	private async loadAndDisplayFolderData(folderPath: string): Promise<void> {
		const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
		if (folder === null) {
			this.renderErrorMessage(new Error(`Could not open folder "${folderPath}"`));

			return;
		}

		switch (this.mode) {
			case 'table': {
				const tableData = await buildTableData(this.app, folder);
				if (tableData instanceof Error) {
					this.renderErrorMessage(tableData);
				} else {
					this.renderMainNode(
						<Table
							{...tableData}
							folderPath={folderPath}
						/>,
					);
				}

				break;
			}

			case 'kanban': {
				const kanbanData = await buildKanbanData(this.app, folder);
				if (kanbanData instanceof Error) {
					this.renderErrorMessage(kanbanData);
				} else {
					this.renderMainNode(<KanbanBoard data={kanbanData} />);
				}
				break;
			}
		}
	}

	private renderMainNode(node: ReactNode) {
		this.root?.render(
			<StrictMode>
				<AppContext.Provider value={this.app}>{node}</AppContext.Provider>
			</StrictMode>,
		);
	}

	private renderErrorMessage(error: Error) {
		this.root?.render(
			<div className="fdb-center-content">
				<div className="fdb-flex">
					<Icon
						id="triangle-alert"
						color="var(--text-error)"
						ariaLabel="error"
					/>
					<p className="fdb-error-message">{error.message}</p>
				</div>
			</div>,
		);
	}
}
