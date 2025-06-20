import { useRef } from 'react';

import { updateFileFrontMatter } from '@/lib/frontmatter';
import { useApp } from './use-app';

import type { FrontMatterValue } from '@/types/frontmatter';

export function useUpdateFileFrontmatter() {
	const app = useApp();
	const ignoredFilePathEvents = useRef<Set<string>>(new Set<string>());

	return {
		ignoredFilePathEvents,
		setFileFrontmatterProperty: async (
			filePath: string,
			key: string,
			value: FrontMatterValue,
		): Promise<void> => {
			ignoredFilePathEvents.current.add(filePath);

			try {
				await updateFileFrontMatter(app, filePath, (frontmatter) => {
					frontmatter[key] = value;
				});
			} catch (error) {
				console.error(error); // TODO: Display error somewhere
			}
		},
	};
}
