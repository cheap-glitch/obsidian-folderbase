import { useContext, useEffect, useState } from 'react';

import { SettingsUpdatersContext } from '@/contexts/settings-updaters-context';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Table } from '@/components/table/Table';

import { EventManager } from '@/lib/event-manager';

import type { FileData } from '@/lib/files-data';
import type { KanbanSettings } from '@/lib/settings';
import type { FolderbaseViewMode } from '@/types/settings';

// TODO: Load files contents when switching from initially a table to a kanban view
export function FolderbaseMain({
	filePath: viewFilePath,
	folderPath,
	initial,
}: {
	filePath: string;
	folderPath: string;
	initial: {
		mode: FolderbaseViewMode;
		data: FileData[];
		keys: Set<string>;
		boardSettings: KanbanSettings['board'];
	};
}) {
	const { saveViewMode } = useContext(SettingsUpdatersContext);

	const [viewMode, setViewMode] = useState(() => initial.mode);

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
					initial={{
						data: initial.data,
						keys: initial.keys,
					}}
				/>
			);
		}

		case 'kanban': {
			return <KanbanBoard initial={initial} />;
		}
	}
}
