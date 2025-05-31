import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { createSettingsStore, type SettingsStore } from '@/stores/settings';

type SettingsStoreApi = ReturnType<typeof createSettingsStore>;
export const SettingsStoreContext = createContext<SettingsStoreApi | undefined>(undefined);

export function SettingsStoreProvider({ children }: { children: ReactNode }) {
	const storeRef = useRef<SettingsStoreApi | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createSettingsStore();
	}

	return <SettingsStoreContext.Provider value={storeRef.current}>{children}</SettingsStoreContext.Provider>;
}

export function useSettingsStore<T>(selector: (store: SettingsStore) => T): T {
	const settingsStoreContext = useContext(SettingsStoreContext);

	if (!settingsStoreContext) {
		throw new Error('useSettingsStore must be used within SettingsStoreProvider');
	}

	return useStore(settingsStoreContext, selector);
}
