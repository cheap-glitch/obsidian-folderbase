import { type App, TFile, type TFolder } from 'obsidian';

import { toError } from '@/helpers/errors';
import { removeFrontMatterFromFileContents } from '@/helpers/markdown';

import type { KanbanCardData, KanbanColumnData } from '@/types/kanban';
import type { FileFrontMatter } from '@/types/table';

// TODO: De-duplicate logic in common with `buildTableData()` & store common data somewhere?
// (or get it from the table file if it already exists, and same in reverse)
export async function buildKanbanData(app: App, folder: TFolder): Promise<{ columns: KanbanColumnData[] } | Error> {
	const promises: Promise<KanbanCardData>[] = [];

	for (const file of folder.children) {
		if (!(file instanceof TFile)) {
			continue;
		}

		promises.push(
			(async (): Promise<KanbanCardData> => {
				const card: KanbanCardData = {
					id: file.path,
					filePath: file.path,
					columnId: '<none>',
					title: file.basename,
					markdownContent: removeFrontMatterFromFileContents(app, file, await app.vault.cachedRead(file)),
				};

				await app.fileManager.processFrontMatter(file, (frontmatter?: FileFrontMatter) => {
					// __CUSTOM__
					card.columnId = String(frontmatter?.Mois ?? '<none>');
				});

				return card;
			})(),
		);
	}

	try {
		const cards = await Promise.all(promises);

		const columnIds = new Set(cards.map(({ columnId }) => columnId).toSorted());
		const columns: KanbanColumnData[] = [...columnIds.values()].map((id) => ({
			id,
			title: id,
			cards: cards.filter((card) => card.columnId === id),
		}));

		return {
			columns,
		};
	} catch (error) {
		return toError(error);
	}
}
