import type { SortingFn, RowData } from '@tanstack/react-table';
import type { FormattedFrontMatterValue, ColumnData } from '@/types/table';

declare module '@tanstack/react-table' {
	// Define names of custom sorting functions
	interface SortingFns {
		__custom__sortTags: SortingFn<ColumnData>;
		__custom__sortStatus: SortingFn<ColumnData>;

		sortFileLink: SortingFn<ColumnData>;
	}

	// Define custom table methods
	// biome-ignore lint/correctness/noUnusedVariables: `TableMeta` needs a type parameter in its declaration
	interface TableMeta<TData extends RowData> {
		updateData: (rowIndex: number, columnId: string, value: FormattedFrontMatterValue) => void;
	}
}
