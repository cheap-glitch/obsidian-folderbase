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
	{ signal, withContents }: { signal?: AbortSignal; withContents?: boolean } = {},
): Promise<{ data: FileData[]; allFrontmatterKeys: Set<string> } | Error> {
	const allFrontmatterKeys = new Set<string>();
	const promises: Promise<FileData>[] = [];

	if (signal?.aborted) {
		return { data: [], allFrontmatterKeys };
	}

	for (const file of folder.children) {
		if (!(file instanceof TFile)) {
			continue;
		}

		// __CUSTOM__
		if (file.basename === '__TEMPLATE__') {
			continue;
		}

		promises.push(
			(async (): Promise<FileData> => {
				if (signal?.aborted) {
					throw undefined;
				}

				return {
					path: file.path,
					basename: file.basename,
					frontmatter: await getFormattedFileFrontMatter(app, file, folder.path, allFrontmatterKeys),
					markdownContent: withContents
						? removeFrontMatterFromFileContents(app, file, await app.vault.cachedRead(file))
						: '',
				};
			})(),
		);
	}

	try {
		const data = await Promise.all(promises);

		return {
			data,
			allFrontmatterKeys,
		};
	} catch (error) {
		return toError(error);
	}
}
