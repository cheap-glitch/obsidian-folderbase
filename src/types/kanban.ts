import type { Card, KanbanBoard as KanbanData } from '@caldwell619/react-kanban';
import type { FormattedFileFrontMatter } from './frontmatter';

export interface KanbanCardData extends Card {
	columnId: string;
	filePath: string;
	title: string;
	frontmatter: FormattedFileFrontMatter;
	markdownContent: string;
}

export type KanbanColumnData = KanbanData<KanbanCardData>['columns'][number];
