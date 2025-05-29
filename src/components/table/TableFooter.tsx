import { flexRender, type Table } from '@tanstack/react-table';

import type { ColumnData } from '@/types/table';

export function TableFooter({ table }: { table: Table<ColumnData> }) {
	return (
		<tfoot>
			{table.getFooterGroups().map((footerGroup) => (
				<tr key={footerGroup.id}>
					{footerGroup.headers.map((header) => (
						<th key={header.id}>
							{header.isPlaceholder
								? null
								: flexRender(header.column.columnDef.footer, header.getContext())}
						</th>
					))}
				</tr>
			))}
		</tfoot>
	);
}
