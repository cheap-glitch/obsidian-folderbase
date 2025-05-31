import { createStore } from 'zustand/vanilla';

import type { ContainerType, FolderbaseViewMode, FolderbaseViewSettings } from '../lib/settings';

interface SettingsActions {
	setViewMode: (mode: FolderbaseViewMode) => void;
	setColumnsKey: (key: string) => void;
	setOpenCardFilesInNew: (containerType: ContainerType) => void;
	toggleShowCardTitles: (forced?: boolean) => void;
	toggleShowCardFrontmatter: (forced?: boolean) => void;
}

export type SettingsStore = FolderbaseViewSettings & SettingsActions;

export function createSettingsStore(initialState: FolderbaseViewSettings) {
	return createStore<SettingsStore>()((set) => ({
		...initialState,

		setViewMode: (mode) => set(() => ({ mode })),

		setColumnsKey: (columnsKey) =>
			set(({ kanban }) => ({
				kanban: {
					...kanban,
					columnsKey,
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
