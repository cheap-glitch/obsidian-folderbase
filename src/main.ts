import { normalizePath, Plugin, TFile } from 'obsidian';

import { TABLE_VIEW_ID, TableView } from '@/views/table';

import type { TableData } from '@/types';

export default class FolderbasePlugin extends Plugin {
	onload() {
		// Wait for the app to have loaded all the files in the vault
		this.app.workspace.onLayoutReady(() => {
			this.init();
		});
	}
	onunload() {
		// TODO
	}

	private init() {
		const result = this.buildTableData('TOUCHDESIGNER/Tutoriels');
		if (result instanceof Error) {
			console.error(result);

			return;
		}

		const { keys, data } = result;
		this.registerView(TABLE_VIEW_ID, (leaf) => new TableView(leaf, keys, data));

		this.addRibbonIcon('dice', 'Activate view', () => {
			return this.activateView();
		});
	}

	private async activateView() {
		const { workspace } = this.app;

		const leaf = workspace.getLeaf('tab');
		await leaf?.setViewState({ type: TABLE_VIEW_ID, active: true });
	}

	private buildTableData(folderPath: string): { keys: Set<string>; data: TableData } | Error {
		const folder = this.app.vault.getFolderByPath(normalizePath(folderPath));
		if (folder === null) {
			return new Error(`Could not open folder "${folderPath}"`);
		}

		const keys = new Set<string>();
		const data: TableData = [];

		for (const child of folder.children) {
			if (!(child instanceof TFile)) {
				continue;
			}

			try {
				this.app.fileManager.processFrontMatter(child, (frontmatter) => {
					if (!frontmatter) {
						return;
					}

					data.push({ ...frontmatter });
					for (const key of Object.keys(frontmatter)) {
						keys.add(key);
					}
				});
			} catch (error) {
				return error instanceof Error ? error : new Error(String(error));
			}
		}

		return {
			keys,
			data,
		};
	}
}
