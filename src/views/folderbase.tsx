import { normalizePath, TextFileView, type WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ZodError, z } from 'zod/v4';

import { AppContext } from '@/contexts/app-context';
import { SettingsProvider } from '@/contexts/settings-context';

import { FolderbaseMain } from '@/components/FolderbaseMain';
import { Icon } from '@/components/ui/Icon';

import { getDefaultFolderPath } from '@/helpers/files';
import { safeParseJsonObject } from '@/helpers/json';
import { getSetValueAtIndex } from '@/helpers/sets';
import { FDB_DEFAULT_VIEW_MODE, FDB_VIEW_DEFAULT_TITLES, FDB_VIEW_ICONS, FDB_VIEW_ID } from '@/lib/constants';
import { collateFilesData } from '@/lib/files-data';
import { FolderbaseViewSettingsSchema } from '@/lib/settings';

import type { FolderbaseViewSettings } from '@/lib/settings';
import type { FolderbaseViewMode } from '@/types/settings';

export class FolderbaseView extends TextFileView {
	// settings?: FolderbaseViewSettings;
	mode: FolderbaseViewMode;
	root?: Root;
	controller?: AbortController;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);

		// https://docs.obsidian.md/Reference/TypeScript+API/View/navigation
		this.navigation = false;
		this.allowNoFile = false;

		this.mode = FDB_DEFAULT_VIEW_MODE;
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
	}

	// TODO: https://docs.obsidian.md/Reference/TypeScript+API/Component/register ?
	async onClose() {
		this.root?.unmount();
	}

	getViewType() {
		return FDB_VIEW_ID;
	}

	getDisplayText() {
		return this.file?.basename ?? FDB_VIEW_DEFAULT_TITLES[this.mode];
	}

	// Needed for the implementation of a `TextFileView`,
	// but we don't actually use it because we write directly to the file when saving the settings
	getViewData(): string {
		return '';
	}

	clear() {
		// Since the rendering of the view is asynchronous, we need to be able to cancel it midway
		// whenenever `setViewData()` is called several times in quick succession by the app
		this.controller?.abort();
	}

	setMode(mode: FolderbaseViewMode) {
		this.mode = mode;
		this.icon = FDB_VIEW_ICONS[mode];
	}

	private saveSettings(settings: FolderbaseViewSettings): void {
		if (this.file) {
			this.app.vault.process(this.file, () => JSON.stringify(settings, undefined, '\t'));
		}
	}

	setViewData(textContents: string, clear: boolean) {
		if (clear) {
			this.clear();
		}

		const controller = new AbortController();
		this.controller = controller;
		this.renderLoadingMessage();

		const settingsObject = safeParseJsonObject(textContents);
		if (settingsObject instanceof Error) {
			this.renderErrorMessage(settingsObject);

			return;
		}

		// TODO: show error message but still render the view with the default settings
		const parsedSettings = FolderbaseViewSettingsSchema.safeParse(settingsObject);
		if (!parsedSettings.success) {
			this.renderErrorMessage(parsedSettings.error);

			return;
		}

		const settings = parsedSettings.data;
		this.setMode(settings.mode);

		// biome-ignore lint/style/noNonNullAssertion: `this.allowNoFile` is set to `false`
		const filePath = this.file!.path;
		const folderPath = settings.folder ?? getDefaultFolderPath(filePath);
		void this.loadAndDisplayFolderData(filePath, folderPath, settings, controller.signal);
	}

	private async loadAndDisplayFolderData(
		filePath: string,
		folderPath: string,
		initialSettings: FolderbaseViewSettings,
		signal: AbortSignal,
	): Promise<void> {
		if (signal.aborted) {
			return;
		}

		const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
		if (folder === null) {
			this.renderErrorMessage(new Error(`Could not open folder at "${folderPath}"`));

			return;
		}

		const result = await collateFilesData(this.app, folder, {
			signal,
			withContents: initialSettings.mode === 'kanban',
		});
		if (signal.aborted) {
			return;
		}

		if (result instanceof Error) {
			this.renderErrorMessage(result);

			return;
		}

		const { data, allFrontmatterKeys } = result;

		if (data.length === 0) {
			this.renderInfoMessage('There are no files in the folder to display.', { iconId: 'file-x' });

			return;
		}

		// TODO: Filter the frontmatter keys to select only "acceptable" ones for
		// the kanban columns (i.e. ones whose set of unique values are limited to ~10 or less)

		const defaultKabanColumnsKey = getSetValueAtIndex(allFrontmatterKeys, 0);
		if (!defaultKabanColumnsKey) {
			this.renderInfoMessage('There is no frontmatter data in the folder to display.', {
				iconId: 'circle-slash-2',
			});

			return;
		}
		if (initialSettings.kanban.columnsKey === '') {
			initialSettings.kanban.columnsKey = defaultKabanColumnsKey;
		}

		this.root?.render(
			<StrictMode>
				<SettingsProvider initialSettings={initialSettings}>
					<AppContext.Provider value={this.app}>
						<FolderbaseMain
							initialData={data}
							initialKeys={allFrontmatterKeys}
							filePath={filePath}
							folderPath={folderPath}
							onSettingsUpdated={(settings) => {
								this.setMode(settings.mode);
								this.saveSettings(settings);
							}}
						/>
					</AppContext.Provider>
				</SettingsProvider>
			</StrictMode>,
		);
	}

	private renderLoadingMessage() {
		this.renderInfoMessage('Loading files…', { iconId: 'file-text' });
	}

	private renderInfoMessage(message: string, { iconId = 'info' }: { iconId?: string } = {}) {
		this.root?.render(
			<div className="fdb-center-content">
				<div className="fdb-flex-row">
					<Icon
						id={iconId}
						color="var(--text-muted)"
					/>
					<p className="fdb-info-message">{message}</p>
				</div>
			</div>,
		);
	}

	private renderErrorMessage(error: Error | ZodError) {
		this.root?.render(
			<div className="fdb-center-content">
				<div className="fdb-flex-row">
					<Icon
						id="triangle-alert"
						color="var(--text-error)"
					/>
					<p className="fdb-error-message">
						{error instanceof ZodError ? z.prettifyError(error) : error.message}
					</p>
				</div>
			</div>,
		);
	}
}
