import { useEffect } from 'react';

import { useSettings } from '@/contexts/settings-context';

import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Table } from '@/components/table/Table';

import { EventManager } from '@/lib/event-manager';

import type { FileData } from '@/lib/files-data';
import type { FolderbaseViewSettings } from '@/lib/settings';
import type { FolderbaseViewMode } from '@/types/settings';

// TODO: Load files contents when switching from initally a table to a kanban view
export function FolderbaseMain({
	initialData,
	initialKeys,
	filePath: viewFilePath,
	folderPath,
	onSettingsUpdated,
}: {
	initialData: FileData[];
	initialKeys: Set<string>;
	filePath: string;
	folderPath: string;
	onSettingsUpdated: (settings: FolderbaseViewSettings) => void;
}) {
	// The store isn't actually driving most of the component updates – it's mostly used
	// to keep a single source of truth for every setting at the top of the component hierarchy
	const settings = useSettings((settings) => settings);

	// Propagate the local settings back up to the `TextFileView` instance
	useEffect(() => {
		onSettingsUpdated(settings);
	});

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
