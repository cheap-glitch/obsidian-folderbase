import {
	MarkdownView,
	type Menu,
	normalizePath,
	Plugin,
	type TAbstractFile,
	TFile,
	TFolder,
	type View,
} from 'obsidian';

import { FolderbaseView } from '@/views/folderbase';

import { safeParseJsonObject } from '@/helpers/json';
import { FDB_FILE_EXTENSION, FDB_VIEW_ICONS, FDB_VIEW_ID } from '@/lib/constants';
import { EventManager } from '@/lib/event-manager';
import { FOLDERBASE_SETTINGS_VERSION } from '@/lib/settings';
import { getDatabaseFileTemplate, getDatabaseFolderTemplate } from '@/lib/template';

import type { JsonObject } from 'type-fest';
import type { FolderbaseFullSettings, PartialFolderbaseSettings } from '@/lib/settings';

import './utilities.css';

export default class FolderbasePlugin extends Plugin {
	onload() {
		// Wait for the app to have loaded all the files in the vault
		this.app.workspace.onLayoutReady(() => {
			this.init();
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(FDB_VIEW_ID);
	}

	private init() {
		this.registerView(FDB_VIEW_ID, (leaf) => new FolderbaseView(leaf));
		this.registerExtensions([FDB_FILE_EXTENSION], FDB_VIEW_ID);
		this.registerEvents();

		// TODO: Update already-opened Folderbase files
	}

	private addSwitchViewModeMenuItem(menu: Menu, view: View) {
		if (!(view instanceof FolderbaseView)) {
			return;
		}

		menu.addItem((item) => {
			const otherMode = view.mode === 'table' ? 'kanban' : 'table';

			item.setTitle(`Switch to ${otherMode} view`)
				.setIcon(FDB_VIEW_ICONS[otherMode])
				.onClick(() => {
					view.setMode(otherMode);
					EventManager.getInstance().emit('set-view-mode', {
						mode: otherMode,
						filePath: view.file?.path,
					});
				});
		});
	}

	private registerEvents() {
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, _editor, view) => {
				if (view instanceof MarkdownView) {
					this.addSwitchViewModeMenuItem(menu, view);
				}

				if (view.file) {
					this.addContextMenuItem(menu, view.file);
				}
			}),
		);

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, node, _source, leaf) => {
				if (node instanceof TFile) {
					menu.addSeparator();

					const template = getDatabaseFileTemplate(node);
					if (template) {
						this.addContextMenuItem(menu, template);
					}

					if (leaf && node.extension === FDB_FILE_EXTENSION) {
						this.addSwitchViewModeMenuItem(menu, leaf.view);
					}

					menu.addSeparator();

					return;
				}

				menu.addSeparator();
				if (node instanceof TFolder) {
					const template = getDatabaseFolderTemplate(node);
					if (template) {
						this.addContextMenuItem(menu, template);
					}
				}
				menu.addItem((item) => {
					item.setTitle('New table view from folder')
						.setIcon(FDB_VIEW_ICONS.table)
						.onClick(() => this.createFolderbaseTableFile(node.path));
				});
				menu.addItem((item) => {
					item.setTitle('New kanban view from folder')
						.setIcon(FDB_VIEW_ICONS.kanban)
						.onClick(() => this.createFolderbaseKanbanFile(node.path));
				});
				menu.addSeparator();
			}),
		);

		this.registerEvent(
			this.app.vault.on('create', (file: TAbstractFile) => {
				if (file instanceof TFile) {
					EventManager.getInstance().emit('file-created', { file });
				}
			}),
		);

		this.registerEvent(
			this.app.vault.on('rename', (file: TAbstractFile) => {
				EventManager.getInstance().emit(file instanceof TFile ? 'file-renamed' : 'folder-renamed');
			}),
		);

		this.registerEvent(
			this.app.vault.on('delete', (file: TAbstractFile) => {
				EventManager.getInstance().emit(file instanceof TFile ? 'file-removed' : 'folder-removed');
			}),
		);

		this.registerEvent(
			this.app.metadataCache.on('changed', async (file) => {
				if (file instanceof TFile) {
					EventManager.getInstance().emit('file-frontmatter-updated', { file });
				}
			}),
		);
	}

	private addContextMenuItem(menu: Menu, template: TFile): void {
		menu.addItem((item) => {
			item.setTitle('New database item')
				.setIcon('file-plus')
				.onClick(async () => {
					await this.duplicateFileAndOpenCopy(template);
				});
		});
	}
	private async duplicateFileAndOpenCopy(file: TFile): Promise<void> {
		try {
			const copy = await this.app.vault.copy(file, `${file.parent?.path ?? ''}/New item.md`);
			await this.app.workspace.getLeaf('tab').openFile(copy, {
				active: true,
			});
		} catch (error) {
			console.error('Error duplicating file:', error);
		}
	}

	private async createFolderbaseTableFile(folderPath: string): Promise<void> {
		return this.createFolderbaseFile(folderPath, {
			mode: 'table',
			folder: normalizePath(folderPath),
			kanban: {},
		});
	}

	private async createFolderbaseKanbanFile(folderPath: string): Promise<void> {
		return this.createFolderbaseFile(folderPath, {
			mode: 'kanban',
			folder: normalizePath(folderPath),
			kanban: {},
		});
	}

	private async createFolderbaseFile(folderPath: string, initialSettings: PartialFolderbaseSettings): Promise<void> {
		try {
			const jsonSettings = JSON.stringify({
				version: FOLDERBASE_SETTINGS_VERSION,
				settings: initialSettings,
			} as FolderbaseFullSettings);

			const file = await this.app.vault.create(`${folderPath}.${FDB_FILE_EXTENSION}`, jsonSettings);
			await this.app.workspace.getLeaf('tab').openFile(file);
		} catch (error) {
			console.error(error); // TODO: Display error in alert
		}
	}

	private async getMetadataMenuPluginData(): Promise<JsonObject | undefined> {
		try {
			const rawData = await this.app.vault.adapter.read('.obsidian/plugins/metadata-menu/data.json');
			const result = safeParseJsonObject(rawData);

			return result instanceof Error ? undefined : result;
		} catch {
			return undefined;
		}
	}
}
