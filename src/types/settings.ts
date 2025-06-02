export const CONTAINER_TYPES = ['tab', 'split', 'window'] as const;
export type ContainerType = (typeof CONTAINER_TYPES)[number];

export const FOLDERBASE_VIEW_MODES = ['table', 'kanban'] as const;
export type FolderbaseViewMode = (typeof FOLDERBASE_VIEW_MODES)[number];

export const KANBAN_COLUMN_SORTING_MODES = ['asc', 'desc'] as const;
export type kanbanColumnSortingMode = (typeof KANBAN_COLUMN_SORTING_MODES)[number];
