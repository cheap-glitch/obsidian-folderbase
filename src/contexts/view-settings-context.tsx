import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { createKanbanViewSettingsStore } from '@/stores/view-settings';

import type { KanbanViewSettings, KanbanViewSettingsStore } from '@/stores/view-settings';

type SettingsStoreApi = ReturnType<typeof createKanbanViewSettingsStore>;
export const SettingsContext = createContext<SettingsStoreApi | undefined>(undefined);

export function ViewSettingsProvider({
	children,
	initialSettings,
}: {
	children: ReactNode;
	initialSettings: KanbanViewSettings['view'];
}) {
	const storeRef = useRef<SettingsStoreApi | null>(null);
	if (!storeRef.current) {
		storeRef.current = createKanbanViewSettingsStore({ view: initialSettings });
	}

	return <SettingsContext.Provider value={storeRef.current}>{children}</SettingsContext.Provider>;
}

export function useViewSettings<T>(selector: (store: KanbanViewSettingsStore) => T): T {
	const settingsStoreContext = useContext(SettingsContext);
	if (!settingsStoreContext) {
		throw new Error('`useViewSettings()` must be used within `<ViewSettingsProvider/>`');
	}

	return useStore(settingsStoreContext, selector);
}
