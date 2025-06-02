import type { FormattedFileFrontMatter } from './frontmatter';

export interface KanbanColumnData {
	id: string;
	title: string;
	cardsIds: string[];
}

export interface KanbanCardData {
	id: string;
	title: string;
	data: {
		filePath: string;
		frontmatter: FormattedFileFrontMatter;
		markdownContent: string;
	};
}

export interface KanbanPosition {
	columnId: string;
	index: number;
}

// export type KanbanColumnData = KanbanBoardData<KanbanCardData>['columns'][number];
