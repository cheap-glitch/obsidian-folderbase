import { flexRender, type Table } from '@tanstack/react-table';

import type { ColumnData } from '@/types/table';

export function TableHead({ table }: { table: Table<ColumnData> }) {
	return (
		<thead>
			{table.getHeaderGroups().map((headerGroup) => (
				<tr key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						if (header.isPlaceholder) {
							return <th key={header.id} />;
						}

						if (!header.column.getCanSort()) {
							return (
								<th key={header.id}>
									{flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							);
						}

						return (
							<th
								key={header.id}
								className="fdb-sortable-header"
							>
								<button
									type="button"
									className="fdb-header-button"
									title={
										header.column.getCanSort()
											? header.column.getNextSortingOrder() === 'asc'
												? 'Sort ascending'
												: 'Sort descending'
											: undefined
									}
									onClick={header.column.getToggleSortingHandler()}
									onKeyDown={() => {
										// TODO: Add keyboard support
										// e.g. <Tab> to switch headers, <ArrowUp>/<ArrowDown> to set sorting, <Enter>/<Space> to toggle
									}}
								>
									{flexRender(header.column.columnDef.header, header.getContext())}
								</button>
							</th>
						);
					})}
				</tr>
			))}
		</thead>
	);
}
