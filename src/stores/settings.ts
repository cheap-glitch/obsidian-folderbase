import { createStore } from 'zustand/vanilla';

import type { ColumnsOrdering, FolderbaseViewSettings } from '@/lib/settings';
import type { ContainerType, FolderbaseViewMode } from '@/types/settings';

interface SettingsActions {
	setViewMode: (mode: FolderbaseViewMode) => void;
	setColumnsKey: (key: string) => void;
	setColumnsOrder: (columnIds: string[]) => void;
	setColumnsOrdering: (columnsOrdering: ColumnsOrdering) => void;
	setOpenCardFilesInNew: (containerType: ContainerType) => void;
	toggleShowCardTitles: (forced?: boolean) => void;
	toggleShowCardFrontmatter: (forced?: boolean) => void;
}

export interface KanbanViewSettings {
	showCardTitles: boolean;
	showCardFrontmatter: boolean;
}

export type SettingsStore = FolderbaseViewSettings & SettingsActions;

export function createSettingsStore(initialState: FolderbaseViewSettings) {
	return createStore<SettingsStore>()((set) => ({
		...initialState,

		setViewMode: (mode) => set(() => ({ mode })),

		setColumnsKey: (columnsKey) => {
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					columnsKey,
				},
			}));
		},

		setColumnsOrder: (columnIds) =>
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					columnsOrder: columnIds,
				},
			})),

		setColumnsOrdering: (columnsOrdering) =>
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					columnsOrdering,
				},
			})),

		setOpenCardFilesInNew: (containerType) =>
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					openCardFilesInNew: containerType,
				},
			})),

		toggleShowCardTitles: (forced) =>
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					showCardTitles: forced ?? !kanban.showCardTitles,
				},
			})),

		toggleShowCardFrontmatter: (forced) =>
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					showCardFrontmatter: forced ?? !kanban.showCardFrontmatter,
				},
			})),
	}));
}
