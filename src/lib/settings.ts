export type ContainerType = 'tab' | 'rsplit' | 'lsplit';

export type FolderbaseViewMode = 'table' | 'kanban';

export interface FolderbaseFileSettings {
	mode?: FolderbaseViewMode;
	folder?: string;
}

export interface FolderbaseViewSettings {
	mode: FolderbaseViewMode;
	kanban: {
		columnsKey?: string;
		openCardFilesInNew: ContainerType;
		showCardTitles: boolean;
		showCardFrontmatter: boolean;
	};
}
