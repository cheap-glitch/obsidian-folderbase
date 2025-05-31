import { normalizePath, Plugin, type TAbstractFile, TFile, TFolder } from 'obsidian';

import { FolderbaseView } from '@/views/folderbase';

import { FDB_FILE_EXTENSION, FDB_VIEW_ID, KANBAN_VIEW_ICON, TABLE_VIEW_ICON } from '@/lib/constants';
import { EventManager } from '@/lib/event-manager';

import type { FolderbaseFileSettings } from './lib/settings';

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

	private registerEvents() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (!(file instanceof TFolder)) {
					return;
				}

				menu.addSeparator();
				menu.addItem((item) => {
					item.setTitle('New table view from folder')
						.setIcon(TABLE_VIEW_ICON)
						.onClick(() => this.createFolderbaseTableFile(file.path));
				});
				menu.addItem((item) => {
					item.setTitle('New kanban view from folder')
						.setIcon(KANBAN_VIEW_ICON)
						.onClick(() => this.createFolderbaseKanbanFile(file.path));
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

	private async createFolderbaseTableFile(folderPath: string): Promise<void> {
		return this.createFolderbaseFile(folderPath, {
			//
			mode: 'table',
			folder: normalizePath(folderPath),
		});
	}

	private async createFolderbaseKanbanFile(folderPath: string): Promise<void> {
		return this.createFolderbaseFile(folderPath, {
			//
			mode: 'kanban',
			folder: normalizePath(folderPath),
		});
	}

	private async createFolderbaseFile(folderPath: string, initialSettings: FolderbaseFileSettings): Promise<void> {
		try {
			const file = await this.app.vault.create(
				`${folderPath}.${FDB_FILE_EXTENSION}`,
				JSON.stringify(initialSettings),
			);

			// Open the file in a new tab
			await this.app.workspace.getLeaf(true).openFile(file);
		} catch (error) {
			// TODO: Display error in alert
			console.log(error);
		}
	}
}
