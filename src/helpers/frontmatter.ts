import { replaceTextAtPosition } from '@/helpers/text';

import type { App, TFile } from 'obsidian';
import type { FileFrontMatter } from '@/types/frontmatter';

export function removeFrontMatterFromFileContents(app: App, file: TFile, fileContents: string): string {
	const position = app.metadataCache.getFileCache(file)?.frontmatterPosition;
	if (!position) {
		return fileContents;
	}

	return replaceTextAtPosition(fileContents, position, '');
}

const FRONTMATTER_SEPARATOR = '---';

export function generateFrontMatterText(frontmatterObject: FileFrontMatter): string {
	const lines = [FRONTMATTER_SEPARATOR];

	for (const [key, value] of Object.entries(frontmatterObject)) {
		const separator = Array.isArray(value) ? '\n' : ' ';
		const stringifiedValue = Array.isArray(value) ? stringifyToYAMLArray(value) : String(value);

		lines.push(`${key}:${separator}${stringifiedValue}`);
	}

	lines.push(FRONTMATTER_SEPARATOR, '');

	return lines.join('\n');
}

function stringifyToYAMLArray<T>(array: T[]): string {
	return array.map((element) => `  - ${element}`).join('\n');
}
