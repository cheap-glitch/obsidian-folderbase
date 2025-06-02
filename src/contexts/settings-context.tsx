import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { createSettingsStore, type SettingsStore } from '@/stores/settings';

import type { FolderbaseViewSettings } from '@/lib/settings';

type SettingsStoreApi = ReturnType<typeof createSettingsStore>;
export const SettingsContext = createContext<SettingsStoreApi | undefined>(undefined);

export function SettingsProvider({
	children,
	initialSettings,
}: {
	children: ReactNode;
	initialSettings: FolderbaseViewSettings;
}) {
	const storeRef = useRef<SettingsStoreApi | null>(null);
	if (!storeRef.current) {
		storeRef.current = createSettingsStore(initialSettings);
	}

	return <SettingsContext.Provider value={storeRef.current}>{children}</SettingsContext.Provider>;
}

export function useSettings<T>(selector: (store: SettingsStore) => T): T {
	const settingsStoreContext = useContext(SettingsContext);
	if (!settingsStoreContext) {
		throw new Error('`useSettings()` must be used within `<SettingsProvider/>`');
	}

	return useStore(settingsStoreContext, selector);
}
