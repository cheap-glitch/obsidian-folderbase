import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Table } from '@/components/table/Table';

import { useSettingsStore } from '@/contexts/settings-context';

import type { FileData } from '@/lib/files-data';

export function FolderbaseMain(props: { data: FileData[]; keys: Set<string>; folderPath: string }) {
	const mode = useSettingsStore(({ mode }) => mode);

	// TODO: Load files contents when switching from initally a table to a kanban view

	switch (mode) {
		case 'table': {
			return <Table {...props} />;
		}

		case 'kanban': {
			return <KanbanBoard {...props} />;
		}
	}
}
