import { createStore } from 'zustand/vanilla';

import type { KanbanSettings } from '@/lib/settings';
import type { ContainerType } from '@/types/settings';

interface SettingsActions {
	// setViewMode: (mode: FolderbaseViewMode) => void;
	// setGroupingKey: (key: string) => void;
	// setColumnsOrder: (columnIds: string[]) => void;
	// setColumnCardsOrder: (groupingKey: string, columnId: string, order: string[]) => void;
	// setColumnsCardsOrders: (groupingKey: string, cardsOrders: Record<string, string[]>) => void;
	setShowCardContents: (show: boolean) => void;
	toggleShowCardTitles: (forced?: boolean) => void;
	toggleShowCardFrontmatter: (forced?: boolean) => void;
	setOpenCardFilesInNew: (containerType: ContainerType) => void;
}

export type KanbanViewSettings = { /*mode: FolderbaseViewMode;*/ view: KanbanSettings['view'] };
export type KanbanViewSettingsStore = KanbanViewSettings & { actions: SettingsActions };

export function createKanbanViewSettingsStore(initalSettings: KanbanViewSettings) {
	return createStore<KanbanViewSettingsStore>()((set) => ({
		...initalSettings,
		actions: {
			// setViewMode: (mode) => set((settings) => ({ ...settings, mode })),

			setShowCardContents: (show) =>
				set(({ view }) => ({
					view: {
						...view,
						showCardContents: show,
					},
				})),

			toggleShowCardTitles: (forced) =>
				set(({ view }) => ({
					view: {
						...view,
						showCardTitles: forced ?? !view.showCardTitles,
					},
				})),

			toggleShowCardFrontmatter: (forced) =>
				set(({ view }) => ({
					view: {
						...view,
						showCardFrontmatter: forced ?? !view.showCardFrontmatter,
					},
				})),

			setOpenCardFilesInNew: (containerType) =>
				set((settings) => ({
					...settings,
					openCardFilesInNew: containerType,
				})),
		},
	}));
}
