import { isWikiLink, parseWikiLink } from '@/helpers/links';

import type { App, TFile } from 'obsidian';
import type { FileFrontMatter, FormattedFrontMatterValue } from '@/types/frontmatter';

export async function getFormattedFileFrontMatter(
	app: App,
	file: TFile,
	folderPath: string,
	keys?: Set<string>,
): Promise<Record<string, FormattedFrontMatterValue>> {
	const data: Record<string, FormattedFrontMatterValue> = {};

	await app.fileManager.processFrontMatter(file, (frontmatter?: FileFrontMatter) => {
		for (const [key, value] of Object.entries(frontmatter ?? {})) {
			// Wikilinks
			if (typeof value === 'string' && isWikiLink(value)) {
				data[key] = parseWikiLink(app, value, folderPath);

				continue;
			}

			if (Array.isArray(value)) {
				data[key] = value.map((item) =>
					typeof value === 'string' && isWikiLink(value) ? parseWikiLink(app, value, folderPath) : item,
				);

				continue;
			}

			data[key] = value;
		}

		if (keys) {
			for (const key of Object.keys(frontmatter ?? {})) {
				keys.add(key);
			}
		}
	});

	return data;
}

export async function updateFileFrontMatter(
	app: App,
	filePath: string,
	updater: (frontmatterObject: FileFrontMatter) => void,
): Promise<void> {
	const file = app.vault.getFileByPath(filePath);
	if (!file) {
		throw new Error(`Could not find file at "${filePath}"`);
	}

	await app.fileManager.processFrontMatter(file, (frontmatterObject?: FileFrontMatter) => {
		if (frontmatterObject) {
			updater(frontmatterObject);
		}
	});
}
