import { useEffect } from 'react';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Table } from '@/components/table/Table';

import { useSettingsStore } from '@/contexts/settings-context';
import { EventManager } from '@/lib/event-manager';

import type { FileData } from '@/lib/files-data';
import type { FolderbaseViewMode } from '@/lib/settings';

// TODO: Load files contents when switching from initally a table to a kanban view
export function FolderbaseMain({
	viewFilePath,
	...props
}: {
	data: FileData[];
	keys: Set<string>;
	folderPath: string;
	viewFilePath: string;
}) {
	const settings = useSettingsStore((settings) => settings);

	function handleSetViewMode({ mode, filePath }: { mode?: FolderbaseViewMode; filePath?: string } = {}) {
		if (mode && filePath === viewFilePath) {
			settings.setViewMode(mode);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run hook once when component is mounted
	useEffect(() => {
		EventManager.getInstance().on('set-view-mode', handleSetViewMode);

		return () => {
			EventManager.getInstance().off('set-view-mode', handleSetViewMode);
		};
	}, []);

	switch (settings.mode) {
		case 'table': {
			return <Table {...props} />;
		}

		case 'kanban': {
			return <KanbanBoard {...props} />;
		}
	}
}
