import { type App, TFile, type TFolder } from 'obsidian';

import { toError } from '@/helpers/errors';
import { removeFrontMatterFromFileContents } from '@/helpers/frontmatter';
import { getFormattedFileFrontMatter } from '@/lib/frontmatter';

import type { FormattedFileFrontMatter } from '@/types/frontmatter';

export interface FileData {
	path: string;
	basename: string;
	frontmatter: FormattedFileFrontMatter;
	markdownContent: string;
}

export async function collateFilesData(
	app: App,
	folder: TFolder,
	{ withContents }: { withContents: boolean },
): Promise<{ data: FileData[]; allFrontmatterKeys: Set<string> } | Error> {
	const keys = new Set<string>();
	const promises: Promise<FileData>[] = [];

	for (const file of folder.children) {
		if (!(file instanceof TFile)) {
			continue;
		}

		promises.push(
			(async (): Promise<FileData> => ({
				path: file.path,
				basename: file.basename,
				frontmatter: await getFormattedFileFrontMatter(app, file, folder.path, keys),
				markdownContent: withContents
					? removeFrontMatterFromFileContents(app, file, await app.vault.cachedRead(file))
					: '',
			}))(),
		);
	}

	try {
		const data = await Promise.all(promises);

		return {
			data,
			allFrontmatterKeys: keys,
		};
	} catch (error) {
		return toError(error);
	}
}
