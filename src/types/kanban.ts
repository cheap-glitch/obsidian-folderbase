import type { Card, KanbanBoard as KanbanData } from '@caldwell619/react-kanban';

export interface KanbanCardData extends Card {
	filePath: string;
	columnId: string;
	title: string;
	markdownContent: string;
}

export type KanbanColumnData = KanbanData<KanbanCardData>['columns'][number];
