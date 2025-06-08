import { createContext } from 'react';

import type { KanbanSettings } from '@/lib/settings';

export const KanbanBoardSettingsContext = createContext<KanbanSettings['board']>({
	groupingKey: '',
	columns: {},
});
