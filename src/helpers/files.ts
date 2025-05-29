import type { TFile } from 'obsidian';

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
