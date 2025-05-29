import { normalizePath, Plugin, type TAbstractFile, TFile, TFolder } from 'obsidian';

import { TABLE_VIEW_ID, TableView } from '@/views/table';

import { FDB_FILE_EXTENSION } from '@/lib/constants';
import { EventManager } from '@/lib/event-manager';

import './global.css';

export default class FolderbasePlugin extends Plugin {
	onload() {
		// Wait for the app to have loaded all the files in the vault
		this.app.workspace.onLayoutReady(() => {
			this.init();
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(TABLE_VIEW_ID);
	}

	private init() {
		this.registerView(TABLE_VIEW_ID, (leaf) => new TableView(leaf));
		this.registerExtensions([FDB_FILE_EXTENSION], TABLE_VIEW_ID);
		this.registerEvents();

		// TODO: Update already-opened Folderbase files
	}

	private registerEvents() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (!(file instanceof TFolder)) {
					return;
				}

				menu.addItem((item) => {
					item.setTitle('New database view from folder')
						.setIcon('table')
						.onClick(() => this.createFolderbaseFile(file.path));
				});
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
					// await new Promise((resolve) => setTimeout(resolve, 100));
					EventManager.getInstance().emit('file-frontmatter-updated', { file });
				}
			}),
		);
	}

	private async createFolderbaseFile(folderPath: string): Promise<void> {
		try {
			const file = await this.app.vault.create(
				`${folderPath}.${FDB_FILE_EXTENSION}`,
				JSON.stringify({
					//
					folder: normalizePath(folderPath),
				}),
			);

			// Open the file in a new tab
			await this.app.workspace.getLeaf(true).openFile(file);
		} catch (error) {
			// TODO: Display error in alert
			console.log(error);
		}
	}
}
