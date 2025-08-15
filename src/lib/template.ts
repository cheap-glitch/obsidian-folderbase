import { TFile, TFolder } from 'obsidian';

export function getDatabaseFileTemplate(file: TFile): TFile | undefined {
	const folder = file.parent?.children.find((child) => child instanceof TFolder && child.name === file.basename) as
		| TFolder
		| undefined;

	return folder ? getDatabaseFolderTemplate(folder) : undefined;
}

export function getDatabaseFolderTemplate(folder: TFolder): TFile | undefined {
	return folder.children.find((child) => child instanceof TFile && child.basename === '__TEMPLATE__') as
		| TFile
		| undefined;
}
