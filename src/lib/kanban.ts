import { sortByMatchingOrder } from '@/helpers/arrays';
import { __CUSTOM__CRENEAUX } from './sorting';

import type { FileData } from '@/lib/files-data';
import type { KanbanCardData } from '@/types/kanban';

/*
export function buildInitialColumns(
	cards: KanbanCardData[],
	{
		groupingKey,
		columnsOrder,
		columnsCardsOrders,
	}: {
		//
		groupingKey: string;
		columnsOrder?: string[];
		columnsCardsOrders?: Record<string, string[]>;
	},
): KanbanColumnData[] {
	const columnIds = new Set<string>(cards.map((card) => String(card.data.frontmatter[groupingKey])));
	const sortedColumnIds = columnsOrder
		? sortByMatchingOrder({
				model: columnsOrder,
				input: [...columnIds],
			})
		: [...columnIds];

	return sortedColumnIds.map((id) => {
		const ordering = columnsCardsOrders?.[id];
		const columnCards = cards.filter((card) => card.data.frontmatter[groupingKey] === id);
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
*/

export function getSortedColumnCards({
	columnId,
	cards,
	groupingKey,
	columnCardsOrder,
}: {
	columnId: string;
	cards: KanbanCardData[];
	groupingKey: string;
	columnCardsOrder?: string[];
}): KanbanCardData[] {
	const columnCards = cards.filter((card) => card.data.frontmatter[groupingKey] === columnId);

	return columnCardsOrder
		? sortByMatchingOrder({
				input: columnCards,
				model: groupingKey === 'Mois' ? __CUSTOM__CRENEAUX : columnCardsOrder,
				matcher: groupingKey === 'Mois' ? (card) => card.data.frontmatter.Créneau : (card) => card.id, // __CUSTOM__
			})
		: columnCards;
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
