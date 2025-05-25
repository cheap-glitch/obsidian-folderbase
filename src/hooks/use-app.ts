import { useContext } from 'react';

import { AppContext } from '@/contexts/app-context';

import type { App } from 'obsidian';

export function useApp(): App {
	return useContext(AppContext)!;
}
