import { useContext } from 'react';

import { AppContext } from '@/contexts/app-context';

import type { App } from 'obsidian';

export function useApp(): App {
	// biome-ignore lint/style/noNonNullAssertion: Avoid unnecessary runtime checks
	return useContext(AppContext)!;
}
