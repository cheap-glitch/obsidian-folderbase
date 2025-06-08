import { useContext, useEffect, useState } from 'react';

import { SettingsUpdatersContext } from '@/contexts/settings-updaters-context';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Table } from '@/components/table/Table';

import { EventManager } from '@/lib/event-manager';

import type { FileData } from '@/lib/files-data';
import type { FolderbaseViewMode } from '@/types/settings';

// TODO: Load files contents when switching from initially a table to a kanban view
export function FolderbaseMain({
	initialMode,
	initialData,
	initialKeys,
	filePath: viewFilePath,
	folderPath,
}: {
	initialMode: FolderbaseViewMode;
	initialData: FileData[];
	initialKeys: Set<string>;
	filePath: string;
	folderPath: string;
}) {
	const { saveViewMode } = useContext(SettingsUpdatersContext);

	const [viewMode, setViewMode] = useState(initialMode);

	function handleSetViewMode({ mode, filePath }: { mode?: FolderbaseViewMode; filePath?: string } = {}) {
		if (!mode || filePath !== viewFilePath) {
			return;
		}

		setViewMode(mode);
		void saveViewMode(mode);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run hook once when component is mounted
	useEffect(() => {
		EventManager.getInstance().on('set-view-mode', handleSetViewMode);

		return () => {
			EventManager.getInstance().off('set-view-mode', handleSetViewMode);
		};
	}, []);

	switch (viewMode) {
		case 'table': {
			return (
				<Table
					folderPath={folderPath}
					initialData={initialData}
					initialKeys={initialKeys}
				/>
			);
		}

		case 'kanban': {
			return (
				<KanbanBoard
					initialData={initialData}
					initialKeys={initialKeys}
				/>
			);
		}
	}
}
