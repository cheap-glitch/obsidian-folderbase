import { Cell } from '@/components/table/cells/Cell';
import { EditableCell } from '@/components/table/cells/EditableCell';
import { Link } from '@/components/ui/Link';

import { capitalize } from '@/helpers/text';

import type { ColumnDef, Getter } from '@tanstack/react-table';
import type { CellInputType, ColumnData, FormattedFrontMatterValue, FrontMatterValue } from '@/types/table';

export function buildColumns({
	keys,
	onFileLinkClick,
	updateFileFrontmatter,
}: {
	keys: Set<string>;
	onFileLinkClick: (filePath: string) => void;
	updateFileFrontmatter: (filePath: string, key: string, value: FrontMatterValue) => Promise<void>;
}): ColumnDef<ColumnData>[] {
	const columns: ColumnDef<ColumnData>[] = [
		{
			id: '__FDB_FILELINK__',
			header: 'File',
			accessorKey: 'filelink',
			enableSorting: true,
			enableMultiSort: true,
			sortingFn: 'sortFileLink',
			cell: ({ getValue }: { getValue: Getter<ColumnData['filelink']> }) => (
				<Link
					href={getValue().href}
					onClick={onFileLinkClick}
				>
					{getValue().anchor}
				</Link>
			),
		},
	];

	for (const key of keys.values()) {
		// TODO: Handle these settings in a better way
		let editable = false;
		let inputType: CellInputType = 'text';

		const __custom__extraColumnOptions: Partial<ColumnDef<ColumnData>> = (() => {
			switch (key) {
				case 'tags': {
					return {
						enableSorting: true,
						enableMultiSort: true,
						sortingFn: '__custom__sortTags',
					};
				}

				case 'Statut': {
					editable = true;
					inputType = 'select';

					return {
						enableSorting: true,
						enableMultiSort: true,
						sortingFn: '__custom__sortStatus',
						sortDescFirst: false,
					};
				}

				default: {
					return {};
				}
			}
		})();

		columns.push({
			id: key,
			header: capitalize(key),
			accessorFn: (row) => row.frontmatter[key] ?? null,

			enableSorting: false,
			...__custom__extraColumnOptions,

			cell: editable
				? (params) => (
						<EditableCell
							{...params}
							inputType={inputType}
							updateFileFrontmatter={updateFileFrontmatter}
						/>
					)
				: ({ getValue }) => (
						<Cell
							value={getValue<FormattedFrontMatterValue>()}
							onFileLinkClick={onFileLinkClick}
						/>
					),
		});
	}

	return columns;
}
