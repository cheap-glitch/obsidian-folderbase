import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { createSettingsStore, type SettingsStore } from '@/stores/settings';

import type { FolderbaseViewSettings } from '@/lib/settings';

type SettingsStoreApi = ReturnType<typeof createSettingsStore>;
export const SettingsStoreContext = createContext<SettingsStoreApi | undefined>(undefined);

export function SettingsStoreProvider({
	children,
	settings: initialSettings,
}: {
	children: ReactNode;
	settings: FolderbaseViewSettings;
}) {
	const storeRef = useRef<SettingsStoreApi | null>(null);
	if (!storeRef.current) {
		storeRef.current = createSettingsStore(initialSettings);
	}

	return <SettingsStoreContext.Provider value={storeRef.current}>{children}</SettingsStoreContext.Provider>;
}

export function useSettingsStore<T>(selector: (store: SettingsStore) => T): T {
	const settingsStoreContext = useContext(SettingsStoreContext);
	if (!settingsStoreContext) {
		throw new Error('`useSettingsStore` must be used within SettingsStoreProvider');
	}

	return useStore(settingsStoreContext, selector);
}
