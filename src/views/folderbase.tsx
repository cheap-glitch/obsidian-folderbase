import { normalizePath, TextFileView, type WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { FolderbaseMain } from '@/components/FolderbaseMain';
import { Icon } from '@/components/ui/Icon';

import { AppContext } from '@/contexts/app-context';
import { SettingsStoreProvider } from '@/contexts/settings-context';
import { getDefaultFolderPath } from '@/helpers/files';
import { safeParseJsonObject } from '@/helpers/json';
import { FDB_VIEW_ID, KANBAN_VIEW_ICON, TABLE_VIEW_ICON } from '@/lib/constants';
import { collateFilesData } from '@/lib/files-data';

import type { FolderbaseViewMode } from '../lib/settings';

export class FolderbaseView extends TextFileView {
	root?: Root;
	mode: FolderbaseViewMode;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		// https://docs.obsidian.md/Reference/TypeScript+API/View/navigation
		this.navigation = false;
		this.allowNoFile = false;
		this.mode = 'table';
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root?.render(
			<div className="fdb-center-content">
				<p>Loading data…</p>
			</div>,
		);
	}

	async onClose() {
		this.root?.unmount();

		// TODO: https://docs.obsidian.md/Reference/TypeScript+API/Component/register ?
	}

	getViewType() {
		return FDB_VIEW_ID;
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

	setMode(mode: FolderbaseViewMode) {
		this.mode = mode;
		this.icon = this.mode === 'table' ? TABLE_VIEW_ICON : KANBAN_VIEW_ICON;
	}

	setViewData(textContents: string, clear: boolean) {
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
				: (String(fileSettings.mode) as FolderbaseViewMode);

		const folderPath =
			fileSettings instanceof Error || !('folder' in fileSettings) || typeof fileSettings.folder !== 'string'
				? getDefaultFolderPath(filePath)
				: fileSettings.folder;

		this.icon = this.mode === 'table' ? TABLE_VIEW_ICON : KANBAN_VIEW_ICON;
		void this.loadAndDisplayFolderData(folderPath);
	}

	private async loadAndDisplayFolderData(folderPath: string): Promise<void> {
		const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
		if (folder === null) {
			this.renderErrorMessage(new Error(`Could not open folder at "${folderPath}"`));

			return;
		}

		const result = await collateFilesData(this.app, folder, { withContents: this.mode === 'kanban' });
		if (result instanceof Error) {
			this.renderErrorMessage(result);

			return;
		}

		const { data, allFrontmatterKeys } = result;
		if (data.length === 0 || allFrontmatterKeys.size === 0) {
			// TODO: Display empty message
			return;
		}

		this.root?.render(
			<StrictMode>
				<SettingsStoreProvider
					settings={{
						mode: this.mode,
						kanban: {
							columnsKey: 'Mois', // __CUSTOM__
							openCardFilesInNew: 'rsplit',
							showCardTitles: false,
							showCardFrontmatter: true,
						},
					}}
				>
					<AppContext.Provider value={this.app}>
						<FolderbaseMain
							data={data}
							keys={allFrontmatterKeys}
							folderPath={folderPath}
							// biome-ignore lint/style/noNonNullAssertion: `this.allowNoFile` is set to `false`
							viewFilePath={this.file!.path}
						/>
					</AppContext.Provider>
				</SettingsStoreProvider>
			</StrictMode>,
		);
	}

	private renderErrorMessage(error: Error) {
		this.root?.render(
			<div className="fdb-center-content">
				<div className="fdb-flex-row">
					<Icon
						id="triangle-alert"
						color="var(--text-error)"
					/>
					<p className="fdb-error-message">{error.message}</p>
				</div>
			</div>,
		);
	}
}
