import { createContext } from 'react';

import type { KanbanColumnsSettings, KanbanSettings } from '@/lib/settings';
import type { FolderbaseViewMode } from '@/types/settings';

export const SettingsUpdatersContext = createContext<{
	saveViewMode: (mode: FolderbaseViewMode) => Promise<void>;
	saveKanbanViewSettings: (viewSettings: KanbanSettings['view']) => Promise<void>;
	saveKanbanBoardColumnSettings: (groupingKey: string, columnSettings: KanbanColumnsSettings) => Promise<void>;
}>({
	saveViewMode: async () => {},
	saveKanbanViewSettings: async () => {},
	saveKanbanBoardColumnSettings: async () => {},
});
