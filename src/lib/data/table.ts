import { type App, TFile, type TFolder } from 'obsidian';

import { toError } from '@/helpers/errors';
import { getFormattedFileFrontMatter } from '@/lib/data/frontmatter';

import type { ColumnData } from '@/types/table';

export async function buildTableData(
	app: App,
	folder: TFolder,
): Promise<{ keys: Set<string>; data: ColumnData[] } | Error> {
	const keys = new Set<string>();
	const promises: Promise<ColumnData>[] = [];

	for (const file of folder.children) {
		if (!(file instanceof TFile)) {
			continue;
		}

		promises.push(
			(async (): Promise<ColumnData> => {
				return {
					filelink: {
						href: file.path,
						anchor: file.basename,
					},
					frontmatter: await getFormattedFileFrontMatter(app, file, folder.path, keys),
				};
			})(),
		);
	}

	try {
		const data = await Promise.all(promises);

		return {
			keys,
			data,
		};
	} catch (error) {
		return toError(error);
	}
}
