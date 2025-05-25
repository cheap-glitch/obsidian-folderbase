import { ColumnDef } from '@tanstack/react-table';

export function buildColumns(keys: Set<string>): ColumnDef<any>[] {
	const columns: ColumnDef<any>[] = [];

	for (const key of keys.values()) {
		columns.push({
			header: key,
			accessorKey: key,
		});
	}

	return columns;
}
