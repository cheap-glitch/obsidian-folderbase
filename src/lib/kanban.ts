import { sortByMatchingOrder } from '@/helpers/arrays';
import { __CUSTOM__CRENEAUX } from './sorting';

import type { FileData } from '@/lib/data';
import type { KanbanCardData } from '@/types/kanban';

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
