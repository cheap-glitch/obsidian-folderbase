import { type App, normalizePath } from 'obsidian';

import type { FileLink } from '@/types/table';

const WIKI_LINK_REGEX = /^\[\[[^\]]+\]\]$/u;

export function parseWikiLink(app: App, link: string, folderPath: string): FileLink | string {
	const linkTarget = app.metadataCache.getFirstLinkpathDest(link, normalizePath(folderPath));
	console.log(link, linkTarget);

	if (!linkTarget) {
		return link;
	}

	return {
		href: linkTarget.path,
		anchor: link.replaceAll('[', '').replaceAll(']', ''),
	};
}

export function isWikiLink(link: string): boolean {
	return WIKI_LINK_REGEX.test(link);
}
