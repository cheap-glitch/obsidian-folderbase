import { sortByMatchingOrder } from '@/helpers/arrays';
import { capitalize } from '@/helpers/text';

import type { FileData } from '@/lib/files-data';
import type { ColumnsOrdering } from '@/lib/settings';
import type { KanbanCardData, KanbanColumnData } from '@/types/kanban';

export function buildInitialColumns(
	cards: KanbanCardData[],
	{
		columnsKey,
		columnsOrder,
		columnsOrdering,
	}: {
		//
		columnsKey: string;
		columnsOrder?: string[];
		columnsOrdering?: ColumnsOrdering;
	},
): KanbanColumnData[] {
	const columnIds = new Set<string>(cards.map((card) => String(card.data.frontmatter[columnsKey])));
	const sortedColumnIds = columnsOrder
		? sortByMatchingOrder({
				model: columnsOrder,
				input: [...columnIds],
			})
		: [...columnIds];

	return sortedColumnIds.map((id) => {
		const ordering = columnsOrdering?.[id];
		const columnCards = cards.filter((card) => card.data.frontmatter[columnsKey] === id);
		const sortedColumnCards = Array.isArray(ordering)
			? sortByMatchingOrder<string, KanbanCardData>({
					model: ordering,
					input: columnCards,
					matcher: (card) => card.id,
				})
			: columnCards;

		return {
			id,
			title: capitalize(id),
			cardsIds: sortedColumnCards.map((card) => card.id),
		};
	});
}

export function buildKanbanCards(data: FileData[]): KanbanCardData[] {
	return data.map(({ path, basename, frontmatter, markdownContent }) => ({
		id: path,
		title: basename,
		data: {
			filePath: path,
			frontmatter,
			markdownContent,
		},
	}));
}
