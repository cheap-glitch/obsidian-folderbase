import { FDB_FILE_EXTENSION } from '@/lib/constants';

import type { App, TFile } from 'obsidian';

export function isInFolder(
	file: TFile,
	folderPath: string,
	{ recursive = false }: { recursive?: boolean } = {},
): boolean {
	if (!recursive) {
		return file.parent?.path === folderPath;
	}

	let parent = file.parent;
	while (parent) {
		if (parent.path === folderPath) {
			return true;
		}

		parent = parent.parent;
	}

	return false;
}

export function openFileInNewTab(app: App, filePath: string) {
	const leaf = app.workspace.getLeaf('tab');
	const file = app.vault.getFileByPath(filePath);

	if (file) {
		leaf?.openFile(file, { active: true });
	}
}

export function getDefaultFolderPath(filePath: string): string {
	// Remove the file extension
	return filePath.slice(0, filePath.length - (FDB_FILE_EXTENSION.length + 1));
}
