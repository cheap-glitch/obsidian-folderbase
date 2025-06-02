import type { FolderbaseViewMode } from '@/types/settings';

export const FDB_FILE_EXTENSION = 'fdb';

export const FDB_VIEW_ID = 'obsidian-folderbase';

// TODO: Make this a global setting in the future?
export const FDB_DEFAULT_VIEW_MODE: FolderbaseViewMode = 'table';

export const FDB_VIEW_DEFAULT_TITLES: { [ViewMode in FolderbaseViewMode]: string } = {
	table: 'Folderbase Table',
	kanban: 'Folderbase Kanban Board',
};

export const FDB_VIEW_ICONS: { [ViewMode in FolderbaseViewMode]: string } = {
	table: 'table',
	kanban: 'square-kanban',
};
