import { type App, normalizePath, TFile } from 'obsidian';

import { toError } from '@/helpers/errors';
import { isWikiLink, parseWikiLink } from '@/helpers/links';

import type { ColumnData, FormattedFrontMatterValue, FrontMatterValue } from '@/types/table';

// TODO: Wrap those functions in a class to avoid passing the app handle around?

export async function buildTableData(
	app: App,
	folderPath: string,
): Promise<{ keys: Set<string>; data: ColumnData[] } | Error> {
	const folder = app.vault.getFolderByPath(normalizePath(folderPath));
	if (folder === null) {
		return new Error(`Could not open folder "${folderPath}"`);
	}

	const keys = new Set<string>();

	const promises: Promise<ColumnData>[] = [];
	for (const file of folder.children)
		if (file instanceof TFile) {
			promises.push(processFileFrontMatter(app, keys, folderPath, file));
		}

	try {
		const data: ColumnData[] = await Promise.all(promises);

		return {
			keys,
			data,
		};
	} catch (error) {
		return toError(error);
	}
}

export async function processFileFrontMatter(
	app: App,
	keys: Set<string>,
	folderPath: string,
	file: TFile,
): Promise<ColumnData> {
	const data: ColumnData = {
		filelink: {
			href: file.path,
			anchor: file.basename,
		},
		frontmatter: {},
	};

	await app.fileManager.processFrontMatter(file, (frontmatter) => {
		data.frontmatter = processFrontMatter(app, keys, folderPath, frontmatter);
	});

	return data;
}

function processFrontMatter(
	app: App,
	keys: Set<string>,
	folderPath: string,
	frontmatter: Record<string, FrontMatterValue>,
): Record<string, FormattedFrontMatterValue> {
	const data: Record<string, FormattedFrontMatterValue> = {};

	for (const [key, value] of Object.entries(frontmatter)) {
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

	for (const key of Object.keys(frontmatter)) {
		keys.add(key);
	}

	return data;
}
